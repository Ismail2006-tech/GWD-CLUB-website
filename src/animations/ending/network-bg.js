/**
 * GWD CLUB — ENDING BACKGROUND NETWORK CANVAS
 *
 * File: src/animations/ending/network-bg.js
 * Description: Ambient drifting network of 58 nodes (70% red #ff2d46, 30% green #2dff8a)
 * with distance-based dynamic connection lines, travelling white pulse packets,
 * mouse parallax response, and cinematic surge transitions.
 */

// ==========================================
// TWEAKABLE CONSTANTS
// ==========================================
export const NETWORK_CONFIG = {
  NODE_COUNT_DESKTOP: 58,
  NODE_COUNT_MOBILE: 30,
  GREEN_RATIO: 0.30,           // 30% green, 70% red
  COLOR_RED: '#ff2d46',
  COLOR_GREEN: '#2dff8a',
  COLOR_WHITE: '#ffffff',
  NODE_RADIUS: 2.0,            // base node size in px
  GLOW_RADIUS: 6.0,            // soft glow radius
  MAX_LINE_DIST: 190,          // connection line threshold in px
  BASE_LINE_OPACITY: 0.20,
  SURGE_LINE_OPACITY: 0.55,
  PULSE_INTERVAL: 0.70,        // seconds between pulse packet dispatches
  PULSE_SPEED: 1.0,            // seconds per travel trip
  PARALLAX_X: 22,              // horizontal parallax shift range px
  PARALLAX_Y: 12,              // vertical parallax shift range px
  MOUSE_LERP: 0.08,
  RECAP_OPACITY_MULT: 0.25,    // low opacity during recap
};

export class EndingNetworkBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d');
    this.nodes = [];
    this.pulses = [];
    this.isRecapMode = false;
    this.isPaused = false;
    this.surgeFactor = 0;       // 0 to 1 for click brightening
    this.pulseTimer = 0;
    this.lastTime = performance.now();
    this.animId = null;

    // Smooth mouse coordinates (-1 to 1)
    this.targetMouse = { x: 0, y: 0 };
    this.currentMouse = { x: 0, y: 0 };
    this.idleTime = 0;

    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.handleResize = this.handleResize.bind(this);
    this.render = this.render.bind(this);

    if (this.canvas) {
      this.init();
    }
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? NETWORK_CONFIG.NODE_COUNT_MOBILE : NETWORK_CONFIG.NODE_COUNT_DESKTOP;
    this.nodes = [];

    for (let i = 0; i < count; i++) {
      const isGreen = Math.random() < NETWORK_CONFIG.GREEN_RATIO;
      this.nodes.push({
        x: Math.random() * (this.width || 1280),
        y: Math.random() * (this.height || 720),
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        isGreen,
        color: isGreen ? NETWORK_CONFIG.COLOR_GREEN : NETWORK_CONFIG.COLOR_RED,
        radius: NETWORK_CONFIG.NODE_RADIUS * (0.8 + Math.random() * 0.5),
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.lastTime = performance.now();
    this.animId = requestAnimationFrame(this.render);
  }

  handleResize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    if (this.ctx) {
      this.ctx.scale(this.dpr, this.dpr);
    }
  }

  setMouse(normX, normY) {
    this.targetMouse.x = normX;
    this.targetMouse.y = normY;
  }

  setRecapMode(isRecap) {
    this.isRecapMode = Boolean(isRecap);
  }

  triggerSurge(duration = 1.0) {
    this.surgeFactor = 1.0;
    const startTime = performance.now();
    const animateSurge = (now) => {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed < 1) {
        this.surgeFactor = 1 - elapsed;
        requestAnimationFrame(animateSurge);
      } else {
        this.surgeFactor = 0;
      }
    };
    requestAnimationFrame(animateSurge);
  }

  pause() {
    this.isPaused = true;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.animId = requestAnimationFrame(this.render);
    }
  }

  spawnPulse() {
    if (this.isRecapMode || this.nodes.length < 2) return;
    // Find a valid pair within MAX_LINE_DIST
    const candidates = [];
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < NETWORK_CONFIG.MAX_LINE_DIST && d > 30) {
          candidates.push([this.nodes[i], this.nodes[j]]);
        }
      }
    }
    if (candidates.length > 0) {
      const pair = candidates[Math.floor(Math.random() * candidates.length)];
      this.pulses.push({
        from: pair[0],
        to: pair[1],
        progress: 0,
        speed: 1.0 / (NETWORK_CONFIG.PULSE_SPEED * 60),
      });
    }
  }

  render(now) {
    if (this.isPaused) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    // Mouse lerp & ambient drift when idle
    this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * NETWORK_CONFIG.MOUSE_LERP;
    this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * NETWORK_CONFIG.MOUSE_LERP;

    this.idleTime += dt;
    const idleOffsetX = Math.sin(this.idleTime * 0.7) * 4;
    const idleOffsetY = Math.cos(this.idleTime * 0.5) * 3;

    const offsetX = this.currentMouse.x * NETWORK_CONFIG.PARALLAX_X + idleOffsetX;
    const offsetY = this.currentMouse.y * NETWORK_CONFIG.PARALLAX_Y + idleOffsetY;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Update nodes
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      // Wrap edges with margin
      const margin = 30;
      if (n.x < -margin) n.x = this.width + margin;
      if (n.x > this.width + margin) n.x = -margin;
      if (n.y < -margin) n.y = this.height + margin;
      if (n.y > this.height + margin) n.y = -margin;
    }

    const baseLineOp = NETWORK_CONFIG.BASE_LINE_OPACITY +
      this.surgeFactor * (NETWORK_CONFIG.SURGE_LINE_OPACITY - NETWORK_CONFIG.BASE_LINE_OPACITY);

    // 1. Draw connection lines (skip during recap scene)
    if (!this.isRecapMode) {
      for (let i = 0; i < this.nodes.length; i++) {
        const a = this.nodes[i];
        for (let j = i + 1; j < this.nodes.length; j++) {
          const b = this.nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < NETWORK_CONFIG.MAX_LINE_DIST) {
            const alpha = baseLineOp * (1 - dist / NETWORK_CONFIG.MAX_LINE_DIST);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);

            if (a.isGreen && b.isGreen) {
              ctx.strokeStyle = `rgba(45, 255, 138, ${alpha})`;
            } else {
              ctx.strokeStyle = `rgba(255, 45, 70, ${alpha})`;
            }
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 2. Manage and draw white travelling pulses
      this.pulseTimer += dt;
      if (this.pulseTimer >= NETWORK_CONFIG.PULSE_INTERVAL) {
        this.pulseTimer = 0;
        this.spawnPulse();
      }

      for (let p = this.pulses.length - 1; p >= 0; p--) {
        const pulse = this.pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          this.pulses.splice(p, 1);
          continue;
        }

        const px = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
        const py = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

        // Draw travelling pulse with red glow
        ctx.save();
        ctx.shadowColor = NETWORK_CONFIG.COLOR_RED;
        ctx.shadowBlur = 8;
        ctx.fillStyle = NETWORK_CONFIG.COLOR_WHITE;
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 3. Draw nodes
    const nodeOpacityMult = this.isRecapMode ? NETWORK_CONFIG.RECAP_OPACITY_MULT : 1.0;
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const pulseScale = 1 + Math.sin(now * 0.003 + n.phase) * 0.15;
      const r = n.radius * pulseScale;

      ctx.save();
      ctx.shadowColor = n.color;
      ctx.shadowBlur = NETWORK_CONFIG.GLOW_RADIUS;
      ctx.fillStyle = n.color;
      ctx.globalAlpha = (n.isGreen ? 0.85 : 0.75) * nodeOpacityMult;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    this.animId = requestAnimationFrame(this.render);
  }

  destroy() {
    this.pause();
    window.removeEventListener('resize', this.handleResize);
    this.nodes = [];
    this.pulses = [];
    this.canvas = null;
    this.ctx = null;
  }
}
