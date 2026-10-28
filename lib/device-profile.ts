/**
 * Site-wide "lite" mode: one flag, `data-lite` on <html>, that every
 * decorative effect reads to stand down on a device that is struggling.
 *
 * It is set from hardware hints when the page starts (see
 * components/interaction/interaction-layer.tsx), or later by anything that
 * measures the device and finds it slow (the home hero does, while it
 * scrubs). Once set it stays for the browser session, so the next page
 * starts light instead of measuring its way down again.
 *
 * CSS reads it as `html[data-lite]`: animated backgrounds hold still, the
 * cursor halo and the hero's particles are not drawn, headings stop
 * animating in. Content and layout never depend on it.
 */

const LITE_KEY = 'cdl:hero-lite';

type DeviceHints = { deviceMemory?: number };

/** Whether to start in lite mode, before anything has been measured. */
export function readLiteHint(): boolean {
  try {
    if (window.sessionStorage.getItem(LITE_KEY) === '1') return true;
  } catch {
    // Storage blocked: decide from the hints alone.
  }
  const { deviceMemory } = navigator as Navigator & DeviceHints;
  const cores = navigator.hardwareConcurrency;
  return (deviceMemory !== undefined && deviceMemory <= 2) || (cores !== undefined && cores <= 2);
}

/** Turns lite mode on for this page and the rest of the session. */
export function markLite(): void {
  document.documentElement.dataset.lite = '';
  try {
    window.sessionStorage.setItem(LITE_KEY, '1');
  } catch {
    // Nothing to do: the next page measures again.
  }
}
