/**
 * mouse.js — GWD Club Single-Source Mouse Engine
 * ──────────────────────────────────────────────
 * Exposes one smoothed (x, y) from -1 to +1 across the viewport.
 * Every parallax, tilt and particle effect reads from this module —
 * there is only ONE mousemove listener and ONE rAF loop for all effects.
 *
 * ─── TWEAK CONSTANTS ────────────────────────────────────────────────────────
 */

// How quickly the smoothed value chases the real cursor (0 = instant, 1 = frozen)
export const LERP_SPEED          = 0.08;

// Parallax depths (px moved per normalised unit at ±1)
export const PARALLAX_GLOW       = 10;    // background glow
export const PARALLAX_NETWORK    = 20;    // constellation / network
export const PARALLAX_CONTENT    = 8;     // headings & main text
export const PARALLAX_CARD_FRONT = 30;    // nearest photo/video cards
export const PARALLAX_CARD_BACK  = 10;   // cards deeper in stack

// 3D card tilt (degrees)
export const TILT_MAX_DEG        = 8;
export const TILT_PERSPECTIVE    = 1000; // px

// Idle: seconds of stillness before drift kicks in
export const IDLE_TIMEOUT_MS     = 2000;

// Particle influence radius (px from cursor)
export const PARTICLE_RADIUS     = 150;

// ────────────────────────────────────────────────────────────────────────────

/** Internal state */
const raw      = { x: 0, y: 0 };   // raw normalised [-1, 1]
const smooth   = { x: 0, y: 0 };   // lerped
const drift    = { x: 0, y: 0 };   // idle sine-wave
let   idleTimer = null;
let   isIdle    = false;
let   driftPhase = 0;

/** Registered effect callbacks */
const _subscribers = new Set();

/** Reduced motion flag (read once) */
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Init (called once from App.jsx) ────────────────────────────────────────

let _running = false;

export function initMouse() {
  if (typeof window === 'undefined') return;
  if (_running) return;
  _running = true;

  if (!prefersReducedMotion) {
    window.addEventListener('mousemove', _onMouseMove, { passive: true });
    _rafLoop();
  }
}

export function destroyMouse() {
  _running = false;
  window.removeEventListener('mousemove', _onMouseMove);
  _subscribers.clear();
}

/** Subscribe a callback(smoothX, smoothY) that fires every animation frame */
export function onMouse(cb) {
  _subscribers.add(cb);
  return () => _subscribers.delete(cb);
}

/** Read the current smoothed position without subscribing */
export function getSmooth() {
  return { x: smooth.x, y: smooth.y };
}

// ─── Internal ────────────────────────────────────────────────────────────────

function _onMouseMove(e) {
  raw.x = (e.clientX / window.innerWidth)  * 2 - 1;
  raw.y = (e.clientY / window.innerHeight) * 2 - 1;

  isIdle = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { isIdle = true; }, IDLE_TIMEOUT_MS);
}

function _rafLoop() {
  if (!_running) return;

  if (isIdle) {
    // Gentle sine drift so the page never looks frozen
    driftPhase += 0.008;
    smooth.x += (Math.sin(driftPhase * 0.7) * 0.12 - smooth.x) * 0.02;
    smooth.y += (Math.cos(driftPhase * 0.5) * 0.08 - smooth.y) * 0.02;
  } else {
    smooth.x += (raw.x - smooth.x) * LERP_SPEED;
    smooth.y += (raw.y - smooth.y) * LERP_SPEED;
  }

  for (const cb of _subscribers) cb(smooth.x, smooth.y);

  requestAnimationFrame(_rafLoop);
}

// ─── Helpers used by components ──────────────────────────────────────────────

/** Compute 3D tilt for a card given the mouse position relative to the card */
export function getTiltFromMouse(mx, my, rect) {
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  const nx = ((mx * window.innerWidth  / 2 + window.innerWidth  / 2) - cx) / (rect.width  / 2);
  const ny = ((my * window.innerHeight / 2 + window.innerHeight / 2) - cy) / (rect.height / 2);
  const rx = Math.max(-TILT_MAX_DEG, Math.min(TILT_MAX_DEG, -ny * TILT_MAX_DEG));
  const ry = Math.max(-TILT_MAX_DEG, Math.min(TILT_MAX_DEG,  nx * TILT_MAX_DEG));
  return { rx, ry };
}
