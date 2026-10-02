import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/livingSystem.css';

/**
 * LivingSystemSection — Chapter 07: The Living System
 *
 * Three-phase cinematic sequence:
 * PHASE 01 / ONE POINT — Aldrin Paul (requires activation)
 * PHASE 02 / ONE LINE  — Line travels to Mohd Ismail  
 * PHASE 03 / A NETWORK — G. Sravya + all connections animate
 *
 * Rules:
 * - Photo NEVER shows before activation
 * - Line physically TRAVELS (not instant)
 * - G. Sravya appears first, THEN connections draw
 * - Network connections animate (not instant)
 */

const PHASE_DATA = [
  {
    phase: 'PHASE 01',
    label: 'ONE POINT',
    personId: 'aldrin-paul',
    name: 'ALDRIN PAUL',
    role: 'PRESIDENT',
    photoUrl: '/photos/aldrin-paul.webp',
    narrative: 'Every journey begins with a single point — the first presence that marks where the story starts. From that first point, an idea begins to take shape, creating the foundation from which every future connection can grow.',
  },
  {
    phase: 'PHASE 02',
    label: 'ONE LINE',
    personId: 'mohd-ismail',
    name: 'MOHD ISMAIL',
    role: 'VICE PRESIDENT',
    photoUrl: '/photos/mohd-ismail.webp',
    narrative: 'A single point becomes a connection — one line linking two people and creating the first visible path through the growing story of GWD. What began as a beginning now starts moving forward, turning an individual point into something shared.',
  },
  {
    phase: 'PHASE 03',
    label: 'A NETWORK',
    personId: 'g-sravya',
    name: 'G. SRAVYA',
    role: 'GENERAL SECRETARY',
    photoUrl: '/photos/g-sravya.webp',
    narrative: 'The story expands beyond a single connection — a third point emerges, and what began as one point becomes a network. Different people, different roles, and different connections begin coming together, creating the foundation of a growing community.',
  },
];

export default function LivingSystemSection() {
  const canvasRef = useRef(null);
  const [activePhase, setActivePhase] = useState(0);
  const [aldrinRevealed, setAldrinRevealed] = useState(false);
  const [ismailRevealed, setIsmailRevealed] = useState(false);
  const [sravyaRevealed, setSravyaRevealed] = useState(false);
  const [networkComplete, setNetworkComplete] = useState(false);
  const [lineProgress, setLineProgress] = useState(0);
  const [networkProgress, setNetworkProgress] = useState(0);
  const [showNarrative, setShowNarrative] = useState(true);

  // Canvas refs
  const lineAnimRef = useRef(null);
  const networkAnimRef = useRef(null);
  const phaseRef = useRef(activePhase);
  phaseRef.current = activePhase;

  // Node positions (relative, computed from canvas size)
  const nodesRef = useRef({
    aldrin: { x: 0.5, y: 0.38 },
    ismail: { x: 0.5, y: 0.62 },
    sravya: { x: 0.3, y: 0.5 },
  });

  const lineProgressRef    = useRef(0);
  const networkProgressRef = useRef(0);

  // PERF FIX: Mirror boolean states into refs so drawCanvas never needs
  // them in its dependency array (preventing loop restarts on every reveal).
  const aldrinRevealedRef  = useRef(false);
  const ismailRevealedRef  = useRef(false);
  const sravyaRevealedRef  = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { aldrinRevealedRef.current  = aldrinRevealed;  }, [aldrinRevealed]);
  useEffect(() => { ismailRevealedRef.current  = ismailRevealed;  }, [ismailRevealed]);
  useEffect(() => { sravyaRevealedRef.current  = sravyaRevealed;  }, [sravyaRevealed]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const N = nodesRef.current;
    const aldrinPx = { x: N.aldrin.x * W, y: N.aldrin.y * H };
    const ismailPx = { x: N.ismail.x * W, y: N.ismail.y * H };
    const sravyaPx = { x: N.sravya.x * W, y: N.sravya.y * H };

    const phase = phaseRef.current;
    const lp    = lineProgressRef.current;
    const np    = networkProgressRef.current;
    // PERF FIX: Read refs, not state — no dep array changes
    const aR    = aldrinRevealedRef.current;
    const iR    = ismailRevealedRef.current;
    const sR    = sravyaRevealedRef.current;
    // Single Date.now() call per frame (not per node)
    const now   = Date.now();

    if (phase >= 0 && aR) {
      const pulse = Math.sin(now * 0.003) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(aldrinPx.x, aldrinPx.y, 18 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,27,60,${(0.15 * pulse).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(aldrinPx.x, aldrinPx.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ff1b3c';
      ctx.shadowColor = '#ff1b3c';
      ctx.shadowBlur  = 14;
      ctx.fill();
      ctx.shadowBlur  = 0;
    }

    if (phase >= 1 && aR && lp > 0) {
      const ex = aldrinPx.x + (ismailPx.x - aldrinPx.x) * lp;
      const ey = aldrinPx.y + (ismailPx.y - aldrinPx.y) * lp;
      ctx.beginPath();
      ctx.moveTo(aldrinPx.x, aldrinPx.y);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = 'rgba(255,27,60,0.7)';
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = '#ff1b3c';
      ctx.shadowBlur  = 8;
      ctx.stroke();
      ctx.shadowBlur  = 0;
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fillStyle   = 'rgba(255,27,60,0.9)';
      ctx.shadowColor = '#ff1b3c';
      ctx.shadowBlur  = 12;
      ctx.fill();
      ctx.shadowBlur  = 0;
    }

    if (phase >= 1 && iR) {
      const pulse2 = Math.sin(now * 0.0025 + 1) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(ismailPx.x, ismailPx.y, 18 + pulse2 * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,27,60,${(0.12 * pulse2).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ismailPx.x, ismailPx.y, 8, 0, Math.PI * 2);
      ctx.fillStyle   = '#ff1b3c';
      ctx.shadowColor = '#ff1b3c';
      ctx.shadowBlur  = 14;
      ctx.fill();
      ctx.shadowBlur  = 0;
    }

    if (phase >= 2 && sR) {
      const pulse3 = Math.sin(now * 0.002 + 2) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(sravyaPx.x, sravyaPx.y, 18 + pulse3 * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,81,46,${(0.2 * pulse3).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sravyaPx.x, sravyaPx.y, 7, 0, Math.PI * 2);
      ctx.fillStyle   = '#00512e';
      ctx.shadowColor = '#00512e';
      ctx.shadowBlur  = 12;
      ctx.fill();
      ctx.shadowBlur  = 0;
    }

    if (phase >= 2 && np > 0) {
      if (np > 0) {
        const fp = Math.min(1, np * 2);
        const ex = aldrinPx.x + (sravyaPx.x - aldrinPx.x) * fp;
        const ey = aldrinPx.y + (sravyaPx.y - aldrinPx.y) * fp;
        ctx.beginPath(); ctx.moveTo(aldrinPx.x, aldrinPx.y); ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(255,27,60,${Math.min(0.6, fp * 0.6).toFixed(3)})`;
        ctx.lineWidth = 1.2; ctx.stroke();
      }
      if (np > 0.5) {
        const fp2 = Math.min(1, (np - 0.5) * 2);
        const ex2 = ismailPx.x + (sravyaPx.x - ismailPx.x) * fp2;
        const ey2 = ismailPx.y + (sravyaPx.y - ismailPx.y) * fp2;
        ctx.beginPath(); ctx.moveTo(ismailPx.x, ismailPx.y); ctx.lineTo(ex2, ey2);
        ctx.strokeStyle = `rgba(255,27,60,${Math.min(0.5, fp2 * 0.5).toFixed(3)})`;
        ctx.lineWidth = 1.2; ctx.stroke();
      }
      if (np > 0.7) {
        const alpha = Math.min(0.6, (np - 0.7) * 2);
        ctx.beginPath(); ctx.moveTo(aldrinPx.x, aldrinPx.y); ctx.lineTo(ismailPx.x, ismailPx.y);
        ctx.strokeStyle = `rgba(255,27,60,${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }
    }
  // PERF FIX: Empty dep array — drawCanvas reads only refs, never causes loop restarts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  // Continuous canvas render loop
  useEffect(() => {
    let rafId;
    const loop = () => {
      drawCanvas();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [drawCanvas]);

  // Phase 02 — Line animation when phase changes to 1
  useEffect(() => {
    if (activePhase !== 1 || lineProgress >= 1) return;

    let startTime = null;
    const DURATION = 1800; // 1.8s for the line to travel

    const animateLine = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(1, elapsed / DURATION);
      // Ease in-out cubic
      const eased = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      lineProgressRef.current = eased;
      setLineProgress(eased);

      if (eased >= 1) {
        // Line reached Ismail — reveal him
        setTimeout(() => {
          setIsmailRevealed(true);
          setShowNarrative(true);
        }, 200);
        return;
      }
      lineAnimRef.current = requestAnimationFrame(animateLine);
    };

    lineAnimRef.current = requestAnimationFrame(animateLine);
    return () => {
      if (lineAnimRef.current) cancelAnimationFrame(lineAnimRef.current);
    };
  }, [activePhase]);

  // Phase 03 — Network animation
  useEffect(() => {
    if (activePhase !== 2) return;

    // First: Sravya node appears
    const t1 = setTimeout(() => {
      setSravyaRevealed(true);
      setShowNarrative(false);
      // Then after ~2.5s, animate connections
      const t2 = setTimeout(() => {
        setShowNarrative(true);
        let startTime = null;
        const DURATION = 2200;
        const animNet = (ts) => {
          if (!startTime) startTime = ts;
          const progress = Math.min(1, (ts - startTime) / DURATION);
          const eased = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          networkProgressRef.current = eased;
          setNetworkProgress(eased);
          if (eased < 1) {
            networkAnimRef.current = requestAnimationFrame(animNet);
          } else {
            setNetworkComplete(true);
          }
        };
        networkAnimRef.current = requestAnimationFrame(animNet);
      }, 2500);
      return () => clearTimeout(t2);
    }, 400);

    return () => {
      clearTimeout(t1);
      if (networkAnimRef.current) cancelAnimationFrame(networkAnimRef.current);
    };
  }, [activePhase]);

  const handlePhaseClick = (idx) => {
    if (idx === activePhase) return;
    
    // Reset downstream states when going back
    if (idx < activePhase) {
      if (idx < 1) {
        setIsmailRevealed(false);
        lineProgressRef.current = 0;
        setLineProgress(0);
      }
      if (idx < 2) {
        setSravyaRevealed(false);
        networkProgressRef.current = 0;
        setNetworkProgress(0);
        setNetworkComplete(false);
      }
    }
    
    setShowNarrative(false);
    setTimeout(() => {
      setActivePhase(idx);
      setShowNarrative(true);

      // Phase 01 — Aldrin reveal
      if (idx === 0 && !aldrinRevealed) {
        setAldrinRevealed(true);
      }
    }, 150);
  };

  // Auto-activate Aldrin on mount (first encounter)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAldrinRevealed(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const currentPhaseData = PHASE_DATA[activePhase];

  // Determine which person is "active" for the photo
  const getPhotoForPhase = () => {
    if (activePhase === 0) return PHASE_DATA[0];
    if (activePhase === 1) return PHASE_DATA[1];
    if (activePhase === 2) return PHASE_DATA[2];
    return PHASE_DATA[0];
  };

  const activePhoto = getPhotoForPhase();

  return (
    <section id="structure" className="living-system-section" aria-label="Chapter 07: The Living System — One Point, One Line, A Network">
      {/* Chapter Eyebrow */}
      <div className="section-container">
        <header className="ls-header">
          <div className="chapter-eyebrow">
            <span className="eyebrow-idx">CHAPTER 07</span>
            <span className="eyebrow-divider">—</span>
            <span className="eyebrow-theme">THE LIVING SYSTEM</span>
          </div>
          <h2 className="ls-main-title reveal-title">
            ONE POINT<span className="title-accent-dot">.</span>
            <br />
            <span className="ls-title-dim">ONE LINE.</span>
            <br />
            <span className="ls-title-dimmer">A NETWORK.</span>
          </h2>
        </header>

        {/* Main composition */}
        <div className="ls-composition">
          {/* Left: Canvas visualization */}
          <div className="ls-canvas-region">
            <canvas ref={canvasRef} className="ls-network-canvas" />

            {/* Aldrin node label */}
            {aldrinRevealed && (
              <div className="ls-node-label ls-node-aldrin" aria-label="Node: Aldrin Paul">
                <span className="nk-name">ALDRIN PAUL</span>
                <span className="nk-role">PRESIDENT</span>
              </div>
            )}

            {/* Ismail node label — only after line arrives */}
            {ismailRevealed && (
              <div className="ls-node-label ls-node-ismail" aria-label="Node: Mohd Ismail">
                <span className="nk-name">MOHD ISMAIL</span>
                <span className="nk-role">VICE PRESIDENT</span>
              </div>
            )}

            {/* Sravya node label */}
            {sravyaRevealed && (
              <div className="ls-node-label ls-node-sravya" aria-label="Node: G. Sravya">
                <span className="nk-name">G. SRAVYA</span>
                <span className="nk-role">GENERAL SECRETARY</span>
              </div>
            )}
          </div>

          {/* Right: Photo + Narrative */}
          <div className="ls-info-region">
            {/* Person photo — only shows after activation */}
            <div className="ls-photo-frame" aria-label={`Portrait: ${activePhoto.name}`}>
              {activePhase === 0 && !aldrinRevealed && (
                <div className="ls-waiting-signal">
                  <div className="ls-signal-ring" />
                  <span className="ls-identifying">IDENTIFYING...</span>
                </div>
              )}
              {activePhase === 0 && aldrinRevealed && (
                <img 
                  src={PHASE_DATA[0].photoUrl} 
                  alt={PHASE_DATA[0].name}
                  className="ls-person-photo revealed"
                  loading="eager"
                />
              )}
              {activePhase === 1 && ismailRevealed && (
                <img 
                  src={PHASE_DATA[1].photoUrl} 
                  alt={PHASE_DATA[1].name}
                  className="ls-person-photo revealed"
                  loading="eager"
                />
              )}
              {activePhase === 1 && !ismailRevealed && (
                <div className="ls-waiting-signal">
                  <div className="ls-signal-ring transmitting" />
                  <span className="ls-identifying">SIGNAL TRANSMITTING...</span>
                </div>
              )}
              {activePhase === 2 && sravyaRevealed && (
                <img 
                  src={PHASE_DATA[2].photoUrl} 
                  alt={PHASE_DATA[2].name}
                  className="ls-person-photo revealed"
                  loading="eager"
                />
              )}
              {activePhase === 2 && !sravyaRevealed && (
                <div className="ls-waiting-signal">
                  <div className="ls-signal-ring" />
                  <span className="ls-identifying">IDENTIFYING...</span>
                </div>
              )}
            </div>

            {/* Narrative text */}
            <div className={`ls-narrative-block ${showNarrative ? 'visible' : ''}`}>
              <div className="ls-phase-tag">{currentPhaseData.phase} / {currentPhaseData.label}</div>
              <p className="ls-narrative-text">{currentPhaseData.narrative}</p>
            </div>
          </div>
        </div>

        {/* Phase navigation — bottom labels exactly as specified */}
        <nav className="ls-phase-nav" role="tablist" aria-label="Network evolution phases">
          {PHASE_DATA.map((pd, idx) => (
            <button
              key={pd.phase}
              className={`ls-phase-btn ${activePhase === idx ? 'active' : ''} ${idx < activePhase ? 'completed' : ''}`}
              onClick={() => handlePhaseClick(idx)}
              role="tab"
              aria-selected={activePhase === idx}
              aria-label={`${pd.phase}: ${pd.label}`}
            >
              <span className="ls-phase-label">{pd.phase}</span>
              <span className="ls-phase-name">{pd.label}</span>
              {activePhase === idx && <div className="ls-phase-active-bar" />}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
