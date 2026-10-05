import { useEffect } from 'react';

/**
 * Cinematic Scroll Reveal System — Phase 2
 *
 * Uses IntersectionObserver + MutationObserver to:
 * - Observe all .reveal-* elements present at mount
 * - Watch for new elements added after React's async render
 * - Apply stagger delays from data-stagger="N" attribute (N = index, 0-based)
 * - Respect prefers-reduced-motion
 */

const SELECTORS = [
  '.reveal-title',
  '.reveal-fade',
  '.reveal-eyebrow',
  '.reveal-from-left',
  '.reveal-from-right',
  '.reveal-stagger',
  '.reveal-scale',
];

const REVEAL_SELECTOR = SELECTORS.join(', ');

export default function useScrollReveal(trigger) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.querySelectorAll(REVEAL_SELECTOR).forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const stagger = el.dataset.stagger;
            if (stagger !== undefined) {
              const delay = parseInt(stagger, 10) * 90; // 90ms between each stagger step
              setTimeout(() => el.classList.add('is-revealed'), delay);
            } else {
              el.classList.add('is-revealed');
            }
            obs.unobserve(el);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -48px 0px',
      }
    );

    // Observe all currently-present elements
    const observeAll = () => {
      document.querySelectorAll(REVEAL_SELECTOR).forEach(el => {
        if (!el.classList.contains('is-revealed')) {
          observer.observe(el);
        }
      });
    };

    observeAll();

    // Watch for elements added by React async rendering
    const mutation = new MutationObserver(() => {
      observeAll();
    });

    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [trigger]);
}
