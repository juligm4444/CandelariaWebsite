/**
 * Tiny shared registry of "things worth waiting for" during the first load.
 *
 * A component that needs assets before the page is presentable (the home
 * hero needs its first video frames) registers a task and reports progress
 * from 0 to 1. The site loader reads the weighted average every frame and
 * will not reveal the page until it reaches 1, or until its own time cap runs
 * out. Pages that register nothing are gated by document readiness alone.
 */

type Task = { weight: number; progress: number };

const tasks = new Map<string, Task>();

/** Registers (or resets) a task and returns its progress reporter. */
export function trackLoad(id: string, weight = 1): (progress: number) => void {
  tasks.set(id, { weight, progress: 0 });
  return (progress) => {
    const task = tasks.get(id);
    if (task) task.progress = Math.max(task.progress, Math.min(1, Math.max(0, progress)));
  };
}

/** Removes a task, e.g. when the component that registered it unmounts. */
export function untrackLoad(id: string): void {
  tasks.delete(id);
}

/** Weighted progress of every registered task, or null when there are none. */
export function trackedProgress(): number | null {
  if (tasks.size === 0) return null;
  let total = 0;
  let done = 0;
  for (const task of tasks.values()) {
    total += task.weight;
    done += task.weight * task.progress;
  }
  return total > 0 ? done / total : 1;
}
