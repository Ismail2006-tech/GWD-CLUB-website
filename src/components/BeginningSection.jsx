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

// Single source of truth for Chapter 01 Phase Leaders
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

export default function BeginningSection() {
  const data = STAGE_1_DATA.beginning;

  // Active phase tab selection (0, 1, or 2)
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  // Currently displayed leader in DOM (strictly ONLY ONE leader at a time)
  const [displayedStageIndex, setDisplayedStageIndex] = useState(0);

  // Phase transition state: 'exiting' | 'darkness' | 'emerging' | 'revealed' | 'showName' | 'settled'
  const [phaseState, setPhaseState] = useState('emerging');

  // Narrative description reveal
  const [showDesc, setShowDesc] = useState(false);

  // Cancellation and timer ref to handle rapid clicking cleanly
  const transitionIdRef = useRef(0);
  const timersRef = useRef([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const currentLeader = PHASE_LEADERS[displayedStageIndex];

  // Sequence manager for photographic emergence from darkness
  const startEmergenceSequence = useCallback((targetIdx, isInitial = false) => {
    clearAllTimers();
    const thisTransition = ++transitionIdRef.current;

    if (isInitial) {
      setDisplayedStageIndex(0);
      setPhaseState('emerging');
      setShowDesc(false);

      const t1 = setTimeout(() => {
        if (transitionIdRef.current !== thisTransition) return;
        setPhaseState('revealed');

        const t2 = setTimeout(() => {
          if (transitionIdRef.current !== thisTransition) return;
          setPhaseState('showName');

          const t3 = setTimeout(() => {
            if (transitionIdRef.current !== thisTransition) return;
            setPhaseState('settled');
            setShowDesc(true);
          }, 180);
          timersRef.current.push(t3);
        }, 200);
        timersRef.current.push(t2);
      }, 1100);
      timersRef.current.push(t1);
      return;
    }

    // Step 1: Previous leader dissolves smoothly into total darkness
    setPhaseState('exiting');
    setShowDesc(false);

    // Step 2: Brief quiet darkness
    const tExit = setTimeout(() => {
      if (transitionIdRef.current !== thisTransition) return;
      setDisplayedStageIndex(targetIdx);
      setPhaseState('darkness');

      // Step 3: Photo begins emerging from behind the black
      const tDark = setTimeout(() => {
        if (transitionIdRef.current !== thisTransition) return;
        setPhaseState('emerging');

        // Step 4: Photo fully emerges & settles into the black
        const tEmerge = setTimeout(() => {
          if (transitionIdRef.current !== thisTransition) return;
          setPhaseState('revealed');

          // Step 5: Name reveals
          const tName = setTimeout(() => {
            if (transitionIdRef.current !== thisTransition) return;
            setPhaseState('showName');

            // Step 6: Role reveals & scene settles
            const tRole = setTimeout(() => {
              if (transitionIdRef.current !== thisTransition) return;
              setPhaseState('settled');
              setShowDesc(true);
            }, 180);
            timersRef.current.push(tRole);
          }, 200);
          timersRef.current.push(tName);
        }, 1100);
        timersRef.current.push(tEmerge);
      }, 220);
      timersRef.current.push(tDark);
    }, 280);
    timersRef.current.push(tExit);
  }, []);

  const handlePhaseChange = (idx) => {
    if (idx === activeStageIndex && phaseState === 'settled') return;
    setActiveStageIndex(idx);
    startEmergenceSequence(idx, false);
  };

  // Initial emergence sequence on mount for Phase 01
  useEffect(() => {
    startEmergenceSequence(0, true);
    return () => clearAllTimers();
  }, [startEmergenceSequence]);

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

        {/* Visual Metaphor / Emergence from Darkness Centerpiece */}
        <div className="metaphor-wrapper">
          <div className={`emergence-stage stage-state-${phaseState}`}>
            {/* The Frameless, Borderless Floating Photograph */}
            <div className={`emergence-photo-stage state-${phaseState}`}>
              {/* Feathered mask frame: center is sharp, corners & edges dissolve into black */}
              <div className="emergence-photo-frame">
                <img
                  src={currentLeader.photoUrl}
                  alt={currentLeader.alt}
                  className="emergence-hero-img"
                  loading="eager"
                  decoding="async"
                />
                {/* Organic darkness veil that dissolves outward */}
                <div className="emergence-black-veil" />
              </div>
            </div>

            {/* Revealed Identity: Name then Role with spacious vertical rhythm */}
            <div className={`emergence-identity-block identity-state-${phaseState}`}>
              <h3 className={`emergence-leader-name ${phaseState === 'showName' || phaseState === 'settled' ? 'name-visible' : ''}`}>
                {currentLeader.name}
              </h3>
              <span className={`emergence-leader-role ${phaseState === 'settled' ? 'role-visible' : ''}`}>
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
      </div>
    </section>
  );
}
