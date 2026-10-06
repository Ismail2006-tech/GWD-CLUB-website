/**
 * GWD CLUB — CINEMATIC ENDING (FINAL v3)
 * Recap → Big centre particle GWD → brackets+scan → hold → shrink to top → cross-fade → headlines
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

/* ═══════════════════════════════════════════════════════════════════════════
   RECAP CANVAS (0 → 3.5s)
   ═══════════════════════════════════════════════════════════════════════════ */
function drawRecap(canvas, elapsed, w, h) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.floor(w * dpr)) { canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr); }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.scale(dpr, dpr);

  const s = Math.max(0.45, Math.min(1.6, Math.min(w / 1280, h / 720)));
  const mob = w <= 600;
  const sL = (w - 1280 * s) / 2 + 150 * s + (mob ? 24 : 0);
  const sR = (w - 1280 * s) / 2 + 1130 * s - (mob ? 24 : 0);
  const cY = h * 0.48;
  let cp = 0, al = 1;
  if (elapsed >= 3.0) { const ct = Math.min(1, (elapsed - 3) / 0.5); cp = ct < .5 ? 4*ct*ct*ct : 1-Math.pow(-2*ct+2,3)/2; al = Math.max(0, 1 - ct * 1.2); }
  ctx.globalAlpha = al;
  const cx = w / 2, cy = h / 2;
  const nodes = CHAPTERS.map((ch, i) => { const t = i / 7; const bx = sL + t * (sR - sL); const by = cY + 55 * s * Math.sin(i + .3); return { ...ch, i, bx, by, x: bx + (cx - bx) * cp, y: by + (cy - by) * cp }; });
  const SEG = .36, PS = .6;
  let hX = null, hY = null;
  if (elapsed >= PS) {
    const pE = elapsed - PS, sF = pE / SEG, si = Math.min(6, Math.floor(sF)), fr = Math.min(1, sF - si);
    ctx.save(); ctx.strokeStyle = '#ff2d46'; ctx.lineWidth = 2 * s; ctx.shadowColor = '#ff2d46'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 0; i <= si; i++) { const f = nodes[i], t2 = nodes[Math.min(i + 1, 7)]; if (i < si) ctx.lineTo(t2.x, t2.y); else { hX = f.x + (t2.x - f.x) * fr; hY = f.y + (t2.y - f.y) * fr; ctx.lineTo(hX, hY); } }
    if (sF >= 7) { hX = nodes[7].x; hY = nodes[7].y; } ctx.stroke(); ctx.restore();
    if (hX && cp < .85) { ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(hX, hY, 3.5 * s, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }
  const nr = 5 * s;
  nodes.forEach(n => {
    const pT = Math.max(0, PS + n.i * SEG - .1); if (elapsed < pT) return;
    const since = elapsed - pT, bounce = since < .25 ? Math.sin((since / .25) * Math.PI) : 0, r = nr + 3 * s * bounce;
    if (since < .9) { const pr2 = nr + (38 * s - nr) * (since / .9); ctx.save(); ctx.strokeStyle = '#ff2d46'; ctx.globalAlpha = (1 - since / .9) * al; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.arc(n.x, n.y, pr2, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ff2d46'; ctx.lineWidth = 2 * s; ctx.shadowColor = '#ff2d46'; ctx.shadowBlur = 8; ctx.globalAlpha = al;
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
    if (since > 0 && cp < .5 && !mob) {
      const la = Math.min(1, since / .4), ls = 10 * s * Math.max(0, 1 - since / .4);
      const above = n.i % 2 === 0, dir = above ? -1 : 1;
      const ly = above ? n.y - nr - 20 * s + ls * dir : n.y + nr + 20 * s + ls * dir;
      ctx.save(); ctx.globalAlpha = la * al; ctx.textAlign = 'center';
      ctx.fillStyle = '#ff2d46'; ctx.font = `600 ${Math.max(9, Math.round(11 * s))}px 'Space Grotesk',monospace`; ctx.fillText(n.num, n.x, above ? ly : ly + Math.max(10, 12 * s) + 2);
      ctx.fillStyle = '#f2f2f4'; ctx.font = `700 ${Math.max(10, Math.round(13 * s))}px 'Rajdhani',sans-serif`; ctx.fillText(n.title, n.x, above ? ly - Math.max(10, 12 * s) - 3 : ly + Math.max(10, 12 * s) * 2 + 4);
      ctx.restore();
    }
  });
  if (!mob && elapsed >= PS && cp < .7) {
    const ry = h * .85, rx1 = nodes[0].bx, rx2 = nodes[7].bx;
    ctx.save(); ctx.globalAlpha = (1 - cp) * al; ctx.strokeStyle = '#3c282e'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx1, ry); ctx.lineTo(rx2, ry); ctx.stroke();
    nodes.forEach(nd => { ctx.beginPath(); ctx.moveTo(nd.bx, ry - 4); ctx.lineTo(nd.bx, ry + 4); ctx.stroke(); });
    if (hX) { const pw = Math.max(0, Math.min(rx2 - rx1, hX - rx1)); ctx.strokeStyle = '#ff2d46'; ctx.lineWidth = 2; ctx.shadowColor = '#ff2d46'; ctx.shadowBlur = 6; ctx.beginPath(); ctx.moveTo(rx1, ry); ctx.lineTo(rx1 + pw, ry); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════════════════
   SAMPLE GWD TARGET POINTS
   ═══════════════════════════════════════════════════════════════════════════ */
function sampleGWD(w, h, count, fontSize) {
  const off = document.createElement('canvas'); off.width = w; off.height = h;
  const oc = off.getContext('2d', { willReadFrequently: true }); if (!oc) return [];
  oc.fillStyle = '#fff'; oc.font = `900 ${fontSize}px 'Orbitron','Rajdhani',sans-serif`;
  oc.textAlign = 'center'; oc.textBaseline = 'middle'; oc.fillText('GWD', w / 2, h * 0.44);
  const img = oc.getImageData(0, 0, w, h).data; const pts = [];
  const step = Math.max(2, Math.floor(Math.sqrt((w * h) / (count * 4))));
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (img[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
  const out = []; const stride = Math.max(1, Math.floor(pts.length / count));
  for (let i = 0; i < pts.length && out.length < count; i += stride) out.push(pts[i]);
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGO PARTICLE SCENE (t = local time from scene start)
   TIMELINE (local):
     0  – 2.4s  fly-in to BIG centre
     2.4 – 3.6  brackets close + scan
     3.6 – 4.6  HOLD
     4.6 – 6.0  shrink to top
     6.0 – 6.5  cross-fade particles→real logo (particles alpha 1→0)
   ═══════════════════════════════════════════════════════════════════════════ */
function drawLogoScene(canvas, t, w, h, particles, pBounds) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.floor(w * dpr)) { canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr); }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (t > 6.5) return; // after cross-fade, stop drawing particles entirely
  ctx.save(); ctx.scale(dpr, dpr);

  const s = Math.max(0.45, Math.min(1.6, Math.min(w / 1280, h / 720)));

  // Bounds of big centre GWD
  const pCX = pBounds.cx, pCY = pBounds.cy, pW = pBounds.w, pH = pBounds.h;

  // Emblem target: top-centre at 110px from top
  const EMBL_Y = 110;
  const EMBL_SIZE = Math.min(96, Math.max(56, w * 0.07));
  const emblScale = pW > 0 ? EMBL_SIZE / pW : 0.3;

  // Shrink progress (4.6 → 6.0)
  let shrinkP = 0;
  if (t >= 4.6) { const sp = Math.min(1, (t - 4.6) / 1.4); shrinkP = sp < .5 ? 4*sp*sp*sp : 1-Math.pow(-2*sp+2,3)/2; }

  // Cross-fade alpha (6.0 → 6.5): particles fade out
  let particleAlpha = 1;
  if (t >= 6.0) particleAlpha = Math.max(0, 1 - (t - 6.0) / 0.5);

  // Scan line
  let scanX = null;
  if (t >= 2.8 && t < 3.6) {
    const sf = (t - 2.8) / 0.8;
    scanX = (pCX - pW / 2 - 40) + sf * (pW + 80);
  }

  // Draw particles
  const flyFade = Math.min(1, t / 0.5);
  ctx.globalAlpha = particleAlpha;
  for (const p of particles) {
    const pT = Math.max(0, t - p.delay);
    const flyP = Math.min(1, pT / 2.4);
    const easeP = 1 - Math.pow(1 - flyP, 3);

    // Base target = big centre
    let px = p.sx + (p.tx - p.sx) * easeP;
    let py = p.sy + (p.ty - p.sy) * easeP;

    // Jitter when formed
    if (flyP >= 1) { px += Math.sin(t * 5 + p.phase) * 0.8; py += Math.cos(t * 4 + p.phase) * 0.8; }

    // Shrink: move toward emblem position
    if (shrinkP > 0) {
      const tEx = w / 2 + (p.tx - pCX) * emblScale;
      const tEy = EMBL_Y + (p.ty - pCY) * emblScale;
      px += (tEx - px) * shrinkP;
      py += (tEy - py) * shrinkP;
    }

    const nearScan = scanX !== null && px > scanX - 60 * s && px < scanX + 5;
    const pr = (nearScan ? 3.2 : 2.2) * s;
    const pc = nearScan ? '#ffffff' : p.color;

    ctx.save();
    ctx.globalAlpha = flyFade * particleAlpha;
    if (nearScan) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 10; }
    else if (p.isRed) { ctx.shadowColor = '#ff3c55'; ctx.shadowBlur = 5; }
    ctx.fillStyle = pc;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Scan line beam
  if (scanX !== null && shrinkP < 0.1) {
    ctx.save(); ctx.globalAlpha = particleAlpha;
    ctx.strokeStyle = '#ff465f'; ctx.lineWidth = 2 * s; ctx.shadowColor = '#ff465f'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(scanX, pCY - pH / 2 - 30 * s); ctx.lineTo(scanX, pCY + pH / 2 + 30 * s); ctx.stroke();
    ctx.restore();
  }

  // Brackets (appear 2.4 → 3.4, then shrink with logo)
  if (t >= 2.4) {
    const bp = Math.min(1, (t - 2.4) / 1.0);
    const eB = 1 - Math.pow(1 - bp, 3);

    // Current centre and half-size
    const curCX = pCX + (w / 2 - pCX) * shrinkP;
    const curCY = pCY + (EMBL_Y - pCY) * shrinkP;
    const curHW = (pW / 2 + 50 * s) * (1 - shrinkP) + (EMBL_SIZE / 2 + 12 * s) * shrinkP;
    const curHH = (pH / 2 + 40 * s) * (1 - shrinkP) + (EMBL_SIZE * 0.5 + 10 * s) * shrinkP;
    const arm = (50 * eB * s) * (1 - shrinkP * 0.6) + 14 * s * shrinkP;

    const L = curCX - curHW, R = curCX + curHW, T = curCY - curHH, B = curCY + curHH;
    ctx.save(); ctx.globalAlpha = particleAlpha;
    ctx.strokeStyle = '#ff2d46'; ctx.lineWidth = (2 - shrinkP * 0.5) * s; ctx.shadowColor = '#ff2d46'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(L, T + arm); ctx.lineTo(L, T); ctx.lineTo(L + arm, T); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(R - arm, T); ctx.lineTo(R, T); ctx.lineTo(R, T + arm); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L, B - arm); ctx.lineTo(L, B); ctx.lineTo(L + arm, B); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(R - arm, B); ctx.lineTo(R, B); ctx.lineTo(R, B - arm); ctx.stroke();

    // Labels (only when big, fade during shrink)
    if (shrinkP < 0.3) {
      const la = (1 - shrinkP * 3) * bp * particleAlpha;
      ctx.globalAlpha = la;
      ctx.font = `600 ${Math.max(9, Math.round(11 * s))}px 'Space Grotesk',monospace`;
      ctx.fillStyle = '#bebec4'; ctx.textAlign = 'left'; ctx.fillText('SIGNAL // GWD', L, T - 8 * s);
      ctx.textAlign = 'right'; ctx.fillText('NETWORK ONLINE', R - 14 * s, B + 16 * s);
      if (Math.floor(t * 3) % 2 === 0) { ctx.fillStyle = '#2dff8a'; ctx.shadowColor = '#2dff8a'; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(R - 4 * s, B + 12 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════════════════
   NETWORK BACKGROUND
   ═══════════════════════════════════════════════════════════════════════════ */
function makeNodes(w, h) {
  return Array.from({ length: w <= 600 ? 30 : 55 }, () => {
    const g = Math.random() < .3;
    return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45, r: 1.8 + Math.random() * .8, isGreen: g, color: g ? '#2dff8a' : '#ff2d46', phase: Math.random() * Math.PI * 2 };
  });
}
function drawNet(canvas, w, h, t, nodes) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.floor(w * dpr)) { canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr); }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.scale(dpr, dpr);
  for (const n of nodes) { n.x += n.vx; n.y += n.vy; if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20; if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20; }
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 190) { ctx.strokeStyle = `rgba(255,45,70,${0.15*(1-d/190)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  }
  for (const n of nodes) { const p = 1 + Math.sin(t * .003 + n.phase) * .15; ctx.save(); ctx.fillStyle = n.color; ctx.globalAlpha = .65; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * p, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CinematicEnding({ onOpenJoinModal }) {
  const containerRef = useRef(null);
  const netRef = useRef(null);
  const recapRef = useRef(null);
  const logoRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const netNodesRef = useRef([]);
  const particlesRef = useRef([]);
  const pBoundsRef = useRef({ cx: 0, cy: 0, w: 0, h: 0 });
  const logoImgRef = useRef(null);
  const activeRef = useRef(false);

  const [uiPhase, setUiPhase] = useState('idle');
  const [counter, setCounter] = useState('CHAPTER 00 / 07');
  const [showLogo, setShowLogo] = useState(false);   // real logo img at top
  const [showH1, setShowH1] = useState(false);
  const [showH2, setShowH2] = useState(false);
  const [showH3, setShowH3] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showBtns, setShowBtns] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [skipped, setSkipped] = useState(false);
  const typingRef = useRef(false);

  const STATUS = 'END OF CURRENT ARCHIVE // HORIZON ACTIVE';

  const doType = useCallback(() => {
    if (typingRef.current) return; typingRef.current = true;
    let i = 0; setStatusText('');
    const iv = setInterval(() => { i++; setStatusText(STATUS.slice(0, i)); if (i >= STATUS.length) clearInterval(iv); }, 38);
  }, []);

  const revealAll = useCallback(() => {
    setShowLogo(true);
    setShowH1(true);
    setTimeout(() => setShowH2(true), 300);
    setTimeout(() => setShowH3(true), 600);
    setTimeout(() => setShowTitle(true), 1100);
    setTimeout(() => setShowSub(true), 1800);
    setTimeout(() => setShowBtns(true), 2300);
    setTimeout(doType, 2800);
  }, [doType]);

  const skipToEnd = useCallback(() => {
    if (skipped) return; setSkipped(true);
    activeRef.current = false;
    [recapRef.current, logoRef.current].forEach(c => { if (c) { const cx = c.getContext('2d'); cx?.clearRect(0, 0, c.width, c.height); } });
    setUiPhase('main');
    revealAll();
  }, [skipped, revealAll]);

  /* ── TIMELINE ABSOLUTE:
       0    – 3.5   recap
       3.5  – 5.9   particles fly in (2.4s)
       5.9  – 7.1   brackets + scan (1.2s)
       7.1  – 8.1   hold (1s)
       8.1  – 9.5   shrink (1.4s)
       9.5  – 10.0  cross-fade (0.5s)
       10.0 – ...   reveal headlines etc
  */
  const LOGO_START = 3.5;
  const MAIN_START = 10.0;

  const startTimeline = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true; setUiPhase('recap');
    setShowH1(false); setShowH2(false); setShowH3(false);
    setShowTitle(false); setShowSub(false); setShowBtns(false);
    setShowLogo(false); setStatusText(''); setSkipped(false);
    typingRef.current = false; startRef.current = performance.now();

    const lastCh = { v: -1 };
    const flags = { h1: false, h2: false, h3: false, t: false, s: false, b: false, st: false, logo: false };

    const loop = (now) => {
      if (!activeRef.current) return;
      const el = (now - startRef.current) / 1000;
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const h = window.innerHeight;

      // Network
      if (netRef.current) drawNet(netRef.current, w, h, now, netNodesRef.current);

      // Recap (0→3.7)
      if (el < 3.7 && recapRef.current) {
        drawRecap(recapRef.current, el, w, h);
        const reached = Math.min(7, Math.max(0, Math.floor((el - 0.6) / 0.36)));
        if (reached > lastCh.v) { lastCh.v = reached; setCounter(`CHAPTER 0${reached} / 07`); }
      } else if (el >= 3.7 && recapRef.current) {
        recapRef.current.getContext('2d')?.clearRect(0, 0, recapRef.current.width, recapRef.current.height);
      }

      // Phase transitions
      if (el >= LOGO_START && uiPhase === 'recap') setUiPhase('logo');

      // Logo particles (t = local time)
      const lt = el - LOGO_START;
      if (el >= LOGO_START && logoRef.current) {
        drawLogoScene(logoRef.current, lt, w, h, particlesRef.current, pBoundsRef.current);
      }

      // Cross-fade: show real logo at lt=6.0
      if (lt >= 6.0 && !flags.logo) { flags.logo = true; setShowLogo(true); }

      // After lt 6.5 = particles canvas empty, transition to main
      if (el >= MAIN_START && !flags.h1) { setUiPhase('main'); }

      // Reveals
      if (el >= MAIN_START && !flags.h1) { flags.h1 = true; setShowH1(true); }
      if (el >= MAIN_START + 0.4 && !flags.h2) { flags.h2 = true; setShowH2(true); }
      if (el >= MAIN_START + 0.8 && !flags.h3) { flags.h3 = true; setShowH3(true); }
      if (el >= MAIN_START + 1.5 && !flags.t) { flags.t = true; setShowTitle(true); }
      if (el >= MAIN_START + 2.3 && !flags.s) { flags.s = true; setShowSub(true); }
      if (el >= MAIN_START + 2.9 && !flags.b) { flags.b = true; setShowBtns(true); }
      if (el >= MAIN_START + 3.5 && !flags.st) { flags.st = true; doType(); }

      if (el < 20) rafRef.current = requestAnimationFrame(loop);
      else { activeRef.current = false; setUiPhase('done'); }
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [doType, uiPhase]);

  // INIT
  useEffect(() => {
    const w = window.innerWidth, h = window.innerHeight;
    netNodesRef.current = makeNodes(w, h);

    // Load logo
    const img = new Image(); img.src = '/gwd-logo.png';
    img.onload = () => { logoImgRef.current = img; };

    // Sample particles for big centre GWD (~40vh)
    const fs = Math.min(w * 0.22, h * 0.42, 280);
    const count = w <= 600 ? 1000 : 2000;
    const pts = sampleGWD(w, h, count, fs);

    // Compute bounds
    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (const p of pts) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
    pBoundsRef.current = { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX || 200, h: maxY - minY || 100 };

    particlesRef.current = pts.map(pt => {
      const r = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.max(w, h) * (0.5 + Math.random() * 0.8);
      return {
        tx: pt.x, ty: pt.y,
        sx: w / 2 + Math.cos(angle) * dist,
        sy: h / 2 + Math.sin(angle) * dist,
        color: r < .25 ? '#ff3c55' : r < .5 ? '#ffafbc' : '#f5f5f8',
        isRed: r < .25,
        delay: Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
      };
    });

    // Network idle loop
    let netRaf;
    const netLoop = (now) => {
      if (!activeRef.current && netRef.current) {
        drawNet(netRef.current, containerRef.current?.clientWidth || w, window.innerHeight, now, netNodesRef.current);
      }
      netRaf = requestAnimationFrame(netLoop);
    };
    netRaf = requestAnimationFrame(netLoop);

    // Observer
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !activeRef.current) startTimeline();
    }, { threshold: 0.1 });
    if (containerRef.current) obs.observe(containerRef.current);

    const onKey = (e) => { if (e.key === 'Escape') skipToEnd(); };
    window.addEventListener('keydown', onKey);

    return () => { obs.disconnect(); window.removeEventListener('keydown', onKey); cancelAnimationFrame(netRaf); if (rafRef.current) cancelAnimationFrame(rafRef.current); activeRef.current = false; };
  }, []); // eslint-disable-line

  const handleReplay = useCallback(() => {
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(0, { duration: 2 }); else window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      activeRef.current = false;
      setUiPhase('idle'); setShowH1(false); setShowH2(false); setShowH3(false);
      setShowTitle(false); setShowSub(false); setShowBtns(false);
      setShowLogo(false); setStatusText(''); setSkipped(false); typingRef.current = false;
    }, 2200);
  }, []);

  const isPreMain = uiPhase === 'recap' || uiPhase === 'idle' || uiPhase === 'logo';

  return (
    <div id="future" ref={containerRef} className="cinematic-ending-root">
      <div className="ending-viewport-stage">
        <div className="ending-vignette-overlay" />
        <canvas ref={netRef} className="ending-network-canvas" />
        <canvas ref={recapRef} className="ending-recap-canvas" />
        <canvas ref={logoRef} className="ending-particles-canvas" />

        {/* Skip */}
        {!skipped && isPreMain && uiPhase !== 'idle' && (
          <button className="ending-skip-btn" onClick={skipToEnd}>SKIP →</button>
        )}

        {/* Recap overlay */}
        {(uiPhase === 'recap' || uiPhase === 'idle') && (
          <div className="ending-recap-dom-layer">
            <p className="ending-recap-title">THE JOURNEY SO FAR</p>
            <div className="ending-recap-counter">{counter}</div>
          </div>
        )}

        {/* REAL LOGO EMBLEM at top — cross-fades in, stays forever */}
        <div className={`ending-emblem-top${showLogo ? ' visible' : ''}`}>
          <img src="/gwd-logo.png" alt="GWD Club" className="ending-emblem-img" />
        </div>

        {/* MAIN CONTENT */}
        <div className={`ending-main-content-flow${isPreMain ? ' ending-content-hidden' : ''}`}>
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

          <div className={`ending-status-line${showBtns ? ' revealed' : ''}`}>
            <span className="ending-status-dot" />
            <span className="ending-status-text">{statusText}</span>
          </div>
        </div>
      </div>

      {/* STAY CONNECTED */}
      <section className="ending-stay-connected-section">
        <span className="connected-kicker-label">STAY CONNECTED</span>
        <h2 className="connected-main-heading">THE JOURNEY CONTINUES<br />BEYOND THIS SCREEN.</h2>
        <div className="connected-columns-grid">
          <a href="https://www.instagram.com/gwdclub.vjit" target="_blank" rel="noopener noreferrer" className="connected-card-column">
            <div className="connected-icon-wrap"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div>
            <span className="connected-label-tag">INSTAGRAM</span><span className="connected-value-tag">GWD CLUB VJIT</span><span className="connected-card-underline" />
          </a>
          <a href="https://www.linkedin.com/showcase/gwd-club-vjit/" target="_blank" rel="noopener noreferrer" className="connected-card-column">
            <div className="connected-icon-wrap"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></div>
            <span className="connected-label-tag">LINKEDIN</span><span className="connected-value-tag">GWD CLUB VJIT</span><span className="connected-card-underline" />
          </a>
          <a href="mailto:gwdclubvjit@gmail.com" className="connected-card-column">
            <div className="connected-icon-wrap"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
            <span className="connected-label-tag">EMAIL</span><span className="connected-value-tag">gwdclubvjit@gmail.com</span><span className="connected-card-underline" />
          </a>
        </div>
        <div className="connected-footer-brand">GWD CLUB — GET WORK DONE</div>
      </section>
    </div>
  );
}
