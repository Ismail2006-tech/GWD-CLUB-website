/**
 * animations/hero.js — Hero Dissolve and Chapter 00 -> 01 Transition
 * ────────────────────────────────────────────────────────────────────────────
 * Tweakable constants at the top for easy tuning of speeds, thresholds, and distances.
 */

export const HERO_DISSOLVE_DISTANCE = 450; // px of scroll to fully dissolve hero
export const HERO_SCATTER_FORCE     = 45.0; // magnitude of particle scatter
export const HERO_FADE_THRESHOLD    = 0.90; // fraction at which next chapter begins entering
export const HERO_ORBIT_SHRINK_DIST = 180;  // px before orbit ring shrinks to dot
export const HERO_TAGLINE_FADE_DIST = 140;  // px before tagline is completely faded

/**
 * Calculates current normalized hero dissolve progress (0 to 1) based on scroll position.
 */
export function getHeroDissolveProgress(scrollY, viewportHeight = window.innerHeight) {
  const maxDist = Math.min(HERO_DISSOLVE_DISTANCE, viewportHeight * 0.55);
  return Math.min(1, Math.max(0, scrollY / maxDist));
}

/**
 * Checks whether the hero particle canvas should be completely culled to save GPU cycles.
 */
export function shouldCullHeroParticles(progress) {
  return progress >= 0.98;
}
