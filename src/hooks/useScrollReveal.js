import { useEffect, useRef } from 'react';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport, `.is-visible` is added to it.
 * If the user prefers reduced motion, the class is added immediately.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
