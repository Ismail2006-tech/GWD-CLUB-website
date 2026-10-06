/**
 * GWD CLUB — SCENE A: "THE JOURNEY SO FAR" RECAP
 *
 * Standalone canvas scene: driven by ending.js tick (update + render).
 */

import { endingAudio } from './ending-audio';

// ==========================================
// CONSTANTS (all tweakable here)
// ==========================================
export const RECAP_CONFIG = {
  REF_WIDTH: 1280,
  REF_HEIGHT: 720,
  COLOR_RED: '#ff2d46',
  COLOR_WHITE: '#ffffff',
  COLOR_LABEL_NUM: '#ff2d46',
  COLOR_LABEL_TITLE: '#f2f2f4',
  COLOR_RULER_BASE: '#3c282e',
  COLOR_MUTED: '#a0a0a8',
  NODE_RADIUS_BASE: 5,
  NODE_RADIUS_POP: 8,
  PULSE_MAX_RADIUS: 38,
  DURATION_TOTAL: 3.5,
  PATH_START_TIME: 0.6,
  SEGMENT_DURATION: 0.36,  // per node segment
  COLLAPSE_START: 3.0,
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
  constructor(canvas, _unused, onChapterChange) {
    this.canvas = canvas;
    this.onChapterChange = onChapterChange;

    this.nodes = [];
    this.pulses = [];
    this.elapsed = 0;
    this.isActive = false;
    this.isDone = false;
    this.lastReachedIndex = -1;
    this.collapseProgress = 0;
    this.overallAlpha = 1;

    this.w = 0;
    this.h = 0;
    this.dpr = 1;
    this.scale = 1;
  }

  /* ---- called by CinematicEnding on mount and on resize ---- */
  resize(w, h, dpr) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;

    const canvas = this.canvas;
    if (!canvas) return;
    // Set real pixel size
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    // Compute scale factor vs 1280×720 reference
    const s = Math.min(w / RECAP_CONFIG.REF_WIDTH, h / RECAP_CONFIG.REF_HEIGHT);
    this.scale = Math.max(0.5, Math.min(1.6, s));

    this._buildNodes();
  }

  _buildNodes() {
    const w = this.w, h = this.h, s = this.scale;
    const isMobile = w <= 768;
    const count = RECAP_CONFIG.CHAPTERS.length;

    // Map reference x 150→1130 to screen space
    const marginX = isMobile ? 28 : 0;
    const refL = 150, refR = 1130;
    const screenL = marginX + (w - RECAP_CONFIG.REF_WIDTH * s) / 2 + refL * s;
    const screenR = (w - RECAP_CONFIG.REF_WIDTH * s) / 2 + refR * s - marginX;

    // Reference y centre ≈ 360/720 = 50% of viewport height
    const centerY = h * 0.5;

    this.nodes = RECAP_CONFIG.CHAPTERS.map((ch, i) => {
      const t = i / (count - 1);
      const x = screenL + t * (screenR - screenL);
      const refNodeY = 360 + 55 * Math.sin(i + 0.3);
      const y = centerY + (refNodeY - 360) * s;

      return {
        index: i,
        num: ch.num,
        title: ch.title,
        x, y,
        baseX: x, baseY: y,
        // node pops 0.1 s before line arrives
        popTime: Math.max(0, RECAP_CONFIG.PATH_START_TIME + i * RECAP_CONFIG.SEGMENT_DURATION - 0.1),
        radius: RECAP_CONFIG.NODE_RADIUS_BASE * s,
        visible: false,
        popped: false,
        labelAlpha: 0,
        labelSlide: 10 * s,  // start 10px offset, slides to 0
      };
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
      n.radius = RECAP_CONFIG.NODE_RADIUS_BASE * this.scale;
      n.labelAlpha = 0;
      n.labelSlide = 10 * this.scale;
      // reset to base positions
      n.x = n.baseX;
      n.y = n.baseY;
    });
  }

  update(dt) {
    if (!this.isActive) return;
    this.elapsed += dt;
    const t = this.elapsed;
    const s = this.scale;

    // Pop nodes
    this.nodes.forEach(node => {
      if (t >= node.popTime && !node.popped) {
        node.popped = true;
        node.visible = true;
        this.pulses.push({
          x: node.x, y: node.y,
          r: RECAP_CONFIG.NODE_RADIUS_POP * s,
          alpha: 1,
          maxR: RECAP_CONFIG.PULSE_MAX_RADIUS * s,
        });
        endingAudio.playRecapNodeBlip(node.index, this.nodes.length);
        if (node.index > this.lastReachedIndex) {
          this.lastReachedIndex = node.index;
          this.onChapterChange?.(node.num, this.nodes.length - 1);
        }
      }

      if (node.popped) {
        // Bounce radius 5→8→5 over 0.25s
        const since = t - node.popTime;
        if (since < 0.25) {
          const bounce = Math.sin((since / 0.25) * Math.PI);
          node.radius = (RECAP_CONFIG.NODE_RADIUS_BASE + (RECAP_CONFIG.NODE_RADIUS_POP - RECAP_CONFIG.NODE_RADIUS_BASE) * bounce) * s;
        } else {
          node.radius = RECAP_CONFIG.NODE_RADIUS_BASE * s;
        }
        // Label slide-in over 0.4s
        if (since < 0.4) {
          node.labelAlpha = Math.min(1, since / 0.4);
          node.labelSlide = 10 * s * (1 - since / 0.4);
        } else {
          node.labelAlpha = 1;
          node.labelSlide = 0;
        }
      }
    });

    // Pulse rings
    for (let p = this.pulses.length - 1; p >= 0; p--) {
      const pulse = this.pulses[p];
      pulse.r = Math.min(pulse.maxR, pulse.r + (pulse.maxR - pulse.r) * 0.07 + 0.5);
      pulse.alpha -= 0.022;
      if (pulse.alpha <= 0) this.pulses.splice(p, 1);
    }

    // Collapse phase 3.0 → 3.5s
    if (t >= RECAP_CONFIG.COLLAPSE_START) {
      const ct = Math.min(1, (t - RECAP_CONFIG.COLLAPSE_START) / (RECAP_CONFIG.DURATION_TOTAL - RECAP_CONFIG.COLLAPSE_START));
      this.collapseProgress = ct < 0.5 ? 4 * ct * ct * ct : 1 - Math.pow(-2 * ct + 2, 3) / 2;
      this.overallAlpha = Math.max(0, 1 - ct * 1.2);
      if (ct >= 1) {
        this.isActive = false;
        this.isDone = true;
      }
    }
  }

  render() {
    const canvas = this.canvas;
    if (!canvas) return;
    if (this.isDone) return; // fully finished, stop drawing
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = this.dpr;
    const w = this.w, h = this.h, s = this.scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale for DPR once per render
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.globalAlpha = Math.max(0, this.overallAlpha);

    const cx = w / 2, cy = h / 2;

    // Helper: get collapsed position
    const pos = (node) => {
      if (this.collapseProgress > 0) {
        return {
          x: node.baseX + (cx - node.baseX) * this.collapseProgress,
          y: node.baseY + (cy - node.baseY) * this.collapseProgress,
        };
      }
      return { x: node.baseX, y: node.baseY };
    };

    // ── 1. Path line + white head dot ──────────────────────────────────────
    let headX = null, headY = null;
    if (this.elapsed >= RECAP_CONFIG.PATH_START_TIME && this.nodes.length > 1) {
      const pathElapsed = this.elapsed - RECAP_CONFIG.PATH_START_TIME;
      const segF = pathElapsed / RECAP_CONFIG.SEGMENT_DURATION;
      const segIdx = Math.min(this.nodes.length - 2, Math.floor(segF));
      const frac = Math.min(1, segF - segIdx);

      ctx.save();
      ctx.strokeStyle = RECAP_CONFIG.COLOR_RED;
      ctx.lineWidth = 2 * s;
      ctx.shadowColor = RECAP_CONFIG.COLOR_RED;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const p0 = pos(this.nodes[0]);
      ctx.moveTo(p0.x, p0.y);

      for (let i = 0; i <= segIdx; i++) {
        const from = pos(this.nodes[i]);
        const to = pos(this.nodes[i + 1]);
        if (i < segIdx) {
          ctx.lineTo(to.x, to.y);
        } else {
          const hx = from.x + (to.x - from.x) * frac;
          const hy = from.y + (to.y - from.y) * frac;
          ctx.lineTo(hx, hy);
          headX = hx; headY = hy;
        }
      }
      // If all segments done, head is at last node
      if (segF >= this.nodes.length - 1) {
        const last = pos(this.nodes[this.nodes.length - 1]);
        headX = last.x; headY = last.y;
      }
      ctx.stroke();
      ctx.restore();

      // White head dot
      if (headX !== null && this.collapseProgress < 0.85) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(headX, headY, 3.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // ── 2. Pulse rings ─────────────────────────────────────────────────────
    for (const pulse of this.pulses) {
      ctx.save();
      ctx.strokeStyle = RECAP_CONFIG.COLOR_RED;
      ctx.globalAlpha = pulse.alpha * this.overallAlpha;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // ── 3. Nodes + labels ──────────────────────────────────────────────────
    const fontSize = Math.max(10, Math.round(11 * s));
    const titleSize = Math.max(11, Math.round(13 * s));
    const labelGap = Math.max(14, 22 * s); // distance from node edge to label

    for (const node of this.nodes) {
      if (!node.visible) continue;
      const { x: nx, y: ny } = pos(node);

      // Node circle
      ctx.save();
      ctx.fillStyle = RECAP_CONFIG.COLOR_WHITE;
      ctx.strokeStyle = RECAP_CONFIG.COLOR_RED;
      ctx.lineWidth = 2 * s;
      ctx.shadowColor = RECAP_CONFIG.COLOR_RED;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = this.overallAlpha;
      ctx.beginPath();
      ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Labels (alternate above/below)
      if (node.labelAlpha > 0 && this.collapseProgress < 0.5) {
        const above = node.index % 2 === 0;
        const slideDir = above ? -1 : 1;
        const labelX = nx;
        const labelY = above
          ? ny - node.radius - labelGap + node.labelSlide * slideDir
          : ny + node.radius + labelGap + node.labelSlide * slideDir;

        ctx.save();
        ctx.globalAlpha = node.labelAlpha * this.overallAlpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = above ? 'bottom' : 'top';

        // Red number
        ctx.fillStyle = RECAP_CONFIG.COLOR_LABEL_NUM;
        ctx.font = `600 ${fontSize}px 'Space Grotesk', monospace`;
        ctx.letterSpacing = '4px';
        ctx.fillText(node.num, labelX, labelY + (above ? -2 * s : 0));

        // White chapter name
        ctx.fillStyle = RECAP_CONFIG.COLOR_LABEL_TITLE;
        ctx.font = `700 ${titleSize}px 'Rajdhani', sans-serif`;
        ctx.letterSpacing = '3px';
        ctx.fillText(node.title, labelX, labelY + (above ? -2 * s - fontSize - 2 : fontSize + 3 * s));

        ctx.restore();
      }
    }

    // ── 4. Bottom ruler ────────────────────────────────────────────────────
    if (this.w > 600 && this.nodes.length > 1 && this.collapseProgress < 0.7) {
      const rulerY = h * 0.87;
      const rx1 = this.nodes[0].baseX;
      const rx2 = this.nodes[this.nodes.length - 1].baseX;

      ctx.save();
      ctx.globalAlpha = (1 - this.collapseProgress) * this.overallAlpha;
      // Base grey line
      ctx.strokeStyle = RECAP_CONFIG.COLOR_RULER_BASE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rx1, rulerY);
      ctx.lineTo(rx2, rulerY);
      ctx.stroke();

      // Ticks
      for (const n of this.nodes) {
        ctx.beginPath();
        ctx.moveTo(n.baseX, rulerY - 4);
        ctx.lineTo(n.baseX, rulerY + 4);
        ctx.stroke();
      }

      // Red progress fill
      if (headX !== null) {
        const progW = Math.max(0, Math.min(rx2 - rx1, headX - rx1));
        ctx.strokeStyle = RECAP_CONFIG.COLOR_RED;
        ctx.lineWidth = 2;
        ctx.shadowColor = RECAP_CONFIG.COLOR_RED;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(rx1, rulerY);
        ctx.lineTo(rx1 + progW, rulerY);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore(); // restore DPR scale
  }
}
