/**
 * Image-sequence store for scroll scrubbing.
 *
 * Holding every frame decoded would cost ~5.8 MB per 1600px frame (about
 * 560 MB for the hero), which no phone survives. So the store keeps:
 *
 * - every frame's *encoded* bytes (AVIF, ~40 KB each), fetched coarse-first,
 *   so a rough version of the whole clip is scrubbable almost immediately;
 * - a *decoded* ImageBitmap only for a small window around the current frame,
 *   decoded off the main thread with createImageBitmap, ahead of the scroll
 *   direction first, and closed again once the window moves on.
 *
 * When the exact frame is not decoded yet, `frame()` returns the nearest one
 * that is, so fast scrubbing degrades to fewer distinct frames rather than to
 * a blank canvas or a main-thread decode stall.
 */

const MAX_PARALLEL_DECODES = 3;
const FETCH_CONCURRENCY = 6;

/**
 * 0, last, middle, then the midpoints of every half, quarter, eighth... Every
 * prefix of this order is an evenly spread sample of the clip.
 */
export function coarseFirstOrder(count: number): number[] {
  const order: number[] = [];
  const seen = new Uint8Array(count);
  const push = (i: number) => {
    if (i >= 0 && i < count && !seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(count - 1);
  const queue: [number, number][] = [[0, count - 1]];
  while (queue.length) {
    const [a, b] = queue.shift()!;
    if (b - a < 2) continue;
    const mid = Math.floor((a + b) / 2);
    push(mid);
    queue.push([a, mid], [mid, b]);
  }
  for (let i = 0; i < count; i++) push(i);
  return order;
}

export class FrameStore {
  readonly count: number;
  private readonly urls: string[];
  private readonly windowSize: number;
  private readonly blobs: (Blob | null)[];
  private readonly bitmaps: (ImageBitmap | null)[];
  private readonly decoding = new Set<number>();
  private current = 0;
  private direction: 1 | -1 = 1;
  private disposed = false;

  /** Called when a frame inside the window finishes decoding. */
  onFrameReady: ((index: number) => void) | null = null;

  constructor(urls: string[], windowSize = 5) {
    this.urls = urls;
    this.count = urls.length;
    this.windowSize = windowSize;
    this.blobs = new Array(this.count).fill(null);
    this.bitmaps = new Array(this.count).fill(null);
  }

  /**
   * Fetches every frame, coarse-first. Resolves `false` when the browser
   * cannot decode the format (no AVIF support), in which case the caller
   * keeps showing its static poster.
   *
   * `onCoarse` reports progress, 0 to 1, over the first `coarseCount` frames
   * of the order: what the page needs before it can be shown.
   */
  async load(coarseCount: number, onCoarse: (fraction: number) => void): Promise<boolean> {
    const order = coarseFirstOrder(this.count);
    const coarse = new Set(order.slice(0, Math.max(1, coarseCount)));
    let coarseDone = 0;

    // Probe with the first frame: fetch and decode it before anything else.
    const first = order[0]!;
    try {
      const blob = await this.fetchBlob(first, 'high');
      if (this.disposed) return false;
      this.bitmaps[first] = await createImageBitmap(blob);
    } catch {
      return false;
    }
    coarseDone++;
    onCoarse(coarseDone / coarse.size);
    this.onFrameReady?.(first);

    let cursor = 1;
    const worker = async () => {
      while (cursor < order.length && !this.disposed) {
        const index = order[cursor++]!;
        try {
          await this.fetchBlob(index, coarse.has(index) ? 'high' : 'low');
        } catch {
          continue; // A missing frame is covered by its neighbours.
        }
        if (coarse.has(index)) {
          coarseDone++;
          onCoarse(Math.min(1, coarseDone / coarse.size));
        }
        this.pump();
      }
    };
    await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, worker));
    onCoarse(1);
    return !this.disposed;
  }

  /** Moves the decode window to `position` (fractional frame index). */
  focus(position: number): void {
    const index = Math.max(0, Math.min(this.count - 1, Math.round(position)));
    if (index !== this.current) {
      this.direction = index > this.current ? 1 : -1;
      this.current = index;
    }
    this.pump();
  }

  /** Exact decoded frame, or null. */
  exact(index: number): ImageBitmap | null {
    return this.bitmaps[index] ?? null;
  }

  /** Exact frame if decoded, otherwise the nearest decoded one. */
  frame(index: number): ImageBitmap | null {
    const exact = this.bitmaps[index];
    if (exact) return exact;
    for (let d = 1; d < this.count; d++) {
      const before = this.bitmaps[index - d];
      if (before) return before;
      const after = this.bitmaps[index + d];
      if (after) return after;
    }
    return null;
  }

  dispose(): void {
    this.disposed = true;
    this.onFrameReady = null;
    for (const bitmap of this.bitmaps) bitmap?.close();
    this.bitmaps.fill(null);
    this.blobs.fill(null);
  }

  private async fetchBlob(index: number, priority: RequestPriority): Promise<Blob> {
    const response = await fetch(this.urls[index]!, { priority });
    if (!response.ok) throw new Error(`frame ${index}: ${response.status}`);
    const blob = await response.blob();
    this.blobs[index] = blob;
    return blob;
  }

  private pump(): void {
    if (this.disposed) return;
    const { current, direction, windowSize } = this;

    // Close what drifted out of the window. Frame 0 stays: it is the rest
    // frame at the top of the page.
    for (let i = 1; i < this.count; i++) {
      const bitmap = this.bitmaps[i];
      if (bitmap && Math.abs(i - current) > windowSize + 2) {
        bitmap.close();
        this.bitmaps[i] = null;
      }
    }

    // Decode inside the window, nearest first, ahead of the scroll first.
    for (let d = 0; d <= windowSize; d++) {
      for (const index of d === 0 ? [current] : [current + d * direction, current - d * direction]) {
        if (this.decoding.size >= MAX_PARALLEL_DECODES) return;
        if (index < 0 || index >= this.count) continue;
        if (this.bitmaps[index] || this.decoding.has(index) || !this.blobs[index]) continue;
        void this.decode(index);
      }
    }
  }

  private async decode(index: number): Promise<void> {
    this.decoding.add(index);
    try {
      const bitmap = await createImageBitmap(this.blobs[index]!);
      if (this.disposed || Math.abs(index - this.current) > this.windowSize + 2) {
        bitmap.close();
      } else {
        this.bitmaps[index] = bitmap;
        this.onFrameReady?.(index);
      }
    } catch {
      // Undecodable frame: neighbours cover it.
    } finally {
      this.decoding.delete(index);
      this.pump();
    }
  }
}
