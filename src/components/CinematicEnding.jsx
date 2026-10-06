/**
 * GWD CLUB — CINEMATIC ENDING (RELIABLE REWRITE)
 * No ScrollTrigger pin. Uses IntersectionObserver to trigger.
 * Recap draws on canvas. Main content always visible (no hidden opacity trap).
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/ending.css';

// ─── CHAPTERS for recap scene ────────────────────────────────────────────────
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

// ─── RECAP CANVAS RENDERER ───────────────────────────────────────────────────
function drawRecap(canvas, elapsed, w, h) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);

  const s = Math.min(w / 1280, h / 720);
  const scale = Math.max(0.45, Math.min(1.6, s));
  const isMobile = w <= 600;

  const marginX = isMobile ? 24 : 0;
  const refL = 150, refR = 1130;
  const screenL = marginX + (w - 1280 * scale) / 2 + refL * scale;
  const screenR = (w - 1280 * scale) / 2 + refR * scale - marginX;
  const centerY = h * 0.48;

  // Collapse progress (3.0 → 3.5s)
  let collapseP = 0;
  let overallAlpha = 1;
  if (elapsed >= 3.0) {
    const ct = Math.min(1, (elapsed - 3.0) / 0.5);
    collapseP = ct < 0.5 ? 4 * ct * ct * ct : 1 - Math.pow(-2 * ct + 2, 3) / 2;
    overallAlpha = Math.max(0, 1 - ct * 1.2);
  }
  ctx.globalAlpha = overallAlpha;

  const cx = w / 2, cy = h / 2;

  // Build node positions
  const nodes = CHAPTERS.map((ch, i) => {
    const t = i / (CHAPTERS.length - 1);
    const bx = screenL + t * (screenR - screenL);
    const by = centerY + (55 * Math.sin(i + 0.3)) * scale;
    return {
      ...ch,
      index: i,
      x: bx + (cx - bx) * collapseP,
      y: by + (cy - by) * collapseP,
      bx, by,
    };
  });

  // PATH + WHITE HEAD DOT
  const PATH_START = 0.6;
  const SEG_DUR = 0.36;
  let headX = null, headY = null;

  if (elapsed >= PATH_START) {
    const pathEl = elapsed - PATH_START;
    const segF = pathEl / SEG_DUR;
    const segIdx = Math.min(CHAPTERS.length - 2, Math.floor(segF));
    const frac = Math.min(1, segF - segIdx);

    ctx.save();
    ctx.strokeStyle = '#ff2d46';
    ctx.lineWidth = 2 * scale;
    ctx.shadowColor = '#ff2d46';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 0; i <= segIdx; i++) {
      const from = nodes[i];
      const to = nodes[Math.min(i + 1, nodes.length - 1)];
      if (i < segIdx) {
        ctx.lineTo(to.x, to.y);
      } else {
        const hx = from.x + (to.x - from.x) * frac;
        const hy = from.y + (to.y - from.y) * frac;
        ctx.lineTo(hx, hy);
        headX = hx; headY = hy;
      }
    }
    // If all done, head at last node
    if (segF >= CHAPTERS.length - 1) {
      headX = nodes[nodes.length - 1].x;
      headY = nodes[nodes.length - 1].y;
    }
    ctx.stroke();
    ctx.restore();

    // White head dot
    if (headX !== null && collapseP < 0.85) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(headX, headY, 3.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // NODES + LABELS
  const nodePopDuration = SEG_DUR;
  const nRadius = 5 * scale;
  const fontSize = Math.max(10, Math.round(11 * scale));
  const titleSize = Math.max(11, Math.round(13 * scale));
  const labelGap = Math.max(12, 20 * scale);

  nodes.forEach((node, i) => {
    const popTime = Math.max(0, PATH_START + i * SEG_DUR - 0.1);
    if (elapsed < popTime) return;

    const since = elapsed - popTime;
    const bounce = since < 0.25 ? Math.sin((since / 0.25) * Math.PI) : 0;
    const r = nRadius + (3 * scale) * bounce;
    const labelAlpha = Math.min(1, since / 0.4);
    const labelSlide = 10 * scale * Math.max(0, 1 - since / 0.4);

    // Ring pulse
    if (since < 0.9) {
      const pulseR = nRadius + (38 * scale - nRadius) * (since / 0.9);
      const pa = (1 - since / 0.9) * overallAlpha;
      ctx.save();
      ctx.strokeStyle = '#ff2d46';
      ctx.globalAlpha = pa;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Node circle
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#ff2d46';
    ctx.lineWidth = 2 * scale;
    ctx.shadowColor = '#ff2d46';
    ctx.shadowBlur = 8;
    ctx.globalAlpha = overallAlpha;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Labels (alternate above/below)
    if (labelAlpha > 0 && collapseP < 0.5 && !isMobile) {
      const above = i % 2 === 0;
      const dir = above ? -1 : 1;
      const ly = above
        ? node.y - nRadius - labelGap + labelSlide * dir
        : node.y + nRadius + labelGap + labelSlide * dir;

      ctx.save();
      ctx.globalAlpha = labelAlpha * overallAlpha;
      ctx.textAlign = 'center';

      // Red number
      ctx.fillStyle = '#ff2d46';
      ctx.font = `600 ${fontSize}px 'Space Grotesk', monospace`;
      ctx.fillText(node.num, node.x, above ? ly - 1 : ly + fontSize + 1);

      // White chapter name
      ctx.fillStyle = '#f2f2f4';
      ctx.font = `700 ${titleSize}px 'Rajdhani', sans-serif`;
      ctx.fillText(node.title, node.x, above ? ly - fontSize - 3 : ly + fontSize * 2 + 4);

      ctx.restore();
    }
  });

  // BOTTOM RULER
  if (!isMobile && elapsed >= PATH_START && collapseP < 0.7 && nodes.length > 1) {
    const rulerY = h * 0.85;
    const rx1 = nodes[0].bx;
    const rx2 = nodes[nodes.length - 1].bx;

    ctx.save();
    ctx.globalAlpha = (1 - collapseP) * overallAlpha;
    ctx.strokeStyle = '#3c282e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx1, rulerY);
    ctx.lineTo(rx2, rulerY);
    ctx.stroke();
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.moveTo(n.bx, rulerY - 4);
      ctx.lineTo(n.bx, rulerY + 4);
      ctx.stroke();
    });
    if (headX !== null) {
      const progW = Math.max(0, Math.min(rx2 - rx1, headX - rx1));
      ctx.strokeStyle = '#ff2d46';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff2d46';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(rx1, rulerY);
      ctx.lineTo(rx1 + progW, rulerY);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

// ─── NETWORK BACKGROUND CANVAS ───────────────────────────────────────────────
function drawNetwork(canvas, w, h, time, nodes) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);

  const MAX_DIST = 190;

  // Update node positions
  for (const n of nodes) {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < -20) n.x = w + 20;
    if (n.x > w + 20) n.x = -20;
    if (n.y < -20) n.y = h + 20;
    if (n.y > h + 20) n.y = -20;
  }

  // Lines
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < MAX_DIST) {
        const alpha = 0.18 * (1 - d / MAX_DIST);
        ctx.strokeStyle = a.isGreen && b.isGreen
          ? `rgba(45,255,138,${alpha})`
          : `rgba(255,45,70,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // Nodes
  for (const n of nodes) {
    const pulse = 1 + Math.sin(time * 0.003 + n.phase) * 0.15;
    ctx.save();
    ctx.fillStyle = n.color;
    ctx.globalAlpha = n.isGreen ? 0.8 : 0.65;
    ctx.shadowColor = n.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function makeNetworkNodes(w, h, count) {
  return Array.from({ length: count }, () => {
    const isGreen = Math.random() < 0.3;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: 1.8 + Math.random() * 0.8,
      isGreen,
      color: isGreen ? '#2dff8a' : '#ff2d46',
      phase: Math.random() * Math.PI * 2,
    };
  });
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CinematicEnding({ onOpenJoinModal }) {
  const containerRef = useRef(null);
  const networkCanvasRef = useRef(null);
  const recapCanvasRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const networkNodesRef = useRef([]);
  const isActiveRef = useRef(false);

  const [phase, setPhase] = useState('idle'); // idle | recap | main | done
  const [recapCounter, setRecapCounter] = useState('CHAPTER 00 / 07');
  const [skipped, setSkipped] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  // GSAP-style class reveals
  const [showH1, setShowH1] = useState(false);
  const [showH2, setShowH2] = useState(false);
  const [showH3, setShowH3] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showBtns, setShowBtns] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusTyping, setStatusTyping] = useState(false);

  const STATUS_FULL = 'END OF CURRENT ARCHIVE // HORIZON ACTIVE';

  const typeStatus = useCallback((text, onDone) => {
    let i = 0;
    setStatusText('');
    const iv = setInterval(() => {
      i++;
      setStatusText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(iv);
        onDone?.();
      }
    }, 38);
    return iv;
  }, []);

  const revealAll = useCallback(() => {
    setShowH1(true);
    setTimeout(() => setShowH2(true), 400);
    setTimeout(() => setShowH3(true), 800);
    setTimeout(() => setShowTitle(true), 1400);
    setTimeout(() => setShowSub(true), 2200);
    setTimeout(() => setShowBtns(true), 2800);
    setTimeout(() => {
      setStatusTyping(true);
      typeStatus(STATUS_FULL, () => setStatusTyping(false));
    }, 3400);
  }, [typeStatus]);

  const skipToEnd = useCallback(() => {
    if (skipped) return;
    setSkipped(true);
    setPhase('main');
    isActiveRef.current = false;
    // Clear recap canvas
    const rc = recapCanvasRef.current;
    if (rc) rc.getContext('2d')?.clearRect(0, 0, rc.width, rc.height);
    revealAll();
  }, [skipped, revealAll]);

  const startTimeline = useCallback(() => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    setPhase('recap');
    setShowH1(false); setShowH2(false); setShowH3(false);
    setShowTitle(false); setShowSub(false); setShowBtns(false);
    setStatusText(''); setSkipped(false);

    startTimeRef.current = performance.now();
    const lastChapterRef = { v: -1 };

    const loop = (now) => {
      if (!isActiveRef.current) return;

      const elapsed = (now - startTimeRef.current) / 1000;
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const h = window.innerHeight;

      // Network background
      const nc = networkCanvasRef.current;
      if (nc) drawNetwork(nc, w, h, now, networkNodesRef.current);

      // Recap canvas (0 → 3.5s)
      const rc = recapCanvasRef.current;
      if (rc && elapsed < 3.7) {
        drawRecap(rc, elapsed, w, h);

        // Update counter text
        const SEG_DUR = 0.36;
        const PATH_START = 0.6;
        const segF = (elapsed - PATH_START) / SEG_DUR;
        const reached = Math.min(7, Math.max(0, Math.floor(segF)));
        if (reached > lastChapterRef.v) {
          lastChapterRef.v = reached;
          setRecapCounter(`CHAPTER 0${reached} / 07`);
        }
      } else if (rc && elapsed >= 3.7) {
        rc.getContext('2d')?.clearRect(0, 0, rc.width, rc.height);
      }

      // Transition to main at 3.5s
      if (elapsed >= 3.5 && phase !== 'main') {
        setPhase('main');
      }

      // Reveal content at scheduled times (relative to start)
      if (elapsed >= 5.4 && !showH1) setShowH1(true);
      if (elapsed >= 5.8 && !showH2) setShowH2(true);
      if (elapsed >= 6.2 && !showH3) setShowH3(true);
      if (elapsed >= 7.0 && !showTitle) setShowTitle(true);
      if (elapsed >= 7.8 && !showSub) setShowSub(true);
      if (elapsed >= 8.4 && !showBtns) setShowBtns(true);
      if (elapsed >= 9.0 && !statusTyping && statusText === '') {
        setStatusTyping(true);
        typeStatus(STATUS_FULL, () => setStatusTyping(false));
      }

      if (elapsed < 14) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        isActiveRef.current = false;
        setPhase('done');
      }
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [phase, showH1, showH2, showH3, showTitle, showSub, showBtns, statusTyping, statusText, typeStatus]);

  // Init network nodes & IntersectionObserver
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = w <= 600 ? 30 : 58;
    networkNodesRef.current = makeNetworkNodes(w, h, count);

    // Always run network canvas loop
    let netRaf;
    let lastT = performance.now();
    const netLoop = (now) => {
      const nc = networkCanvasRef.current;
      const cw = containerRef.current?.clientWidth || window.innerWidth;
      const ch = window.innerHeight;
      if (nc && !isActiveRef.current) {
        // When recap not running, just draw network
        drawNetwork(nc, cw, ch, now, networkNodesRef.current);
      }
      netRaf = requestAnimationFrame(netLoop);
    };
    netRaf = requestAnimationFrame(netLoop);

    // IntersectionObserver triggers the timeline
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isActiveRef.current) {
        startTimeline();
      }
    }, { threshold: 0.15 });

    if (containerRef.current) obs.observe(containerRef.current);

    // Keyboard skip
    const onKey = (e) => {
      if (e.key === 'Escape' && isActiveRef.current) skipToEnd();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      obs.disconnect();
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(netRaf);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      isActiveRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoinClick = useCallback(() => {
    onOpenJoinModal?.();
  }, [onOpenJoinModal]);

  const handleReplayClick = useCallback(() => {
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(0, { duration: 2.0 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      isActiveRef.current = false;
      setPhase('idle');
      setShowH1(false); setShowH2(false); setShowH3(false);
      setShowTitle(false); setShowSub(false); setShowBtns(false);
      setStatusText(''); setSkipped(false);
    }, 2200);
  }, []);

  return (
    <div id="future" ref={containerRef} className="cinematic-ending-root">
      {/* Viewport-height stage with all canvases */}
      <div className="ending-viewport-stage">
        <div className="ending-vignette-overlay" />
        <canvas ref={networkCanvasRef} className="ending-network-canvas" />
        <canvas ref={recapCanvasRef} className="ending-recap-canvas" />

        {/* HUD */}
        <div className="ending-hud-layer">
          <span className="ending-hud-telemetry">GWD // ARCHIVE</span>
          <span className="ending-hud-chapter">
            {phase === 'recap' || phase === 'idle' ? 'RECAP' : '11 — THE FUTURE'}
          </span>
        </div>

        {/* Sound toggle */}
        <button
          className={`ending-sound-toggle${soundOn ? ' active' : ''}`}
          onClick={() => setSoundOn(v => !v)}
          aria-label={soundOn ? 'Disable sound' : 'Enable sound'}
          aria-pressed={soundOn}
        >
          <span className="sound-indicator-dot" />
          SOUND: {soundOn ? 'ON' : 'OFF'}
        </button>

        {/* Skip button */}
        {(phase === 'recap' || (phase === 'main' && !showBtns)) && (
          <button className="ending-skip-btn" onClick={skipToEnd}>
            SKIP →
          </button>
        )}

        {/* Recap title + counter (shown during recap) */}
        {(phase === 'recap' || phase === 'idle') && (
          <div className="ending-recap-dom-layer">
            <p className="ending-recap-title">THE JOURNEY SO FAR</p>
            <div className="ending-recap-counter">{recapCounter}</div>
          </div>
        )}

        {/* ── MAIN CONTENT (always rendered, revealed via classes) ── */}
        <div className={`ending-main-content-flow${phase === 'recap' || phase === 'idle' ? ' ending-content-hidden' : ''}`}>
          <div className="ending-masked-headline">
            <p className={`headline-text-line${showH1 ? ' revealed' : ''}`}>THE FUTURE.</p>
          </div>
          <div className="ending-masked-headline">
            <p className={`headline-text-line${showH2 ? ' revealed' : ''}`}>THE UNKNOWN AWAITS.</p>
          </div>
          <div className="ending-masked-headline">
            <p className={`headline-text-line accent-red${showH3 ? ' revealed' : ''}`}>
              THE STORY IS STILL BEING WRITTEN.
            </p>
          </div>

          <div className={`ending-big-title-container${showTitle ? ' revealed' : ''}`}>
            <h1 className="ending-big-title">
              <span className="title-word-gwd">GWD</span>
              <span className="title-word-club">CLUB</span>
            </h1>
          </div>

          <p className={`ending-sub-manifesto${showSub ? ' revealed' : ''}`}>GET WORK DONE</p>

          <div className={`ending-buttons-group${showBtns ? ' revealed' : ''}`}>
            <button
              className="ending-primary-btn"
              onClick={handleJoinClick}
              aria-label="Join GWD Club"
            >
              <span className="btn-diagonal-shine" />
              JOIN THE CLUB →
            </button>
            <button
              className="ending-secondary-btn"
              onClick={handleReplayClick}
              aria-label="Replay the journey"
            >
              REPLAY THE JOURNEY
            </button>
          </div>

          <div className="ending-status-line">
            <span className="ending-status-dot" />
            <span className="ending-status-text">{statusText}</span>
          </div>
        </div>
      </div>

      {/* ── STAY CONNECTED ── */}
      <section className="ending-stay-connected-section">
        <span className="connected-kicker-label">STAY CONNECTED</span>
        <h2 className="connected-main-heading">
          THE JOURNEY CONTINUES<br />BEYOND THIS SCREEN.
        </h2>
        <div className="connected-columns-grid">
          <a href="https://www.instagram.com/gwdclub.vjit" target="_blank" rel="noopener noreferrer"
            className="connected-card-column" aria-label="Instagram GWD CLUB VJIT">
            <div className="connected-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </div>
            <span className="connected-label-tag">INSTAGRAM</span>
            <span className="connected-value-tag">GWD CLUB VJIT</span>
            <span className="connected-card-underline" />
          </a>
          <a href="https://www.linkedin.com/showcase/gwd-club-vjit/" target="_blank" rel="noopener noreferrer"
            className="connected-card-column" aria-label="LinkedIn GWD CLUB VJIT">
            <div className="connected-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
              </svg>
            </div>
            <span className="connected-label-tag">LINKEDIN</span>
            <span className="connected-value-tag">GWD CLUB VJIT</span>
            <span className="connected-card-underline" />
          </a>
          <a href="mailto:gwdclubvjit@gmail.com"
            className="connected-card-column" aria-label="Email gwdclubvjit@gmail.com">
            <div className="connected-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
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
