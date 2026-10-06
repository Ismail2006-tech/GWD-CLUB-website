/**
 * animations/gallery.js — Balanced Masonry Gallery & Tilt Specifications
 * ────────────────────────────────────────────────────────────────────────────
 * Tweakable constants for memories layout, hover lift, zoom, and lightbox.
 */

export const GALLERY_CONFIG = {
  desktopColumns: 3,
  mobileColumns: 2,
  containerMaxWidth: 1200, // px
  gapPx: 20,              // 16-24px
  hoverLiftPx: 4,         // px to lift on hover
  hoverZoomScale: 1.03,   // subtle inner photo zoom
  mouseTiltMaxDeg: 5,     // max 5° desktop tilt
  siblingDimOpacity: 0.65,// dimming factor for sibling photos
  revealRisePx: 30,       // px rise on entrance reveal
  blurUpFadeDuration: 0.4,// seconds to transition from blur to crisp
};
