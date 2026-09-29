import { useEffect } from 'react';

/**
 * High-performance IntersectionObserver hook for typography and section reveals.
 * Respects prefers-reduced-motion.
 */
export default function useScrollReveal(trigger) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const elements = document.querySelectorAll('.reveal-title, .reveal-fade');
    if (elements.length === 0) return;

    if (prefersReducedMotion) {
      elements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    elements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [trigger]);
}
