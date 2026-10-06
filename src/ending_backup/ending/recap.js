/**
 * GWD CLUB — SCENE A: "THE JOURNEY SO FAR" RECAP
 *
 * File: src/animations/ending/recap.js
 * Description: Renders the 8 milestone chapters on an animated glowing spline path,
 * node pulse rings, travelling white laser head, bottom telemetry ruler,
 * and cinematic convergence collapse.
 */

import { endingAudio } from './ending-audio';

// ==========================================
// TWEAKABLE CONSTANTS
// ==========================================
export const RECAP_CONFIG = {
  REF_WIDTH: 1280,
  REF_HEIGHT: 720,
  COLOR_RED: '#ff2d46',
  COLOR_WHITE: '#ffffff',
  COLOR_RULER_BASE: '#3c282e',
  COLOR_MUTED: '#a0a0a8',
  NODE_RADIUS_BASE: 5,
  NODE_RADIUS_ACTIVE: 8,
  PULSE_MAX_RADIUS: 38,
  DURATION_TOTAL: 3.5,       // total scene time in seconds
  PATH_START_TIME: 0.6,      // seconds
  SEGMENT_DURATION: 0.36,    // seconds per node-to-node jump
  COLLAPSE_START: 3.0,       // collapse to center begins
  CHAPTERS: [
    { num: '00', title: 'THE VOID' },
    { num: '01', title: 'THE BEGINNING' },
    { num: '02', title: 'WHY GWD EXISTS' },
    { num: '03', title: 'THE CORE TEAM' },
    { num: '04', title: 'THE MEMORIES' },
    { num: '05', title: 'THE PROJECTS' },
    { num: '06', title: 'THE ACHIEVEMENTS' },
    { num: '07', title: 'THE FUTURE' },
  ],
};

export class RecapScene {
  constructor(canvas, labelsContainer, onChapterChange) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d');
    this.labelsContainer = labelsContainer;
    this.onChapterChange = onChapterChange;

    this.nodes = [];
    this.pulses = [];
    this.elapsed = 0;
    this.isActive = false;
    this.isDone = false;
    this.lastReachedIndex = -1;
    this.collapseProgress = 0;
    this.overallAlpha = 1;

    this.width = 0;
    this.height = 0;
    this.scale = 1;

    this.setupNodes();
  }

  getScaleFactor() {
    const w = this.width || window.innerWidth;
    const h = this.height || window.innerHeight;
    const s = Math.min(w / RECAP_CONFIG.REF_WIDTH, h / RECAP_CONFIG.REF_HEIGHT);
    return Math.max(0.6, Math.min(1.6, s));
  }

  setupNodes() {
    const isMobile = window.innerWidth <= 768;
    this.scale = this.getScaleFactor();

    // Map 8 nodes across x: 150 -> 1130 at ref 1280
    const startX = isMobile ? 40 : 150;
    const endX = isMobile ? (this.width ? this.width - 40 : 350) : 1130;
    const count = RECAP_CONFIG.CHAPTERS.length;

    this.nodes = RECAP_CONFIG.CHAPTERS.map((ch, i) => {
      const t = i / (count - 1);
      const refX = startX + t * (endX - startX);
      const refY = 360 + 55 * Math.sin(i + 0.3);

      return {
        index: i,
        num: ch.num,
        title: ch.title,
        refX,
        refY,
        x: refX,
        y: refY,
        popTime: Math.max(0, RECAP_CONFIG.PATH_START_TIME + i * RECAP_CONFIG.SEGMENT_DURATION - 0.1),
        currentRadius: RECAP_CONFIG.NODE_RADIUS_BASE,
        visible: false,
        popped: false,
        labelElement: null,
      };
    });
  }

  resize(w, h, dpr = 1) {
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.scale = this.getScaleFactor();

    // Recompute actual canvas-space coordinates
    const isMobile = w <= 768;
    const startX = isMobile ? 30 : 150 * this.scale + (w - RECAP_CONFIG.REF_WIDTH * this.scale) / 2;
    const endX = isMobile ? w - 30 : 1130 * this.scale + (w - RECAP_CONFIG.REF_WIDTH * this.scale) / 2;
    const centerY = h * 0.48;

    this.nodes.forEach((node, i) => {
      const t = i / (this.nodes.length - 1);
      node.x = startX + t * (endX - startX);
      node.y = centerY + (isMobile ? 35 : 55 * this.scale) * Math.sin(i + 0.3);
    });
  }

  start() {
    this.elapsed = 0;
    this.isActive = true;
    this.isDone = false;
    this.lastReachedIndex = -1;
    this.collapseProgress = 0;
    this.overallAlpha = 1;
    this.pulses = [];
    this.nodes.forEach(n => {
      n.visible = false;
      n.popped = false;
      n.currentRadius = RECAP_CONFIG.NODE_RADIUS_BASE;
    });
  }

  update(dt) {
    if (!this.isActive) return;

    this.elapsed += dt;

    // Check node pops and pulses
    this.nodes.forEach(node => {
      if (this.elapsed >= node.popTime && !node.popped) {
        node.popped = true;
        node.visible = true;
        // Trigger pulse ring
        this.pulses.push({
          x: node.x,
          y: node.y,
          r: 8,
          alpha: 1,
          maxR: RECAP_CONFIG.PULSE_MAX_RADIUS * this.scale,
        });

        // Trigger audio cue
        endingAudio.playRecapNodeBlip(node.index, this.nodes.length);

        if (this.onChapterChange && node.index > this.lastReachedIndex) {
          this.lastReachedIndex = node.index;
          this.onChapterChange(node.num, this.nodes.length - 1);
        }
      }

      // Pop bounce 5 -> 8 -> 5
      if (node.popped) {
        const timeSincePop = this.elapsed - node.popTime;
        if (timeSincePop < 0.25) {
          const bounce = Math.sin((timeSincePop / 0.25) * Math.PI);
          node.currentRadius = (RECAP_CONFIG.NODE_RADIUS_BASE + (RECAP_CONFIG.NODE_RADIUS_ACTIVE - RECAP_CONFIG.NODE_RADIUS_BASE) * bounce) * this.scale;
        } else {
          node.currentRadius = RECAP_CONFIG.NODE_RADIUS_BASE * this.scale;
        }
      }
    });

    // Update pulse rings
    for (let p = this.pulses.length - 1; p >= 0; p--) {
      const pulse = this.pulses[p];
      pulse.r += (pulse.maxR - pulse.r) * 0.08 + 0.4;
      pulse.alpha -= 0.025;
      if (pulse.alpha <= 0) {
        this.pulses.splice(p, 1);
      }
    }

    // Collapse phase (3.0 -> 3.5s)
    if (this.elapsed >= RECAP_CONFIG.COLLAPSE_START) {
      const collapseElapsed = this.elapsed - RECAP_CONFIG.COLLAPSE_START;
      const t = Math.min(1, collapseElapsed / (RECAP_CONFIG.DURATION_TOTAL - RECAP_CONFIG.COLLAPSE_START));
      // Ease in-out cubic
      this.collapseProgress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.overallAlpha = Math.max(0, 1 - t * 1.2);

      if (t >= 1) {
        this.isActive = false;
        this.isDone = true;
      }
    }
  }

  render(ctx) {
    if (!this.isActive && this.isDone) return;
    if (!ctx) ctx = this.ctx;
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = this.overallAlpha;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // 1. Draw connecting path line and determine head dot position
    let headX = null;
    let headY = null;

    if (this.elapsed >= RECAP_CONFIG.PATH_START_TIME && this.nodes.length > 1) {
      const pathElapsed = this.elapsed - RECAP_CONFIG.PATH_START_TIME;
      const totalSegments = this.nodes.length - 1;
      const currentSegmentF = pathElapsed / RECAP_CONFIG.SEGMENT_DURATION;
      const currentSegIndex = Math.min(totalSegments - 1, Math.floor(currentSegmentF));
      const segFraction = Math.min(1, currentSegmentF - currentSegIndex);

      ctx.save();
      ctx.strokeStyle = RECAP_CONFIG.COLOR_RED;
      ctx.lineWidth = 2 * this.scale;
      ctx.shadowColor = RECAP_CONFIG.COLOR_RED;
      ctx.shadowBlur = 10;
      ctx.beginPath();

      const getNodePos = (node) => {
        if (this.collapseProgress > 0) {
          return {
            x: node.x + (centerX - node.x) * this.collapseProgress,
            y: node.y + (centerY - node.y) * this.collapseProgress,
          };
        }
        return { x: node.x, y: node.y };
      };

      const startPos = getNodePos(this.nodes[0]);
      ctx.moveTo(startPos.x, startPos.y);

      for (let i = 0; i <= currentSegIndex; i++) {
        const nextIdx = i + 1;
        if (nextIdx < this.nodes.length) {
          const from = getNodePos(this.nodes[i]);
          const to = getNodePos(this.nodes[nextIdx]);

          if (i < currentSegIndex) {
            ctx.lineTo(to.x, to.y);
          } else {
            // Partial segment
            const curX = from.x + (to.x - from.x) * segFraction;
            const curY = from.y + (to.y - from.y) * segFraction;
            ctx.lineTo(curX, curY);
            headX = curX;
            headY = curY;
          }
        }
      }
      ctx.stroke();
      ctx.restore();

      // Draw bright white head dot at tip
      if (headX !== null && headY !== null && this.collapseProgress < 0.9) {
        ctx.save();
        ctx.fillStyle = RECAP_CONFIG.COLOR_WHITE;
        ctx.shadowColor = RECAP_CONFIG.COLOR_WHITE;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(headX, headY, 3.5 * this.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. Draw Pulse Rings
    this.pulses.forEach(pulse => {
      ctx.save();
      ctx.strokeStyle = RECAP_CONFIG.COLOR_RED;
      ctx.globalAlpha = pulse.alpha * this.overallAlpha;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // 3. Draw Nodes (white fill, red 2px outline)
    this.nodes.forEach(node => {
      if (!node.visible) return;

      let nx = node.x;
      let ny = node.y;

      if (this.collapseProgress > 0) {
        nx += (centerX - node.x) * this.collapseProgress;
        ny += (centerY - node.y) * this.collapseProgress;
      }

      ctx.save();
      // Red outline
      ctx.strokeStyle = RECAP_CONFIG.COLOR_RED;
      ctx.lineWidth = 2 * this.scale;
      ctx.shadowColor = RECAP_CONFIG.COLOR_RED;
      ctx.shadowBlur = 8;
      // White fill
      ctx.fillStyle = RECAP_CONFIG.COLOR_WHITE;

      ctx.beginPath();
      ctx.arc(nx, ny, node.currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // 4. Draw Bottom Ruler at y = 650 (scaled)
    const isMobile = this.width <= 768;
    if (!isMobile && this.nodes.length > 1) {
      const rulerY = this.height * 0.88;
      const rx1 = this.nodes[0].x;
      const rx2 = this.nodes[this.nodes.length - 1].x;

      ctx.save();
      // Base ruler line
      ctx.strokeStyle = RECAP_CONFIG.COLOR_RULER_BASE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx1, rulerY);
      ctx.lineTo(rx2, rulerY);
      ctx.stroke();

      // Ruler ticks at each node
      this.nodes.forEach(n => {
        ctx.beginPath();
        ctx.moveTo(n.x, rulerY - 4);
        ctx.lineTo(n.x, rulerY + 4);
        ctx.stroke();
      });

      // Animated progress line
      if (headX !== null) {
        const progWidth = Math.max(0, Math.min(rx2 - rx1, headX - rx1));
        ctx.strokeStyle = RECAP_CONFIG.COLOR_RED;
        ctx.lineWidth = 2;
        ctx.shadowColor = RECAP_CONFIG.COLOR_RED;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(rx1, rulerY);
        ctx.lineTo(rx1 + progWidth, rulerY);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }
}
