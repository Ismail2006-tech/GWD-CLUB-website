/**
 * animations/background.js — Cinematic Constellation, Spotlight & Pulse Engine
 * ────────────────────────────────────────────────────────────────────────────
 * Tweakable constants for background network, lighting, and pulses.
 */

export const SPOTLIGHT_RADIUS     = 280;  // px radius around mouse cursor
export const SPOTLIGHT_INTENSITY  = 0.45; // peak brightness added near cursor
export const SPOTLIGHT_LERP       = 0.10; // smooth chase speed
export const PULSE_INTERVAL_MIN   = 2000; // ms minimum between data pulses
export const PULSE_INTERVAL_MAX   = 4000; // ms maximum between data pulses
export const PULSE_SPEED          = 0.018; // pulse traversal step speed
export const MOBILE_NODE_RATIO    = 0.40; // reduced particle count on mobile screens

// Chapter background glow tint colors [R, G, B]
export const CHAPTER_TINTS = {
  hero:     [1.0, 0.10, 0.24], // Deep crimson red
  team:     [0.08, 0.66, 0.39], // Emerald green accent
  memories: [0.18, 0.32, 0.68], // Cooler deep blue/cyan
  future:   [0.90, 0.12, 0.26]  // High-energy crimson
};

export const COLOR_SHIFT_DURATION = 1.2; // seconds to ease between chapter glows
