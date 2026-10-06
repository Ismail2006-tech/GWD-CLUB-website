/**
 * GWD CLUB — SCENE B: PARTICLE LOGO, BRACKETS & SCAN LINE
 *
 * File: src/animations/ending/logo-particles.js
 * Description: Renders the morphing particle "GWD" typography, animated HUD corner brackets,
 * glowing laser scan line, emblem contraction to header, and burst pulse on join.
 */

import { endingAudio } from './ending-audio';

// ==========================================
// TWEAKABLE CONSTANTS
// ==========================================
export const LOGO_PARTICLES_CONFIG = {
  REF_WIDTH: 1280,
  REF_HEIGHT: 720,
  PARTICLE_COUNT_DESKTOP: 2400,
  PARTICLE_COUNT_MOBILE: 1000,
  PARTICLE_SIZE: 2.2,
  PARTICLE_COLOR_RED: '#ff3c55',
  PARTICLE_COLOR_PINK: '#ffafbc',
  PARTICLE_COLOR_WHITE: '#f5f5f8',
  COLOR_BRACKET: '#ff2d46',
  COLOR_SCAN_LINE: '#ff465f',
  COLOR_GREEN_DOT: '#2dff8a',
  TIMING: {
    START: 3.5,
    FLY_START: 3.7,
    FLY_MAX_DELAY: 1.2,
    FLY_DURATION: 2.4,
    BRACKETS_START: 6.1,
    BRACKETS_END: 7.1,
    SCAN_START: 6.7,
    SCAN_END: 8.2,
    LABELS_FADE_START: 7.9,
    LABELS_FADE_END: 8.5,
    SHRINK_START: 8.3,
    SHRINK_END: 9.7,
    EMBLEM_SUB_START: 9.5,
    EMBLEM_SUB_END: 10.3,
  },
};

export class LogoParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d');
    this.particles = [];
    this.elapsed = 0;
    this.isActive = false;
    this.width = 0;
    this.height = 0;
    this.scale = 1;

    // Bounds of target text
    this.bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, cx: 0, cy: 0 };

    // Emblem shrink state
    this.shrinkScale = 1.0;
    this.currentCenter = { x: 0, y: 0 };
    this.burstOffset = 0;

    // Audio triggers flags
    this.hasTriggeredRiser = false;
    this.hasTriggeredScan = false;
    this.hasTriggeredSettle = false;
  }

  getScaleFactor() {
    const w = this.width || window.innerWidth;
    const h = this.height || window.innerHeight;
    const s = Math.min(w / LOGO_PARTICLES_CONFIG.REF_WIDTH, h / LOGO_PARTICLES_CONFIG.REF_HEIGHT);
    return Math.max(0.6, Math.min(1.6, s));
  }

  resize(w, h, dpr = 1) {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.scale = this.getScaleFactor();
    this.sampleTargetPoints();
  }

  sampleTargetPoints() {
    const isMobile = this.width <= 768;
    const targetCount = isMobile
      ? LOGO_PARTICLES_CONFIG.PARTICLE_COUNT_MOBILE
      : LOGO_PARTICLES_CONFIG.PARTICLE_COUNT_DESKTOP;

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    offscreen.width = this.width;
    offscreen.height = this.height;

    const fontSize = Math.floor((isMobile ? 140 : 250) * this.scale);
    const letterSpacing = Math.floor(16 * this.scale);

    offCtx.fillStyle = '#ffffff';
    offCtx.font = `900 ${fontSize}px 'Orbitron', 'Rajdhani', sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    if (offCtx.letterSpacing !== undefined) {
      offCtx.letterSpacing = `${letterSpacing}px`;
    }

    const textY = this.height * 0.44;
    offCtx.fillText('GWD', this.width / 2, textY);

    const imgData = offCtx.getImageData(0, 0, this.width, this.height);
    const pixels = imgData.data;
    const validPixels = [];

    let minX = this.width, maxX = 0, minY = this.height, maxY = 0;

    // Sample step to capture filled pixels
    const step = isMobile ? 3 : 2;
    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        const idx = (y * this.width + x) * 4;
        if (pixels[idx + 3] > 128) {
          validPixels.push({ x, y });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    this.bounds = {
      minX, maxX, minY, maxY,
      width: maxX - minX,
      height: maxY - minY,
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
    };
    this.currentCenter = { x: this.bounds.cx, y: this.bounds.cy };

    // Select targetCount points randomly from valid pixels
    this.particles = [];
    const stepIndex = Math.max(1, Math.floor(validPixels.length / targetCount));

    for (let i = 0; i < validPixels.length && this.particles.length < targetCount; i += stepIndex) {
      const pt = validPixels[i];
      const r = Math.random();
      let color = LOGO_PARTICLES_CONFIG.PARTICLE_COLOR_WHITE;
      if (r < 0.25) color = LOGO_PARTICLES_CONFIG.PARTICLE_COLOR_RED;
      else if (r < 0.50) color = LOGO_PARTICLES_CONFIG.PARTICLE_COLOR_PINK;

      // Start at random screen position (some off-screen)
      const startAngle = Math.random() * Math.PI * 2;
      const startDist = Math.max(this.width, this.height) * (0.6 + Math.random() * 0.7);
      const startX = this.bounds.cx + Math.cos(startAngle) * startDist;
      const startY = this.bounds.cy + Math.sin(startAngle) * startDist;

      this.particles.push({
        targetX: pt.x,
        targetY: pt.y,
        startX,
        startY,
        color,
        delay: Math.random() * LOGO_PARTICLES_CONFIG.TIMING.FLY_MAX_DELAY,
        swayAmp: (Math.random() - 0.5) * 40 * this.scale,
        swayFreq: 2 + Math.random() * 3,
        shimmerPhase: Math.random() * Math.PI * 2,
        isRed: color === LOGO_PARTICLES_CONFIG.PARTICLE_COLOR_RED,
        extraSize: 0,
        extraWhite: 0,
      });
    }
  }

  start() {
    this.elapsed = LOGO_PARTICLES_CONFIG.TIMING.START;
    this.isActive = true;
    this.shrinkScale = 1.0;
    this.burstOffset = 0;
    this.hasTriggeredRiser = false;
    this.hasTriggeredScan = false;
    this.hasTriggeredSettle = false;
    if (this.particles.length === 0) {
      this.sampleTargetPoints();
    }
  }

  // Trigger burst pulse on Join button click
  triggerBurst() {
    this.burstOffset = 26 * this.scale;
    const startTime = performance.now();
    const duration = 600; // ms
    const anim = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      // Sin bounce
      this.burstOffset = 26 * this.scale * Math.sin(t * Math.PI);
      if (t < 1) requestAnimationFrame(anim);
      else this.burstOffset = 0;
    };
    requestAnimationFrame(anim);
  }

  update(dt, masterElapsed) {
    if (!this.isActive) return;
    this.elapsed = masterElapsed;

    const T = LOGO_PARTICLES_CONFIG.TIMING;

    // Trigger audio cues
    if (this.elapsed >= T.FLY_START && !this.hasTriggeredRiser) {
      this.hasTriggeredRiser = true;
      endingAudio.playLogoRiser(2.5);
    }
    if (this.elapsed >= T.SCAN_START && !this.hasTriggeredScan) {
      this.hasTriggeredScan = true;
      endingAudio.playWhoosh(1200, 0.6);
    }
    if (this.elapsed >= T.SHRINK_START && !this.hasTriggeredSettle) {
      this.hasTriggeredSettle = true;
      endingAudio.playThump(48, 440);
    }

    // Shrink phase (8.3 -> 9.7s): scales down to 96px width and moves to top y = 100 * scale
    if (this.elapsed >= T.SHRINK_START) {
      const progress = Math.min(1, (this.elapsed - T.SHRINK_START) / (T.SHRINK_END - T.SHRINK_START));
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const targetEmblemWidth = 96 * this.scale;
      const targetScale = this.bounds.width > 0 ? (targetEmblemWidth / this.bounds.width) : 0.25;

      this.shrinkScale = 1.0 - (1.0 - targetScale) * ease;
      const targetY = 100 * this.scale;
      this.currentCenter.y = this.bounds.cy - (this.bounds.cy - targetY) * ease;
    } else {
      this.shrinkScale = 1.0;
      this.currentCenter.y = this.bounds.cy;
    }
  }

  render(ctx) {
    if (!this.isActive) return;
    if (!ctx) ctx = this.ctx;
    if (!ctx) return;

    const T = LOGO_PARTICLES_CONFIG.TIMING;
    if (this.elapsed < T.START) return;

    ctx.save();

    const cx = this.bounds.cx;
    const cy = this.currentCenter.y;
    const s = this.shrinkScale;

    // 1. Draw Particles
    const flyProgress = this.elapsed - T.FLY_START;

    // Scan line position
    let scanLineX = null;
    if (this.elapsed >= T.SCAN_START && this.elapsed <= T.SCAN_END) {
      const scanT = (this.elapsed - T.SCAN_START) / (T.SCAN_END - T.SCAN_START);
      // Ease in out
      const easeScan = scanT < 0.5 ? 2 * scanT * scanT : -1 + (4 - 2 * scanT) * scanT;
      const scanMargin = 60 * this.scale;
      scanLineX = (this.bounds.minX - scanMargin) + easeScan * (this.bounds.width + scanMargin * 2);
    }

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Flight interpolation
      const pTime = Math.max(0, flyProgress - p.delay);
      const t = Math.min(1, pTime / T.FLY_DURATION);
      // Ease out cubic
      const easeFly = 1 - Math.pow(1 - t, 3);

      // Interpolate between start and target
      let curX = p.startX + (p.targetX - p.startX) * easeFly;
      let curY = p.startY + (p.targetY - p.startY) * easeFly;

      // Sway that decays
      const decay = 1 - easeFly;
      curX += Math.sin(t * Math.PI * p.swayFreq) * p.swayAmp * decay;

      // Post-landing shimmer
      if (t >= 1) {
        const shim = Math.sin(this.elapsed * 5 + p.shimmerPhase) * 0.8 * this.scale;
        curX += shim;
        curY += shim;
      }

      // Apply Emblem Scaling & Translation
      let finalX = cx + (curX - this.bounds.cx) * s;
      let finalY = cy + (curY - this.bounds.cy) * s;

      // Apply burst offset if active
      if (this.burstOffset > 0) {
        const dx = finalX - cx;
        const dy = finalY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        finalX += (dx / dist) * this.burstOffset;
        finalY += (dy / dist) * this.burstOffset;
      }

      // Check scan line proximity
      let isLitByScan = false;
      if (scanLineX !== null && s >= 0.9) {
        const distFromScan = curX - scanLineX;
        if (distFromScan <= 0 && distFromScan >= -70 * this.scale) {
          isLitByScan = true;
        }
      }

      // Fade in over first 0.6s
      const fadeIn = Math.min(1, Math.max(0, (this.elapsed - T.START) / 0.6));
      let pAlpha = fadeIn;

      // Render particle
      ctx.save();
      let pColor = p.color;
      let pRadius = LOGO_PARTICLES_CONFIG.PARTICLE_SIZE * this.scale * Math.max(0.4, s);

      if (isLitByScan) {
        pColor = '#ffffff';
        pRadius *= 1.45;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
      } else if (p.isRed) {
        ctx.shadowColor = LOGO_PARTICLES_CONFIG.PARTICLE_COLOR_RED;
        ctx.shadowBlur = 6;
      }

      ctx.globalAlpha = pAlpha;
      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.arc(finalX, finalY, pRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Scan Line (6.7 -> 8.2s)
    if (scanLineX !== null && s >= 0.9) {
      ctx.save();
      ctx.strokeStyle = LOGO_PARTICLES_CONFIG.COLOR_SCAN_LINE;
      ctx.lineWidth = 2 * this.scale;
      ctx.shadowColor = LOGO_PARTICLES_CONFIG.COLOR_SCAN_LINE;
      ctx.shadowBlur = 14;

      const scanTop = this.bounds.minY - 30 * this.scale;
      const scanBottom = this.bounds.maxY + 30 * this.scale;

      ctx.beginPath();
      ctx.moveTo(scanLineX, scanTop);
      ctx.lineTo(scanLineX, scanBottom);
      ctx.stroke();
      ctx.restore();
    }

    // 3. HUD Corner Brackets (6.1 -> 10.3s)
    if (this.elapsed >= T.BRACKETS_START) {
      const bProgress = Math.min(1, (this.elapsed - T.BRACKETS_START) / (T.BRACKETS_END - T.BRACKETS_START));
      const easeB = 1 - Math.pow(1 - bProgress, 3);

      // Initial bracket geometry: padding (70, 56) -> (36, 30), arm length 0 -> 54
      let padX = (70 - (70 - 36) * easeB) * this.scale;
      let padY = (56 - (56 - 30) * easeB) * this.scale;
      let armLen = (54 * easeB) * this.scale;
      let bLineWidth = 2 * this.scale;

      // When shrinking to emblem (8.3 -> 9.7s): padding (10, 8), arm length 13, 1px
      if (this.elapsed >= T.SHRINK_START) {
        const shrinkEase = Math.min(1, (this.elapsed - T.SHRINK_START) / (T.SHRINK_END - T.SHRINK_START));
        padX = padX - (padX - 10 * this.scale) * shrinkEase;
        padY = padY - (padY - 8 * this.scale) * shrinkEase;
        armLen = armLen - (armLen - 13 * this.scale) * shrinkEase;
        bLineWidth = Math.max(1, 2 * this.scale - shrinkEase * this.scale);
      }

      const halfW = (this.bounds.width / 2) * s + padX;
      const halfH = (this.bounds.height / 2) * s + padY;

      const left = cx - halfW;
      const right = cx + halfW;
      const top = cy - halfH;
      const bottom = cy + halfH;

      ctx.save();
      ctx.strokeStyle = LOGO_PARTICLES_CONFIG.COLOR_BRACKET;
      ctx.lineWidth = bLineWidth;
      ctx.shadowColor = LOGO_PARTICLES_CONFIG.COLOR_BRACKET;
      ctx.shadowBlur = 8;

      // Top-Left L
      ctx.beginPath();
      ctx.moveTo(left, top + armLen);
      ctx.lineTo(left, top);
      ctx.lineTo(left + armLen, top);
      ctx.stroke();

      // Top-Right L
      ctx.beginPath();
      ctx.moveTo(right - armLen, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, top + armLen);
      ctx.stroke();

      // Bottom-Left L
      ctx.beginPath();
      ctx.moveTo(left, bottom - armLen);
      ctx.lineTo(left, bottom);
      ctx.lineTo(left + armLen, bottom);
      ctx.stroke();

      // Bottom-Right L
      ctx.beginPath();
      ctx.moveTo(right - armLen, bottom);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right, bottom - armLen);
      ctx.stroke();

      // Tiny labels: SIGNAL // GWD and NETWORK ONLINE (fade out 7.9 -> 8.5s)
      if (this.elapsed < T.LABELS_FADE_END) {
        let labelAlpha = 1;
        if (this.elapsed >= T.LABELS_FADE_START) {
          labelAlpha = 1 - (this.elapsed - T.LABELS_FADE_START) / (T.LABELS_FADE_END - T.LABELS_FADE_START);
        }

        ctx.globalAlpha = Math.max(0, labelAlpha);
        ctx.font = `600 ${Math.floor(11 * this.scale)}px 'Space Grotesk', monospace`;
        ctx.fillStyle = '#bebec4';

        // Above Top-Left
        ctx.textAlign = 'left';
        ctx.fillText('SIGNAL // GWD', left, top - 8 * this.scale);

        // Below Bottom-Right with blinking green dot
        ctx.textAlign = 'right';
        ctx.fillText('NETWORK ONLINE', right - 14 * this.scale, bottom + 16 * this.scale);

        const blink = Math.floor(this.elapsed * 3) % 2 === 0;
        if (blink) {
          ctx.fillStyle = LOGO_PARTICLES_CONFIG.COLOR_GREEN_DOT;
          ctx.shadowColor = LOGO_PARTICLES_CONFIG.COLOR_GREEN_DOT;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(right - 4 * this.scale, bottom + 12 * this.scale, 2.5 * this.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // 4. Emblem sub-lines: GET WORK DONE and CLUB under emblem (9.5 -> 10.3s)
      if (this.elapsed >= T.EMBLEM_SUB_START) {
        const subAlpha = Math.min(1, (this.elapsed - T.EMBLEM_SUB_START) / (T.EMBLEM_SUB_END - T.EMBLEM_SUB_START));
        ctx.save();
        ctx.globalAlpha = subAlpha;
        ctx.textAlign = 'center';
        ctx.fillStyle = LOGO_PARTICLES_CONFIG.COLOR_BRACKET;
        ctx.font = `bold ${Math.floor(10 * this.scale)}px 'Orbitron', sans-serif`;
        ctx.fillText('GET WORK DONE', cx, bottom + 14 * this.scale);
        ctx.fillText('CLUB', cx, bottom + 26 * this.scale);
        ctx.restore();
      }
    }

    ctx.restore();
  }
}
