/**
 * animations/counters.js — Live Counters Animated Number Ticker
 * ────────────────────────────────────────────────────────────────────────────
 * Tweakable constants for count duration, easing, and underline drawing.
 */

export const COUNTER_DURATION_MS = 1200; // ms to count from 0 to target
export const UNDERLINE_ANIM_MS   = 800;  // ms to draw thin red underline
export const COUNTER_EASE        = (t) => 1 - Math.pow(1 - t, 3); // cubic easeOut

/**
 * Counts up a number over duration using requestAnimationFrame.
 */
export function animateCounter(start, end, duration, onUpdate, onComplete) {
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = COUNTER_EASE(progress);
    const current = Math.round(start + (end - start) * eased);
    onUpdate(current);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      if (onComplete) onComplete();
    }
  }
  requestAnimationFrame(step);
}
