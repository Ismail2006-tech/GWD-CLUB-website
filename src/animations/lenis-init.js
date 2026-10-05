/**
 * lenis-init.js — Smooth scroll setup
 * ────────────────────────────────────
 * Initialises Lenis with inertial scrolling and wires it to GSAP ScrollTrigger.
 * Called once from App.jsx.
 *
 * ─── TWEAK CONSTANTS ───────────────────────────────────────────────────────
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Lerp value — 0.08 = smooth cinematic, 0.12 = snappier
const LERP       = 0.09;
// Wheel multiplier — 1 = default, 0.9 = slightly gentler
const WHEEL_MULT = 0.95;

let _lenis = null;

export function initLenis() {
  if (typeof window === 'undefined') return null;

  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReducedMotion) {
    // On mobile/reduced-motion: let native scroll handle everything.
    // Still initialise ScrollTrigger so scroll-reveal still works.
    ScrollTrigger.defaults({ scroller: window });
    return null;
  }

  _lenis = new Lenis({
    lerp: LERP,
    smoothWheel: true,
    wheelMultiplier: WHEEL_MULT,
    touchAction: 'pan-y',     // keep native touch on iOS
    infinite: false,
  });

  // Connect Lenis → ScrollTrigger (single source of scroll state)
  _lenis.on('scroll', ScrollTrigger.update);

  // Expose on window so App.jsx can call scrollTo
  window.__lenis = _lenis;

  // Drive Lenis from gsap.ticker so we use ONE rAF loop, not two
  gsap.ticker.add((time) => {
    _lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0); // prevent jump after tab switch

  // Keep scroll-spy in App.jsx in sync
  _lenis.on('scroll', ({ scroll }) => {
    window.__lenisScrollY = scroll;
  });

  return _lenis;
}

export function destroyLenis() {
  if (_lenis) {
    _lenis.destroy();
    _lenis = null;
  }
}

export function getLenis() {
  return _lenis;
}
