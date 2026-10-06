import React, { useEffect, useRef, useState, useCallback } from 'react';
import { STAGE_1_DATA } from '../data/gwdData';
import { SHOW_PLACEHOLDER_SECTIONS } from '../data/config';
import '../styles/beginning.css';

// ─────────────────────────────────────────────
//  Phase descriptive texts (exact user-provided copy)
// ─────────────────────────────────────────────
const PHASE_DESCRIPTIONS = [
  "Every journey begins with a single point — the first presence that marks where the story starts. From that first point, an idea begins to take shape, creating the foundation from which every future connection can grow.",
  "A single point becomes a connection — one line linking two people and creating the first visible path through the growing story of GWD. What began as a beginning now starts moving forward, turning an individual point into something shared.",
  "The story expands beyond a single connection — a third point emerges, and what began as one point becomes a network. Different people, different roles, and different connections begin coming together, creating the foundation of a growing community."
];

// Single source of truth for Chapter 00 / 01 Phase Leaders
const PHASE_LEADERS = [
  {
    phaseIndex: 0,
    name: "ALDRIN PAUL",
    role: "PRESIDENT",
    photoUrl: "/photos/aldrin-paul.webp",
    alt: "Aldrin Paul — President",
  },
  {
    phaseIndex: 1,
    name: "MOHD ISMAIL",
    role: "VICE PRESIDENT",
    photoUrl: "/photos/mohd-ismail.webp",
    alt: "Mohd Ismail — Vice President",
  },
  {
    phaseIndex: 2,
    name: "G. SRAVYA",
    role: "GENERAL SECRETARY",
    photoUrl: "/photos/g-sravya.webp",
    alt: "G. Sravya — General Secretary",
  }
];

function easeCinematic(t) {
  return t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function BeginningSection() {
  const data = STAGE_1_DATA.beginning;

  // Active phase tab selection (0, 1, or 2)
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [displayedStageIndex, setDisplayedStageIndex] = useState(0);

  // Network connection state
  const [node1Active, setNode1Active] = useState(false);
  const [line1Progress, setLine1Progress] = useState(0); // 0 to 1
  const [node2Active, setNode2Active] = useState(false);
  const [node3Active, setNode3Active] = useState(false);
  const [networkTriadConnected, setNetworkTriadConnected] = useState(false);

  // Narrative and identity reveal
  const [showDesc, setShowDesc] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [roleVisible, setRoleVisible] = useState(false);

  // Founding archive suspense state
  const [archiveStage, setArchiveStage] = useState(0); // 0=fragment, 1=partial, 2=full

  const sectionRef = useRef(null);
  const heroImgRef = useRef(null);
  const archiveRef = useRef(null);

  const hasTriggeredInitialRevealRef = useRef(false);
  const rafIdRef = useRef(null);
  const transitionIdRef = useRef(0);
  const timersRef = useRef([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const currentLeader = PHASE_LEADERS[displayedStageIndex];

  // Pre-cache photos
  useEffect(() => {
    PHASE_LEADERS.forEach((l) => {
      const img = new Image();
      img.src = l.photoUrl;
    });
  }, []);

  // Emergence animation runner
  const runEmergenceAnimation = useCallback((thisTransition) => {
    const el = heroImgRef.current;
    if (!el) return;

    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.94)';
    el.style.filter = 'brightness(0.35) contrast(1.18)';

    const initialMask = `radial-gradient(ellipse at 50% 45%, #000 0%, #000 0%, rgba(0,0,0,0.55) 8%, transparent 18%)`;
    el.style.webkitMaskImage = initialMask;
    el.style.maskImage = initialMask;

    const duration = 1200;
    const startTime = performance.now();

    const frameStep = (now) => {
      if (transitionIdRef.current !== thisTransition) return;

      const elapsed = now - startTime;
      const u = Math.min(1, elapsed / duration);
      const p = easeCinematic(u);

      if (heroImgRef.current) {
        const inner = (p * 72).toFixed(1);
        const mid = (p * 92 + 8).toFixed(1);
        const outer = (p * 115 + 18).toFixed(1);
        const maskStr = `radial-gradient(ellipse at 50% 45%, #000 0%, #000 ${inner}%, rgba(0,0,0,0.55) ${mid}%, transparent ${outer}%)`;

        heroImgRef.current.style.webkitMaskImage = maskStr;
        heroImgRef.current.style.maskImage = maskStr;
        heroImgRef.current.style.opacity = Math.min(1, p * 1.35).toFixed(3);
        heroImgRef.current.style.filter = `brightness(${(0.35 + p * 0.67).toFixed(3)}) contrast(${(1.18 - p * 0.14).toFixed(3)})`;
        heroImgRef.current.style.transform = `scale(${(0.94 + p * 0.06).toFixed(4)})`;
      }

      if (u < 1) {
        rafIdRef.current = requestAnimationFrame(frameStep);
      } else {
        if (heroImgRef.current) {
          heroImgRef.current.style.webkitMaskImage = '';
          heroImgRef.current.style.maskImage = '';
          heroImgRef.current.style.opacity = '1';
          heroImgRef.current.style.filter = 'brightness(1.02) contrast(1.04)';
          heroImgRef.current.style.transform = 'scale(1)';
        }

        setNameVisible(true);
        const tRole = setTimeout(() => {
          if (transitionIdRef.current !== thisTransition) return;
          setRoleVisible(true);
          setShowDesc(true);
        }, 180);
        timersRef.current.push(tRole);
      }
    };

    rafIdRef.current = requestAnimationFrame(frameStep);
  }, []);

  // Handle phase transitions with physical travelling line and node sequence
  const handlePhaseChange = useCallback((targetIdx) => {
    setActiveStageIndex(targetIdx);

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    clearAllTimers();

    const thisTransition = ++transitionIdRef.current;

    setNameVisible(false);
    setRoleVisible(false);
    setShowDesc(false);

    // Fade out current photo
    if (heroImgRef.current) {
      heroImgRef.current.style.transition = 'opacity 0.22s ease, transform 0.22s ease, filter 0.22s ease';
      heroImgRef.current.style.opacity = '0';
      heroImgRef.current.style.transform = 'scale(0.95)';
      heroImgRef.current.style.filter = 'brightness(0.2)';
    }

    if (targetIdx === 0) {
      // PHASE 01 — ONE POINT: Aldrin node activates, then photo emerges
      setNode1Active(true);
      setLine1Progress(0);
      setNode2Active(false);
      setNode3Active(false);
      setNetworkTriadConnected(false);

      const t1 = setTimeout(() => {
        if (transitionIdRef.current !== thisTransition) return;
        setDisplayedStageIndex(0);
        runEmergenceAnimation(thisTransition);
      }, 260);
      timersRef.current.push(t1);

    } else if (targetIdx === 1) {
      // PHASE 02 — ONE LINE: Line physically travels from Node 1 to Node 2.
      // ONLY when line reaches Node 2 does Node 2 activate and Mohd appear!
      setNode1Active(true);
      setNode2Active(false);
      setNode3Active(false);
      setNetworkTriadConnected(false);
      setLine1Progress(0);

      const lineTravelDuration = 700; // ms
      const lineStart = performance.now();

      const animateLine = (now) => {
        if (transitionIdRef.current !== thisTransition) return;
        const p = Math.min(1, (now - lineStart) / lineTravelDuration);
        setLine1Progress(p);

        if (p < 1) {
          requestAnimationFrame(animateLine);
        } else {
          // Line has physically reached Node 2!
          setNode2Active(true);
          const tReveal = setTimeout(() => {
            if (transitionIdRef.current !== thisTransition) return;
            setDisplayedStageIndex(1);
            runEmergenceAnimation(thisTransition);
          }, 120);
          timersRef.current.push(tReveal);
        }
      };

      const tStartLine = setTimeout(() => {
        if (transitionIdRef.current !== thisTransition) return;
        requestAnimationFrame(animateLine);
      }, 200);
      timersRef.current.push(tStartLine);

    } else if (targetIdx === 2) {
      // PHASE 03 — A NETWORK:
      // G. Sravya appears FIRST.
      // Wait approx 2-3 seconds, ONLY AFTER THAT do all 3 connect into final network.
      setNode1Active(true);
      setLine1Progress(1);
      setNode2Active(true);
      setNode3Active(true);
      setNetworkTriadConnected(false);

      const tRevealSravya = setTimeout(() => {
        if (transitionIdRef.current !== thisTransition) return;
        setDisplayedStageIndex(2);
        runEmergenceAnimation(thisTransition);

        // After 2.5 seconds, physically connect into the final triangular network
        const tNetworkConnect = setTimeout(() => {
          if (transitionIdRef.current !== thisTransition) return;
          setNetworkTriadConnected(true);
        }, 2500);
        timersRef.current.push(tNetworkConnect);
      }, 260);
      timersRef.current.push(tRevealSravya);
    }
  }, [runEmergenceAnimation]);

  // Initial trigger when viewport reaches chapter
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasTriggeredInitialRevealRef.current) {
          hasTriggeredInitialRevealRef.current = true;
          observer.disconnect();

          setNode1Active(true);
          const thisTransition = ++transitionIdRef.current;
          const tStart = setTimeout(() => {
            runEmergenceAnimation(thisTransition);
          }, 150);
          timersRef.current.push(tStart);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(sectionEl);
    return () => {
      observer.disconnect();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      clearAllTimers();
    };
  }, [runEmergenceAnimation]);

  // Archive suspense reveal on scroll into archive area
  useEffect(() => {
    const archiveEl = archiveRef.current;
    if (!archiveEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // fragment (stage 0) -> partial (stage 1) -> full (stage 2)
          setTimeout(() => setArchiveStage(1), 300);
          setTimeout(() => setArchiveStage(2), 900);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(archiveEl);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="beginning" className="beginning-section" aria-label="Chapter 01: The Beginning">
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

        {/* ── PHYSICAL NETWORK CONSTELLATION BAR ── */}
        <div className="network-constellation-track" aria-hidden="true">
          <svg className="network-svg-canvas" viewBox="0 0 800 60" preserveAspectRatio="none">
            {/* Background trace line */}
            <line x1="160" y1="30" x2="640" y2="30" className="constellation-bg-line" />

            {/* Line 1 -> 2: Physically travelling line */}
            {activeStageIndex >= 1 && (
              <line
                x1="160"
                y1="30"
                x2={160 + (400 - 160) * line1Progress}
                y2="30"
                className="constellation-active-line"
              />
            )}

            {/* Triad Network Line 2 -> 3 and 1 -> 3 when fully connected */}
            {networkTriadConnected && (
              <>
                <line x1="400" y1="30" x2="640" y2="30" className="constellation-active-line pulse-glow" />
                <path d="M 160 30 Q 400 6 640 30" className="constellation-active-line triad-arc pulse-glow" />
              </>
            )}
          </svg>

          {/* Node 1: Aldrin Paul */}
          <div className={`constellation-node node-1 ${node1Active ? 'active' : ''} ${activeStageIndex === 0 ? 'selected' : ''}`}>
            <div className="node-glow-ring" />
            <div className="node-core-dot" />
            <span className="node-label">01 / ONE POINT</span>
          </div>

          {/* Node 2: Mohd Ismail */}
          <div className={`constellation-node node-2 ${node2Active ? 'active' : ''} ${activeStageIndex === 1 ? 'selected' : ''}`}>
            <div className="node-glow-ring" />
            <div className="node-core-dot" />
            <span className="node-label">02 / ONE LINE</span>
          </div>

          {/* Node 3: G. Sravya */}
          <div className={`constellation-node node-3 ${node3Active ? 'active' : ''} ${activeStageIndex === 2 ? 'selected' : ''}`}>
            <div className="node-glow-ring" />
            <div className="node-core-dot" />
            <span className="node-label">{networkTriadConnected ? '03 / A NETWORK' : '03 / THIRD POINT'}</span>
          </div>
        </div>

        {/* Visual Metaphor / Emergence from Darkness Centerpiece */}
        <div className="metaphor-wrapper">
          <div className="emergence-stage">
            {/* The Frameless, Borderless Floating Photograph */}
            <div className="emergence-photo-stage">
              <div className="emergence-photo-frame">
                <img
                  ref={heroImgRef}
                  src={currentLeader.photoUrl}
                  alt={currentLeader.alt}
                  className="emergence-hero-img"
                  style={{
                    opacity: 0,
                    transform: 'scale(0.94)',
                    filter: 'brightness(0.35) contrast(1.18)'
                  }}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>

            {/* Revealed Identity: Name then Role with spacious vertical rhythm */}
            <div className="emergence-identity-block">
              <h3 className={`emergence-leader-name ${nameVisible ? 'name-visible' : ''}`}>
                {currentLeader.name}
              </h3>
              <span className={`emergence-leader-role ${roleVisible ? 'role-visible' : ''}`}>
                {currentLeader.role}
              </span>
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

        {/* ── CHAPTER 01: FOUNDING ARCHIVE DOSSIER (§12) ── */}
        {SHOW_PLACEHOLDER_SECTIONS && (
          <div ref={archiveRef} className={`founding-archive-dossier stage-${archiveStage}`}>
            <div className="archive-dossier-header">
              <div className="archive-doc-tag">DOC // GWD-FOUNDING-ARCHIVE</div>
              <div className="archive-status-tag">
                <span className="status-blink-dot" />
                STATUS: ARCHIVE INCOMPLETE
              </div>
            </div>

            <h3 className="archive-dossier-title">THE BEGINNING OF GWD</h3>

            <div className="archive-dossier-body">
              <p className="archive-verified-placeholder">[ADD VERIFIED GWD CLUB FOUNDING STORY]</p>
              <p className="archive-verified-note">
                FOUNDING DETAILS, ORIGINAL PURPOSE, IMPORTANT DATES, AND EARLY MILESTONES WILL BE ADDED HERE ONCE VERIFIED.
              </p>
            </div>

            <div className="archive-stamp-footer">
              <span className="stamp-code">SEC-GWD-ORIGIN // CLASSIFIED RECORD</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
