'use client';

import { useEffect } from 'react';

import { readLiteHint } from '@/lib/device-profile';

/**
 * One delegated listener pair for the whole site, instead of a handler on
 * every button. It renders nothing.
 *
 * - `[data-light]`: receives `--mx`/`--my`, the pointer position relative to
 *   the element, which the `.cdl-light`, `.cdl-light-edge` and `.cdl-link`
 *   gradients read. Batched to one write per animation frame.
 * - `[data-magnetic]`: leans a few pixels toward the pointer through the
 *   `translate` property, so it composes with the press `scale`.
 * - `[data-ripple]`: on press, a disc of light grows from the exact press
 *   point and fades. Works for touch too, where it is the only feedback.
 * - `[data-halo]` (dark sections): the section's backdrop halo follows the
 *   pointer, moved with `transform` only, and is switched off on leave. It
 *   is skipped entirely in lite mode.
 *
 * It also starts the site-wide lite mode from hardware hints (see
 * lib/device-profile.ts) before anything has had a chance to stutter.
 *
 * Pointer tracking only runs for a mouse on a device that can hover; touch
 * gets the ripple and nothing that could leave a stuck highlight. Reduced
 * motion drops the magnet and the ripple; the light (colour, not movement)
 * stays.
 */
export function InteractionLayer() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const root = document.documentElement;
    if (readLiteHint()) root.dataset.lite = '';

    let frame = 0;
    let last: PointerEvent | null = null;
    let magnet: HTMLElement | null = null;
    let haloHost: HTMLElement | null = null;
    let halo: HTMLElement | null = null;

    const dim = () => {
      if (halo) delete halo.dataset.on;
      haloHost = null;
      halo = null;
    };

    const release = () => {
      if (magnet) magnet.style.translate = '';
      magnet = null;
      dim();
    };

    const apply = () => {
      frame = 0;
      const event = last;
      if (!event) return;
      const target = event.target instanceof Element ? event.target : null;

      const lit = target?.closest<HTMLElement>('[data-light]');
      if (lit) {
        const box = lit.getBoundingClientRect();
        lit.style.setProperty('--mx', `${event.clientX - box.left}px`);
        lit.style.setProperty('--my', `${event.clientY - box.top}px`);
      }

      const host = 'lite' in root.dataset ? null : (target?.closest<HTMLElement>('[data-halo]') ?? null);
      if (host !== haloHost) {
        dim();
        haloHost = host;
        halo = host?.querySelector<HTMLElement>(':scope > .cdl-backdrop > .cdl-bd-halo') ?? null;
      }
      if (host && halo) {
        const box = host.getBoundingClientRect();
        halo.style.transform = `translate3d(${(event.clientX - box.left).toFixed(1)}px, ${(event.clientY - box.top).toFixed(1)}px, 0)`;
        if (!('on' in halo.dataset)) halo.dataset.on = '';
      }

      const next = reduce.matches ? null : (target?.closest<HTMLElement>('[data-magnetic]') ?? null);
      if (next !== magnet) release();
      if (next) {
        magnet = next;
        const box = next.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) / box.width;
        const dy = (event.clientY - (box.top + box.height / 2)) / box.height;
        next.style.translate = `${(dx * 10).toFixed(2)}px ${(dy * 8).toFixed(2)}px`;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !fine.matches) return;
      last = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onDown = (event: PointerEvent) => {
      if (reduce.matches || event.button !== 0) return;
      const target = event.target instanceof Element ? event.target : null;
      const host = target?.closest<HTMLElement>('[data-ripple]');
      if (!host || host.matches(':disabled, [aria-disabled="true"]')) return;

      const box = host.getBoundingClientRect();
      const size = Math.max(box.width, box.height) * 2.4;
      const ripple = document.createElement('span');
      ripple.className = 'cdl-ripple';
      ripple.setAttribute('aria-hidden', 'true');
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - box.left - size / 2}px`;
      ripple.style.top = `${event.clientY - box.top - size / 2}px`;
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      host.appendChild(ripple);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    root.addEventListener('pointerleave', release);
    window.addEventListener('blur', release);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointerleave', release);
      window.removeEventListener('blur', release);
      release();
    };
  }, []);

  return null;
}
