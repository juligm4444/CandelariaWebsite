import { useSyncExternalStore } from 'react';

/**
 * True when the browser can actually create a WebGL context. Hardware
 * acceleration can be switched off in the browser settings, blocklisted for
 * the GPU driver, or disabled by a sandbox; in all of those cases Three.js
 * throws while constructing the renderer.
 */
function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!context) return false;
    (context as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

// The answer never changes during a page's life, so it is computed once.
let support: boolean | undefined;
const subscribe = () => () => {};
const snapshot = () => (support ??= canUseWebGL());
const server = () => null;

/** `null` on the server and during hydration, then `true` or `false`. */
export function useWebGLSupport(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, snapshot, server);
}
