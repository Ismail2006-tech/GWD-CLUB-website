/**
 * GWD CLUB — CINEMATIC ENDING (FINAL)
 * Scene A: Journey Recap → Scene B: Logo particles + brackets + scan → Scene C: Headlines + Title + Buttons
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/ending.css';

const CHAPTERS = [
  { num: '00', title: 'THE VOID' },
  { num: '01', title: 'THE BEGINNING' },
  { num: '02', title: 'WHY GWD EXISTS' },
  { num: '03', title: 'THE CORE TEAM' },
  { num: '04', title: 'THE MEMORIES' },
  { num: '05', title: 'THE PROJECTS' },
  { num: '06', title: 'THE ACHIEVEMENTS' },
  { num: '07', title: 'THE FUTURE' },
];

// ── Draw the journey recap (0→3.5s) ─────────────────────────────────────────
function drawRecap(canvas, elapsed, w, h) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.floor(w * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);

  const s = Math.max(0.45, Math.min(1.6, Math.min(w / 1280, h / 720)));
  const isMobile = w <= 600;

  const screenL = (w - 1280 * s) / 2 + 150 * s + (isMobile ? 24 : 0);
  const screenR = (w - 1280 * s) / 2 + 1130 * s - (isMobile ? 24 : 0);
  const centerY = h * 0.48;

  let collapseP = 0, alpha = 1;
  if (elapsed >= 3.0) {
    const ct = Math.min(1, (elapsed - 3.0) / 0.5);
    collapseP = ct < 0.5 ? 4 * ct * ct * ct : 1 - Math.pow(-2 * ct + 2, 3) / 2;
    alpha = Math.max(0, 1 - ct * 1.2);
  }
  ctx.globalAlpha = alpha;

  const cx = w / 2, cy = h / 2;
  const nodes = CHAPTERS.map((ch, i) => {
    const t = i / (CHAPTERS.length - 1);
    const bx = screenL + t * (screenR - screenL);
    const by = centerY + 55 * s * Math.sin(i + 0.3);
    return { ...ch, i, bx, by, x: bx + (cx - bx) * collapseP, y: by + (cy - by) * collapseP };
  });

  const SEG = 0.36, PS = 0.6;
  let headX = null, headY = null;
  if (elapsed >= PS) {
    const pEl = elapsed - PS;
    const segF = pEl / SEG;
    const si = Math.min(CHAPTERS.length - 2, Math.floor(segF));
    const fr = Math.min(1, segF - si);
    ctx.save();
    ctx.strokeStyle = '#ff2d46'; ctx.lineWidth = 2 * s;
    ctx.shadowColor = '#ff2d46'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 0; i <= si; i++) {
      const from = nodes[i], to = nodes[Math.min(i + 1, nodes.length - 1)];
      if (i < si) { ctx.lineTo(to.x, to.y); }
      else { const hx = from.x + (to.x - from.x) * fr, hy = from.y + (to.y - from.y) * fr; ctx.lineTo(hx, hy); headX = hx; headY = hy; }
    }
    if (segF >= CHAPTERS.length - 1) { headX = nodes[nodes.length - 1].x; headY = nodes[nodes.length - 1].y; }
    ctx.stroke(); ctx.restore();
    if (headX && collapseP < 0.85) {
      ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(headX, headY, 3.5 * s, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  const nr = 5 * s;
  nodes.forEach(node => {
    const popT = Math.max(0, PS + node.i * SEG - 0.1);
    if (elapsed < popT) return;
    const since = elapsed - popT;
    const bounce = since < 0.25 ? Math.sin((since / 0.25) * Math.PI) : 0;
    const r = nr + 3 * s * bounce;
    if (since < 0.9) {
      const pr = nr + (38 * s - nr) * (since / 0.9);
      ctx.save(); ctx.strokeStyle = '#ff2d46'; ctx.globalAlpha = (1 - since / 0.9) * alpha;
      ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.arc(node.x, node.y, pr, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ff2d46'; ctx.lineWidth = 2 * s;
    ctx.shadowColor = '#ff2d46'; ctx.shadowBlur = 8; ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    if (since > 0 && collapseP < 0.5 && !isMobile) {
      const la = Math.min(1, since / 0.4), ls = 10 * s * Math.max(0, 1 - since / 0.4);
      const above = node.i % 2 === 0, dir = above ? -1 : 1;
      const ly = above ? node.y - nr - 20 * s + ls * dir : node.y + nr + 20 * s + ls * dir;
      ctx.save(); ctx.globalAlpha = la * alpha; ctx.textAlign = 'center';
      ctx.fillStyle = '#ff2d46'; ctx.font = `600 ${Math.max(9, Math.round(11 * s))}px 'Space Grotesk',monospace`;
      ctx.fillText(node.num, node.x, above ? ly : ly + Math.max(10, 12 * s) + 2);
      ctx.fillStyle = '#f2f2f4'; ctx.font = `700 ${Math.max(10, Math.round(13 * s))}px 'Rajdhani',sans-serif`;
      ctx.fillText(node.title, node.x, above ? ly - Math.max(10, 12 * s) - 3 : ly + Math.max(10, 12 * s) * 2 + 4);
      ctx.restore();
    }
  });

  if (!isMobile && elapsed >= PS && collapseP < 0.7) {
    const ry = h * 0.85, rx1 = nodes[0].bx, rx2 = nodes[nodes.length - 1].bx;
    ctx.save(); ctx.globalAlpha = (1 - collapseP) * alpha;
    ctx.strokeStyle = '#3c282e'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx1, ry); ctx.lineTo(rx2, ry); ctx.stroke();
    nodes.forEach(n => { ctx.beginPath(); ctx.moveTo(n.bx, ry - 4); ctx.lineTo(n.bx, ry + 4); ctx.stroke(); });
    if (headX) {
      const pw = Math.max(0, Math.min(rx2 - rx1, headX - rx1));
      ctx.strokeStyle = '#ff2d46'; ctx.lineWidth = 2; ctx.shadowColor = '#ff2d46'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.moveTo(rx1, ry); ctx.lineTo(rx1 + pw, ry); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

// ── Sample target points for GWD text ───────────────────────────────────────
function sampleGWDPoints(w, h, count) {
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const oc = off.getContext('2d', { willReadFrequently: true });
  if (!oc) return [];
  const fs = Math.min(w * 0.22, h * 0.42, 280);
  oc.fillStyle = '#fff';
  oc.font = `900 ${fs}px 'Orbitron','Rajdhani',sans-serif`;
  oc.textAlign = 'center'; oc.textBaseline = 'middle';
  oc.fillText('GWD', w / 2, h * 0.44);
  const img = oc.getImageData(0, 0, w, h).data;
  const pts = [];
  const step = Math.max(2, Math.floor(Math.sqrt((w * h) / (count * 4))));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (img[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
    }
  }
  if (pts.length === 0) return [];
  const out = [];
  const stride = Math.max(1, Math.floor(pts.length / count));
  for (let i = 0; i < pts.length && out.length < count; i += stride) out.push(pts[i]);
  return out;
}

// ── Draw logo particles scene (elapsed 3.5→10s) ──────────────────────────────
function drawLogoScene(canvas, elapsed, w, h, particles, logoImg) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.floor(w * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);

  const s = Math.max(0.45, Math.min(1.6, Math.min(w / 1280, h / 720)));
  const t = elapsed; // 0-relative from scene start (3.5s)

  // Fly-in: 0 → 2.4s
  const FLY_DUR = 2.4;
  // Brackets: 2.6 → 3.6s
  const BRACK_START = 2.6, BRACK_DUR = 1.0;
  // Scan: 3.2 → 4.7s
  const SCAN_START = 3.2, SCAN_DUR = 1.5;
  // Shrink: 5.0 → 6.4s (to top emblem)
  const SHRINK_START = 5.0, SHRINK_DUR = 1.4;

  // Particle bounds from sampling
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (const p of particles) { if (p.tx < minX) minX = p.tx; if (p.tx > maxX) maxX = p.tx; if (p.ty < minY) minY = p.ty; if (p.ty > maxY) maxY = p.ty; }
  const pCX = (minX + maxX) / 2, pCY = (minY + maxY) / 2;
  const pW = maxX - minX, pH = maxY - minY;

  // Target emblem position: top-centre, y ≈ 80px
  const emblY = 80 * s;
  const emblSize = 96 * s;
  const emblScale = pW > 0 ? emblSize / pW : 0.3;

  let shrinkProgress = 0;
  if (t >= SHRINK_START) {
    const sp = Math.min(1, (t - SHRINK_START) / SHRINK_DUR);
    shrinkProgress = sp < 0.5 ? 4 * sp * sp * sp : 1 - Math.pow(-2 * sp + 2, 3) / 2;
  }

  // Scan line position
  let scanX = null;
  if (t >= SCAN_START && t < SCAN_START + SCAN_DUR) {
    const sf = (t - SCAN_START) / SCAN_DUR;
    const easeScan = sf < 0.5 ? 2 * sf * sf : -1 + (4 - 2 * sf) * sf;
    scanX = minX - 40 + easeScan * (pW + 80);
  }

  // Draw particles
  const fadeIn = Math.min(1, t / 0.6);
  for (const p of particles) {
    const delay = p.delay;
    const pT = Math.max(0, t - delay);
    const flyP = Math.min(1, pT / FLY_DUR);
    const easeP = 1 - Math.pow(1 - flyP, 3);

    // Current particle position
    let px = p.sx + (p.tx - p.sx) * easeP;
    let py = p.sy + (p.ty - p.sy) * easeP;
    if (flyP >= 1) {
      px += Math.sin(t * 5 + p.phase) * 0.8;
      py += Math.cos(t * 4 + p.phase) * 0.8;
    }

    // Apply shrink toward emblem position
    if (shrinkProgress > 0) {
      const tEx = w / 2 + (p.tx - pCX) * emblScale;
      const tEy = emblY + (p.ty - pCY) * emblScale;
      px += (tEx - px) * shrinkProgress;
      py += (tEy - py) * shrinkProgress;
    }

    // Check scan flash
    const nearScan = scanX !== null && px > scanX - 70 * s && px < scanX + 5;
    let pr = 2.2 * s;
    let pc = p.color;
    if (nearScan) { pc = '#ffffff'; pr *= 1.4; }

    ctx.save();
    ctx.globalAlpha = fadeIn;
    if (nearScan) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 10; }
    else if (p.isRed) { ctx.shadowColor = '#ff3c55'; ctx.shadowBlur = 5; }
    ctx.fillStyle = pc;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Scan line
  if (scanX !== null && shrinkProgress < 0.1) {
    ctx.save();
    ctx.strokeStyle = '#ff465f'; ctx.lineWidth = 2 * s;
    ctx.shadowColor = '#ff465f'; ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(scanX, minY - 30 * s);
    ctx.lineTo(scanX, maxY + 30 * s);
    ctx.stroke();
    ctx.restore();
  }

  // Brackets
  if (t >= BRACK_START && shrinkProgress < 1) {
    const bp = Math.min(1, (t - BRACK_START) / BRACK_DUR);
    const eB = 1 - Math.pow(1 - bp, 3);

    // Shrink brackets with the logo
    const padX = ((70 - 70 * shrinkProgress * (1 - emblScale)) * s) * (1 - shrinkProgress * 0.7);
    const padY = ((56 - 56 * shrinkProgress * (1 - emblScale)) * s) * (1 - shrinkProgress * 0.7);
    const arm = (54 * eB * s) * (1 - shrinkProgress * 0.7) + 13 * s * shrinkProgress;

    const cx2 = shrinkProgress > 0 ? w / 2 : pCX;
    const cy2 = shrinkProgress > 0 ? emblY : pCY;
    const hw = (pW / 2 + padX) * (1 - shrinkProgress) + (emblSize / 2 + 10 * s) * shrinkProgress;
    const hh = (pH / 2 + padY) * (1 - shrinkProgress) + (emblSize * 0.6 + 8 * s) * shrinkProgress;

    const L = cx2 - hw, R = cx2 + hw, T = cy2 - hh, B = cy2 + hh;

    ctx.save();
    ctx.strokeStyle = '#ff2d46'; ctx.lineWidth = (2 - shrinkProgress) * s;
    ctx.shadowColor = '#ff2d46'; ctx.shadowBlur = 8;
    // TL
    ctx.beginPath(); ctx.moveTo(L, T + arm); ctx.lineTo(L, T); ctx.lineTo(L + arm, T); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(R - arm, T); ctx.lineTo(R, T); ctx.lineTo(R, T + arm); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(L, B - arm); ctx.lineTo(L, B); ctx.lineTo(L + arm, B); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(R - arm, B); ctx.lineTo(R, B); ctx.lineTo(R, B - arm); ctx.stroke();

    // Labels (fade out as it shrinks)
    if (shrinkProgress < 0.5) {
      const la = (1 - shrinkProgress * 2) * bp;
      ctx.globalAlpha = la;
      ctx.font = `600 ${Math.max(9, Math.round(11 * s))}px 'Space Grotesk',monospace`;
      ctx.fillStyle = '#bebec4';
      ctx.textAlign = 'left';
      ctx.fillText('SIGNAL // GWD', L, T - 8 * s);
      ctx.textAlign = 'right';
      ctx.fillText('NETWORK ONLINE', R - 14 * s, B + 16 * s);
      // Green blinking dot
      if (Math.floor(t * 3) % 2 === 0) {
        ctx.fillStyle = '#2dff8a'; ctx.shadowColor = '#2dff8a'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(R - 4 * s, B + 12 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  // Cross-fade to real logo at top when fully shrunk
  if (shrinkProgress > 0.5 && logoImg) {
    const la = (shrinkProgress - 0.5) * 2;
    const lw = emblSize, lh = emblSize;
    ctx.save();
    ctx.globalAlpha = la;
    ctx.drawImage(logoImg, w / 2 - lw / 2, emblY - lh / 2, lw, lh);
    ctx.restore();
  }

  ctx.restore();
}

// ── Network background ────────────────────────────────────────────────────────
function makeNodes(w, h) {
  return Array.from({ length: w <= 600 ? 30 : 55 }, () => {
    const g = Math.random() < 0.3;
    return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45, r: 1.8 + Math.random() * 0.8, isGreen: g, color: g ? '#2dff8a' : '#ff2d46', phase: Math.random() * Math.PI * 2 };
  });
}
function drawNetwork(canvas, w, h, t, nodes) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.floor(w * dpr)) { canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr); }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.scale(dpr, dpr);
  for (const n of nodes) {
    n.x += n.vx; n.y += n.vy;
    if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20;
    if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20;
  }
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 190) { ctx.strokeStyle = a.isGreen && b.isGreen ? `rgba(45,255,138,${0.18 * (1 - d / 190)})` : `rgba(255,45,70,${0.18 * (1 - d / 190)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  }
  for (const n of nodes) {
    const p = 1 + Math.sin(t * 0.003 + n.phase) * 0.15;
    ctx.save(); ctx.fillStyle = n.color; ctx.globalAlpha = 0.7; ctx.shadowColor = n.color; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r * p, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CinematicEnding({ onOpenJoinModal }) {
  const containerRef = useRef(null);
  const netCanvasRef = useRef(null);
  const recapCanvasRef = useRef(null);
  const logoCanvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const nodesRef = useRef([]);
  const particlesRef = useRef([]);
  const logoImgRef = useRef(null);
  const activeRef = useRef(false);
  const phaseRef = useRef('idle'); // idle|recap|logo|main|done

  const [uiPhase, setUiPhase] = useState('idle');
  const [recapCounter, setRecapCounter] = useState('CHAPTER 00 / 07');
  const [showH1, setShowH1] = useState(false);
  const [showH2, setShowH2] = useState(false);
  const [showH3, setShowH3] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showBtns, setShowBtns] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [showLogo, setShowLogo] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const typingRef = useRef(false);

  const STATUS_FULL = 'END OF CURRENT ARCHIVE // HORIZON ACTIVE';

  const doTypeStatus = useCallback(() => {
    if (typingRef.current) return;
    typingRef.current = true;
    let i = 0;
    setStatusText('');
    const iv = setInterval(() => {
      i++;
      setStatusText(STATUS_FULL.slice(0, i));
      if (i >= STATUS_FULL.length) { clearInterval(iv); }
    }, 38);
  }, []);

  const revealMain = useCallback(() => {
    setShowLogo(true);
    setShowH1(true);
    setTimeout(() => setShowH2(true), 350);
    setTimeout(() => setShowH3(true), 700);
    setTimeout(() => setShowTitle(true), 1300);
    setTimeout(() => setShowSub(true), 2000);
    setTimeout(() => setShowBtns(true), 2600);
    setTimeout(doTypeStatus, 3200);
  }, [doTypeStatus]);

  const skipToEnd = useCallback(() => {
    if (skipped) return;
    setSkipped(true);
    activeRef.current = false;
    phaseRef.current = 'done';
    // Clear canvases
    [recapCanvasRef.current, logoCanvasRef.current].forEach(c => {
      if (c) c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    });
    setUiPhase('main');
    revealMain();
  }, [skipped, revealMain]);

  const startTimeline = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    phaseRef.current = 'recap';
    setUiPhase('recap');
    setShowH1(false); setShowH2(false); setShowH3(false);
    setShowTitle(false); setShowSub(false); setShowBtns(false);
    setShowLogo(false); setStatusText(''); setSkipped(false);
    typingRef.current = false;

    startRef.current = performance.now();
    const lastChRef = { v: -1 };
    const h1Ref = { done: false }, h2Ref = { done: false }, h3Ref = { done: false };
    const tRef = { done: false }, sRef = { done: false }, bRef = { done: false }, stRef = { done: false };
    const logoRevRef = { done: false };

    // LOGO scene start offset (after recap 3.5s)
    const LOGO_START = 3.5; // absolute elapsed
    const MAIN_START = 3.5 + 6.5; // 10s total before headlines

    const loop = (now) => {
      if (!activeRef.current) return;
      const elapsed = (now - startRef.current) / 1000;
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const h = window.innerHeight;

      // Network
      if (netCanvasRef.current) drawNetwork(netCanvasRef.current, w, h, now, nodesRef.current);

      // RECAP phase (0 → 3.7s)
      if (elapsed < 3.7 && recapCanvasRef.current) {
        drawRecap(recapCanvasRef.current, elapsed, w, h);
        const SEG = 0.36, PS = 0.6;
        const reached = Math.min(7, Math.max(0, Math.floor((elapsed - PS) / SEG)));
        if (reached > lastChRef.v) { lastChRef.v = reached; setRecapCounter(`CHAPTER 0${reached} / 07`); }
      } else if (elapsed >= 3.7 && recapCanvasRef.current) {
        recapCanvasRef.current.getContext('2d')?.clearRect(0, 0, recapCanvasRef.current.width, recapCanvasRef.current.height);
      }

      // Transition recap → logo phase
      if (elapsed >= LOGO_START && phaseRef.current === 'recap') {
        phaseRef.current = 'logo';
        setUiPhase('logo');
      }

      // LOGO particle scene (elapsed 3.5 → 10s)
      if (elapsed >= LOGO_START && elapsed < MAIN_START + 1 && logoCanvasRef.current) {
        drawLogoScene(logoCanvasRef.current, elapsed - LOGO_START, w, h, particlesRef.current, logoImgRef.current);
      } else if (elapsed >= MAIN_START + 1 && logoCanvasRef.current) {
        logoCanvasRef.current.getContext('2d')?.clearRect(0, 0, logoCanvasRef.current.width, logoCanvasRef.current.height);
      }

      // Show real logo after shrink completes (~LOGO_START + 5 + 1.4 = 9.9s)
      if (elapsed >= LOGO_START + 6.5 && !logoRevRef.done) { logoRevRef.done = true; setShowLogo(true); }

      // MAIN content reveals after logo
      if (elapsed >= MAIN_START && phaseRef.current === 'logo') { phaseRef.current = 'main'; setUiPhase('main'); }
      if (elapsed >= MAIN_START && !h1Ref.done) { h1Ref.done = true; setShowH1(true); }
      if (elapsed >= MAIN_START + 0.4 && !h2Ref.done) { h2Ref.done = true; setShowH2(true); }
      if (elapsed >= MAIN_START + 0.8 && !h3Ref.done) { h3Ref.done = true; setShowH3(true); }
      if (elapsed >= MAIN_START + 1.5 && !tRef.done) { tRef.done = true; setShowTitle(true); }
      if (elapsed >= MAIN_START + 2.3 && !sRef.done) { sRef.done = true; setShowSub(true); }
      if (elapsed >= MAIN_START + 2.9 && !bRef.done) { bRef.done = true; setShowBtns(true); }
      if (elapsed >= MAIN_START + 3.5 && !stRef.done) { stRef.done = true; doTypeStatus(); }

      if (elapsed < 18) rafRef.current = requestAnimationFrame(loop);
      else { activeRef.current = false; setUiPhase('done'); }
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [doTypeStatus]);

  useEffect(() => {
    const w = window.innerWidth, h = window.innerHeight;
    nodesRef.current = makeNodes(w, h);

    // Load logo image
    const img = new Image();
    img.src = '/gwd-logo.png';
    img.onload = () => { logoImgRef.current = img; };

    // Sample GWD particles
    const count = w <= 600 ? 1000 : 2000;
    const pts = sampleGWDPoints(w, h, count);
    particlesRef.current = pts.map(pt => {
      const r = Math.random();
      const color = r < 0.25 ? '#ff3c55' : r < 0.5 ? '#ffafbc' : '#f5f5f8';
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.max(w, h) * (0.5 + Math.random() * 0.8);
      return {
        tx: pt.x, ty: pt.y,
        sx: w / 2 + Math.cos(angle) * dist,
        sy: h / 2 + Math.sin(angle) * dist,
        color, isRed: r < 0.25,
        delay: Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
      };
    });

    // Start network loop (always running)
    let netRaf;
    const netOnly = (now) => {
      if (!activeRef.current && netCanvasRef.current) {
        const cw = containerRef.current?.clientWidth || window.innerWidth;
        drawNetwork(netCanvasRef.current, cw, window.innerHeight, now, nodesRef.current);
      }
      netRaf = requestAnimationFrame(netOnly);
    };
    netRaf = requestAnimationFrame(netOnly);

    // Observer triggers the whole timeline
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !activeRef.current) startTimeline();
    }, { threshold: 0.1 });
    if (containerRef.current) obs.observe(containerRef.current);

    const onKey = (e) => { if (e.key === 'Escape') skipToEnd(); };
    window.addEventListener('keydown', onKey);

    return () => {
      obs.disconnect();
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(netRaf);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      activeRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReplay = useCallback(() => {
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(0, { duration: 2.0 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      activeRef.current = false; phaseRef.current = 'idle';
      setUiPhase('idle'); setShowH1(false); setShowH2(false); setShowH3(false);
      setShowTitle(false); setShowSub(false); setShowBtns(false);
      setShowLogo(false); setStatusText(''); setSkipped(false); typingRef.current = false;
    }, 2200);
  }, []);

  const isRecap = uiPhase === 'recap' || uiPhase === 'idle';

  return (
    <div id="future" ref={containerRef} className="cinematic-ending-root">
      <div className="ending-viewport-stage">
        {/* Canvases */}
        <div className="ending-vignette-overlay" />
        <canvas ref={netCanvasRef} className="ending-network-canvas" />
        <canvas ref={recapCanvasRef} className="ending-recap-canvas" />
        <canvas ref={logoCanvasRef} className="ending-particles-canvas" />

        {/* Skip button (no duplicate HUD — site's HUD handles that) */}
        {!skipped && (uiPhase === 'recap' || uiPhase === 'logo') && (
          <button className="ending-skip-btn" onClick={skipToEnd} aria-label="Skip to final">
            SKIP →
          </button>
        )}

        {/* Recap overlay title + counter */}
        {isRecap && (
          <div className="ending-recap-dom-layer">
            <p className="ending-recap-title">THE JOURNEY SO FAR</p>
            <div className="ending-recap-counter">{recapCounter}</div>
          </div>
        )}

        {/* LOGO EMBLEM — visible after logo scene settles */}
        <div className={`ending-emblem-top${showLogo ? ' visible' : ''}`} aria-hidden="true">
          <img src="/gwd-logo.png" alt="GWD Club" className="ending-emblem-img" />
          <div className="ending-emblem-sub">
            <span className="emblem-sub-line">GET WORK DONE</span>
            <span className="emblem-sub-line red">CLUB</span>
          </div>
        </div>

        {/* MAIN CONTENT FLOW */}
        <div className={`ending-main-content-flow${isRecap || uiPhase === 'logo' ? ' ending-content-hidden' : ''}`}>
          <div className="ending-masked-headline">
            <p className={`headline-text-line${showH1 ? ' revealed' : ''}`}>THE FUTURE.</p>
          </div>
          <div className="ending-masked-headline">
            <p className={`headline-text-line${showH2 ? ' revealed' : ''}`}>THE UNKNOWN AWAITS.</p>
          </div>
          <div className="ending-masked-headline">
            <p className={`headline-text-line accent-red${showH3 ? ' revealed' : ''}`}>THE STORY IS STILL BEING WRITTEN.</p>
          </div>

          <div className={`ending-big-title-container${showTitle ? ' revealed' : ''}`}>
            <h1 className="ending-big-title">
              <span className="title-word-gwd">GWD</span>
              <span className="title-word-club">CLUB</span>
            </h1>
          </div>

          <p className={`ending-sub-manifesto${showSub ? ' revealed' : ''}`}>GET WORK DONE</p>

          <div className={`ending-buttons-group${showBtns ? ' revealed' : ''}`}>
            <button className="ending-primary-btn" onClick={() => onOpenJoinModal?.()} aria-label="Join GWD Club">
              <span className="btn-diagonal-shine" />
              JOIN THE CLUB →
            </button>
            <button className="ending-secondary-btn" onClick={handleReplay} aria-label="Replay the journey">
              REPLAY THE JOURNEY
            </button>
          </div>

          <div className="ending-status-line">
            <span className="ending-status-dot" />
            <span className="ending-status-text">{statusText}</span>
          </div>
        </div>
      </div>

      {/* STAY CONNECTED */}
      <section className="ending-stay-connected-section" aria-label="Stay Connected">
        <span className="connected-kicker-label">STAY CONNECTED</span>
        <h2 className="connected-main-heading">THE JOURNEY CONTINUES<br />BEYOND THIS SCREEN.</h2>
        <div className="connected-columns-grid">
          <a href="https://www.instagram.com/gwdclub.vjit" target="_blank" rel="noopener noreferrer" className="connected-card-column" aria-label="Instagram GWD CLUB VJIT">
            <div className="connected-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </div>
            <span className="connected-label-tag">INSTAGRAM</span>
            <span className="connected-value-tag">GWD CLUB VJIT</span>
            <span className="connected-card-underline" />
          </a>
          <a href="https://www.linkedin.com/showcase/gwd-club-vjit/" target="_blank" rel="noopener noreferrer" className="connected-card-column" aria-label="LinkedIn GWD CLUB VJIT">
            <div className="connected-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </div>
            <span className="connected-label-tag">LINKEDIN</span>
            <span className="connected-value-tag">GWD CLUB VJIT</span>
            <span className="connected-card-underline" />
          </a>
          <a href="mailto:gwdclubvjit@gmail.com" className="connected-card-column" aria-label="Email gwdclubvjit@gmail.com">
            <div className="connected-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <span className="connected-label-tag">EMAIL</span>
            <span className="connected-value-tag">gwdclubvjit@gmail.com</span>
            <span className="connected-card-underline" />
          </a>
        </div>
        <div className="connected-footer-brand">GWD CLUB — GET WORK DONE</div>
      </section>
    </div>
  );
}
