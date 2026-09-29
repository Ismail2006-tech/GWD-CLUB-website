import React, { useEffect, useRef, useState, useCallback } from 'react';
import { STAGE_1_DATA } from '../data/gwdData';
import '../styles/beginning.css';

// ─────────────────────────────────────────────
//  Phase descriptive texts (exact user-provided copy)
// ─────────────────────────────────────────────
const PHASE_DESCRIPTIONS = [
  "Every journey begins with a single point — the first presence that marks where the story starts. From that first point, an idea begins to take shape, creating the foundation from which every future connection can grow.",
  "A single point becomes a connection — one line linking two people and creating the first visible path through the growing story of GWD. What began as a beginning now starts moving forward, turning an individual point into something shared.",
  "The story expands beyond a single connection — a third point emerges, and what began as one point becomes a network. Different people, different roles, and different connections begin coming together, creating the foundation of a growing community."
];

export default function BeginningSection() {
  const data = STAGE_1_DATA.beginning;
  const canvasRef = useRef(null);

  // Active phase tab
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  // Phase 02: Mohd appears after line travel completes (~1.8s)
  const [lineReachedMohd, setLineReachedMohd] = useState(false);
  const mohdTimerRef = useRef(null);

  // Phase 03: track animation sub-states
  //   p3State: 'sravya' | 'pause' | 'connecting' | 'connected'
  const [p3State, setP3State] = useState('sravya');

  // Whether the descriptive text should be visible
  const [showDesc, setShowDesc] = useState(false);

  // Tracks the actual line travel progress for phase 02 (0 → 1)
  const lineTravelRef = useRef(0);
  // Whether the one-time line-reach event has fired
  const lineReachedFiredRef = useRef(false);
  // P3 connection line progress refs
  const p3Line1Ref = useRef(0); // Sravya → Mohd
  const p3Line2Ref = useRef(0); // Sravya → Aldrin

  // People data
  const president         = { name: "Aldrin Paul",  role: "PRESIDENT",         photoUrl: "/photos/aldrin-paul.jpg?v=2",    emerald: false };
  const vicePresident     = { name: "Mohd Ismail",  role: "VICE PRESIDENT",    photoUrl: "/photos/mohd-ismail.png",   emerald: false };
  const generalSecretary  = { name: "G. Sravya",    role: "GENERAL SECRETARY", photoUrl: "/photos/g-sravya.jpg",      emerald: true  };

  // ─────────────────────────────────────────────
  //  Handle phase switch — reset all sub-states
  // ─────────────────────────────────────────────
  const handlePhaseChange = useCallback((idx) => {
    // Clear any pending Mohd timer
    if (mohdTimerRef.current) clearTimeout(mohdTimerRef.current);

    setActiveStageIndex(idx);
    setShowDesc(false);
    setLineReachedMohd(false);
    setP3State('sravya');
    lineTravelRef.current = 0;
    lineReachedFiredRef.current = false;
    p3Line1Ref.current = 0;
    p3Line2Ref.current = 0;

    if (idx === 0) {
      // Phase 01: show desc after short pause
      setTimeout(() => setShowDesc(true), 700);
    } else if (idx === 1) {
      // Phase 02: faster line travel ~0.8s
      mohdTimerRef.current = setTimeout(() => {
        setLineReachedMohd(true);
        setTimeout(() => setShowDesc(true), 400);
      }, 800);
    } else if (idx === 2) {
      // Phase 03: Mohd is already part of the network — show him immediately
      setLineReachedMohd(true);
    }
    // Phase 03 desc/network: handled by p3State machine
  }, []);

  // Initial phase 01 auto-reveal on mount
  useEffect(() => {
    const t = setTimeout(() => setShowDesc(true), 700);
    return () => clearTimeout(t);
  }, []);

  // ─────────────────────────────────────────────
  //  Phase 03 state machine: after Sravya reveals,
  //  wait 2.5s, then start network connection animation
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (activeStageIndex !== 2) return;

    if (p3State === 'sravya') {
      // Show desc after Sravya node pops in (~800ms)
      const t1 = setTimeout(() => setShowDesc(true), 800);
      // Start pause phase
      const t2 = setTimeout(() => setP3State('pause'), 900);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }

    if (p3State === 'pause') {
      // 1.2 second pause before network connects
      const t = setTimeout(() => setP3State('connecting'), 1200);
      return () => clearTimeout(t);
    }

    if (p3State === 'connecting') {
      // connection lines animate via canvas; when both reach 1, mark connected
      const interval = setInterval(() => {
        if (p3Line1Ref.current >= 1 && p3Line2Ref.current >= 1) {
          setP3State('connected');
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeStageIndex, p3State]);

  // ─────────────────────────────────────────────
  //  Canvas animation loop
  // ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width  = (canvas.width  = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width  = canvas.width  = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    let bgProgress = 0; // general ambient progress

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      bgProgress += 0.018;

      // Node positions (must match CSS placement)
      const nodes = {
        // Phase 01
        aldrinCenter: { x: width * 0.5,  y: height * 0.42 },
        // Phase 02
        aldrinLeft:   { x: width * 0.24, y: height * 0.44 },
        mohdRight:    { x: width * 0.76, y: height * 0.44 },
        // Phase 03
        aldrinTop:    { x: width * 0.5,  y: height * 0.22 },
        mohdBottomL:  { x: width * 0.20, y: height * 0.65 },
        sravyaBottomR:{ x: width * 0.80, y: height * 0.65 },
      };

      // ── PHASE 01 ─────────────────────────────
      if (activeStageIndex === 0) {
        const ring1 = (bgProgress * 22) % 120;
        const ring2 = ((bgProgress * 22) + 60) % 120;
        const pC = nodes.aldrinCenter;

        ctx.save();
        ctx.beginPath();
        ctx.arc(pC.x, pC.y, 45 + ring1, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 27, 60, ${Math.max(0, 0.42 - ring1 / 120)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pC.x, pC.y, 45 + ring2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 81, 46, ${Math.max(0, 0.32 - ring2 / 120)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

      // ── PHASE 02 ─────────────────────────────
      } else if (activeStageIndex === 1) {
        const pL = nodes.aldrinLeft;
        const pR = nodes.mohdRight;

        // Advance line travel faster (0 → 1 in ~0.8s at 60fps ≈ 0.021/frame)
        if (lineTravelRef.current < 1) {
          lineTravelRef.current = Math.min(1, lineTravelRef.current + 0.021);
        }

        const progress = lineTravelRef.current;

        // Faint horizon guide
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(width * 0.05, pL.y);
        ctx.lineTo(width * 0.95, pR.y);
        ctx.strokeStyle = 'rgba(242, 242, 242, 0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Main travelling line (drawn only to current progress point)
        const currentX = pL.x + (pR.x - pL.x) * progress;
        const currentY = pL.y + (pR.y - pL.y) * progress;

        ctx.beginPath();
        ctx.moveTo(pL.x, pL.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = 'rgba(255, 27, 60, 0.80)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff1b3c';
        ctx.shadowBlur = 16;
        ctx.stroke();

        // Leading photon at the front of the line
        if (progress < 1) {
          ctx.beginPath();
          ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ff1b3c';
          ctx.shadowBlur = 22;
          ctx.fill();
        }

        // After line is complete: add ambient energy photon back-and-forth
        if (progress >= 1) {
          // Secondary subtle emerald parallel
          ctx.beginPath();
          ctx.moveTo(pL.x, pL.y + 12);
          ctx.lineTo(pR.x, pR.y + 12);
          ctx.strokeStyle = 'rgba(0, 81, 46, 0.45)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
          ctx.stroke();

          const travelT = (Math.sin(bgProgress * 1.6) + 1) / 2;
          const photonX = pL.x + (pR.x - pL.x) * travelT;
          const photonY = pL.y + (pR.y - pL.y) * travelT;

          ctx.beginPath();
          ctx.arc(photonX, photonY, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ff1b3c';
          ctx.shadowBlur = 18;
          ctx.fill();
        }
        ctx.restore();

      // ── PHASE 03 ─────────────────────────────
      } else {
        const pTop   = nodes.aldrinTop;
        const pBL    = nodes.mohdBottomL;
        const pBR    = nodes.sravyaBottomR;

        ctx.save();

        // Outer faint web satellites
        const satellites = [
          { x: width * 0.08, y: height * 0.3 },
          { x: width * 0.92, y: height * 0.3 },
          { x: width * 0.12, y: height * 0.82 },
          { x: width * 0.88, y: height * 0.82 },
          { x: width * 0.5,  y: height * 0.88 },
        ];
        satellites.forEach((sat) => {
          ctx.beginPath();
          ctx.moveTo(pTop.x, pTop.y);
          ctx.lineTo(sat.x, sat.y);
          ctx.strokeStyle = 'rgba(0, 81, 46, 0.14)';
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(sat.x, sat.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 81, 46, 0.5)';
          ctx.fill();
        });

        // Only draw connection lines after the pause
        if (p3State === 'connecting' || p3State === 'connected') {
          // Advance line 1: Sravya → Mohd (fast)
          if (p3Line1Ref.current < 1) {
            p3Line1Ref.current = Math.min(1, p3Line1Ref.current + 0.028);
          }
          // Advance line 2: Sravya → Aldrin (slightly staggered)
          if (p3Line1Ref.current > 0.3 && p3Line2Ref.current < 1) {
            p3Line2Ref.current = Math.min(1, p3Line2Ref.current + 0.025);
          }

          // ─ Sravya → Mohd
          const l1end = {
            x: pBR.x + (pBL.x - pBR.x) * p3Line1Ref.current,
            y: pBR.y + (pBL.y - pBR.y) * p3Line1Ref.current,
          };
          ctx.beginPath();
          ctx.moveTo(pBR.x, pBR.y);
          ctx.lineTo(l1end.x, l1end.y);
          ctx.strokeStyle = 'rgba(0, 81, 46, 0.85)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#00512e';
          ctx.shadowBlur = 12;
          ctx.stroke();

          if (p3Line1Ref.current < 1) {
            ctx.beginPath();
            ctx.arc(l1end.x, l1end.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00a859';
            ctx.shadowBlur = 18;
            ctx.fill();
          }

          // ─ Sravya → Aldrin
          const l2end = {
            x: pBR.x + (pTop.x - pBR.x) * p3Line2Ref.current,
            y: pBR.y + (pTop.y - pBR.y) * p3Line2Ref.current,
          };
          ctx.beginPath();
          ctx.moveTo(pBR.x, pBR.y);
          ctx.lineTo(l2end.x, l2end.y);
          ctx.strokeStyle = 'rgba(255, 27, 60, 0.75)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ff1b3c';
          ctx.shadowBlur = 12;
          ctx.stroke();

          if (p3Line2Ref.current < 1) {
            ctx.beginPath();
            ctx.arc(l2end.x, l2end.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ff1b3c';
            ctx.shadowBlur = 18;
            ctx.fill();
          }

          // ─ Mohd → Aldrin (appears only when both lines land)
          if (p3State === 'connected') {
            ctx.beginPath();
            ctx.moveTo(pBL.x, pBL.y);
            ctx.lineTo(pTop.x, pTop.y);
            ctx.strokeStyle = 'rgba(255, 27, 60, 0.75)';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ff1b3c';
            ctx.shadowBlur = 12;
            ctx.stroke();

            // Ambient energy photons on each leg
            const legs = [
              [pTop, pBL], [pBL, pBR], [pBR, pTop]
            ];
            legs.forEach(([from, to], i) => {
              const t = ((bgProgress * 1.1) + i * 0.33) % 1;
              const px = from.x + (to.x - from.x) * t;
              const py = from.y + (to.y - from.y) * t;
              ctx.beginPath();
              ctx.arc(px, py, 3.5, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowColor = i === 1 ? '#00a859' : '#ff1b3c';
              ctx.shadowBlur = 14;
              ctx.fill();
            });

            // Dim-green atmospheric halo at network center
            const cx = (pTop.x + pBL.x + pBR.x) / 3;
            const cy = (pTop.y + pBL.y + pBR.y) / 3;
            const pulse = 0.06 + 0.04 * Math.sin(bgProgress * 2);
            ctx.beginPath();
            ctx.arc(cx, cy, 80, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 81, 46, ${pulse})`;
            ctx.fill();
          }
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStageIndex, p3State]);

  // ─────────────────────────────────────────────
  //  Derived visibility flags
  // ─────────────────────────────────────────────
  // Mohd visible: after line lands in Ph02, OR always in Ph03 (already in the network)
  const showMohd   = (activeStageIndex === 1 && lineReachedMohd) || activeStageIndex >= 2;
  const showSravya = activeStageIndex >= 2;

  return (
    <section id="beginning" className="beginning-section" aria-label="Chapter 01: The Beginning">
      <div className="section-container">
        {/* Section Header */}
        <header className="beginning-header">
          <div className="chapter-eyebrow">
            <span className="eyebrow-idx">CHAPTER 01</span>
            <span className="eyebrow-divider">—</span>
            <span className="eyebrow-theme">THE ORIGIN STORY</span>
          </div>

          <h2 className="beginning-huge-title">
            THE BEGINNING<span className="title-accent-dot">.</span>
          </h2>

          <div className="meaning-badge">
            <span className="badge-prefix">GWD STANDS FOR</span>
            <span className="badge-acronym">{data.whatItStandsFor}</span>
          </div>
        </header>

        {/* Visual Metaphor Interactive Centerpiece */}
        <div className="metaphor-wrapper">
          <div className="metaphor-canvas-container">
            <canvas ref={canvasRef} className="metaphor-canvas" />

            {/* OVERLAY PHOTO NODES */}
            <div className={`metaphor-photos-layer phase-view-${activeStageIndex}`}>

              {/* Node 1 — Aldrin Paul (all phases) */}
              <div
                className={`metaphor-person-node node-president phase-${activeStageIndex}`}
                data-cursor="image"
                tabIndex={0}
                aria-label={`Leader: ${president.name}, ${president.role}`}
              >
                <div className="node-photo-glow" />
                <div className="node-photo-disc">
                  <img src={president.photoUrl} alt={president.name} className="node-img" />
                  <div className="node-radar-sweep" />
                </div>
                <div className="node-info-tag">
                  <span className="tag-role">PRESIDENT</span>
                  <span className="tag-name">{president.name}</span>
                </div>
              </div>

              {/* Node 2 — Mohd Ismail: only after line reaches his node */}
              {showMohd && (
                <div
                  className={`metaphor-person-node node-vp phase-${activeStageIndex}`}
                  data-cursor="image"
                  tabIndex={0}
                  aria-label={`Leader: ${vicePresident.name}, ${vicePresident.role}`}
                >
                  <div className="node-photo-glow" />
                  <div className="node-photo-disc">
                    <img src={vicePresident.photoUrl} alt={vicePresident.name} className="node-img" />
                    <div className="node-radar-sweep" />
                  </div>
                  <div className="node-info-tag">
                    <span className="tag-role">VICE PRESIDENT</span>
                    <span className="tag-name">{vicePresident.name}</span>
                  </div>
                </div>
              )}

              {/* Node 3 — G. Sravya: Phase 03 only */}
              {showSravya && (
                <div
                  className={`metaphor-person-node node-gs phase-${activeStageIndex}`}
                  data-cursor="image"
                  tabIndex={0}
                  aria-label={`Leader: ${generalSecretary.name}, ${generalSecretary.role}`}
                >
                  <div className="node-photo-glow emerald" />
                  <div className="node-photo-disc emerald">
                    <img src={generalSecretary.photoUrl} alt={generalSecretary.name} className="node-img" />
                    <div className="node-radar-sweep" />
                  </div>
                  <div className="node-info-tag">
                    <span className="tag-role">GENERAL SECRETARY</span>
                    <span className="tag-name">{generalSecretary.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Phase Navigation Pills */}
            <div className="metaphor-stage-pills" role="tablist" aria-label="Evolution phases">
              {data.milestones.map((m, idx) => (
                <button
                  key={m.stage}
                  className={`stage-pill ${activeStageIndex === idx ? 'active' : ''}`}
                  onClick={() => handlePhaseChange(idx)}
                  role="tab"
                  aria-selected={activeStageIndex === idx}
                >
                  <span className="pill-phase">{m.stage}</span>
                  <span className="pill-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Phase Narrative Detail */}
          <div className="metaphor-active-detail">
            <div className="active-detail-tag">
              {data.milestones[activeStageIndex].stage} // {data.milestones[activeStageIndex].label}
            </div>
            <p className={`active-detail-desc phase-desc-reveal ${showDesc ? 'desc-visible' : ''}`}>
              {PHASE_DESCRIPTIONS[activeStageIndex]}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
