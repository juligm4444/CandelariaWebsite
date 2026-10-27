/**
 * Geometry and motion of the Team carousel: the ring of 3D area logos.
 *
 * The numbers are the "Round Carousel" component's, carried over into
 * three.js units with one logo = 1 unit wide (the original card is 300px):
 * spacing 3, a 7° tilt towards the viewer, perspective 3000px (= 10 logo
 * widths), and half its default speed (7 -> 3.5, i.e. 21°/s).
 *
 * Kept free of three.js so the DOM side (drag, names, URL) can use it
 * without pulling the 3D bundle.
 */

const SPACING = 3;

export const RING_TILT_DEG = 7;
/** Camera distance from the front logo, in logo widths (perspective / card width). */
export const RING_DISTANCE = 10;
/** Autoplay speed: the component's `speed * 6` °/s, at half its default speed. */
export const RING_DEG_PER_SEC = 3.5 * 6;

export function ringRadius(count: number): number {
  return (1 + SPACING * 0.15) / (2 * Math.tan(Math.PI / count));
}

export function ringAngle(count: number): number {
  return 360 / count;
}

/**
 * Width of the front plane the camera shows, in logo widths. Wide stages
 * show the whole ring (its sides sit a radius further back, so they project
 * at RING_DISTANCE / (RING_DISTANCE + radius) of their size); narrow ones
 * (phones) zoom in on the front logo and let the sides run off the edges, so
 * the logo in front stays big enough to tap.
 */
export function visibleWidth(count: number, narrow: boolean): number {
  if (narrow) return 2.7;
  const radius = ringRadius(count);
  return (2 * radius * (RING_DISTANCE / (RING_DISTANCE + radius)) + 1) * 1.12;
}

function mod(value: number, by: number): number {
  return ((value % by) + by) % by;
}

/** Index of the logo facing the viewer at ring rotation `rot` (degrees). */
export function frontIndex(rot: number, count: number): number {
  return mod(Math.round(-rot / ringAngle(count)), count);
}

/** The rotation that brings `index` to the front, by the shortest way from `from`. */
export function rotationFor(index: number, count: number, from: number): number {
  return from + (mod(-index * ringAngle(count) - from + 180, 360) - 180);
}

/**
 * Shared, mutable motion state. The DOM layer writes it (drag, picks,
 * releasing), the 3D layer advances it every frame. It lives in a ref, never
 * in React state: it changes 60 times a second.
 */
export type RingMotion = {
  /** Ring rotation in degrees; positive turns the front to the right. */
  rot: number;
  /** Fling velocity after a drag, °/s. */
  vel: number;
  /** Turning on its own. Off from the first drag or pick until the block is left. */
  auto: boolean;
  dragging: boolean;
  /** Rotation being eased to (a pick, or the snap after a fling). */
  target: number | null;
  /** A drag ended: when the fling dies, snap to the nearest logo and select it. */
  settle: boolean;
};

export function createRingMotion(rot = 0, auto = true): RingMotion {
  return { rot, vel: 0, auto, dragging: false, target: null, settle: false };
}
