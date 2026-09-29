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

// Smooth cinematic easing: gentle start, continuous momentum, seamless settle
function easeCinematic(t) {
  return t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function BeginningSection() {
  const data = STAGE_1_DATA.beginning;

  // Active phase tab selection (0, 1, or 2)
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  // Currently displayed leader in DOM (strictly ONLY ONE leader at a time)
  const [displayedStageIndex, setDisplayedStageIndex] = useState(0);

  // Narrative description reveal
  const [showDesc, setShowDesc] = useState(false);

  // Identity visibility flags for staggered reveal
  const [nameVisible, setNameVisible] = useState(false);
  const [roleVisible, setRoleVisible] = useState(false);

  // DOM refs
  const sectionRef = useRef(null);
  const heroImgRef = useRef(null);

  // Flag to ensure initial President reveal only triggers ONCE on first viewport entry
  const hasTriggeredInitialRevealRef = useRef(false);

  // Animation frame and timer tracking
  const rafIdRef = useRef(null);
  const transitionIdRef = useRef(0);
  const timersRef = useRef([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const currentLeader = PHASE_LEADERS[displayedStageIndex];

  // Eagerly pre-cache all leadership photos immediately on mount
  useEffect(() => {
    PHASE_LEADERS.forEach((l) => {
      const img = new Image();
      img.src = l.photoUrl;
    });
  }, []);

  // Unified single-progress emergence animation runner (0 → 1 continuous motion)
  const runEmergenceAnimation = useCallback((thisTransition) => {
    const el = heroImgRef.current;
    if (!el) return;

    // Reset styles for emergence starting from hidden state
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.94)';
    el.style.filter = 'brightness(0.35) contrast(1.18)';

    const initialMask = `radial-gradient(ellipse at 50% 45%, #000 0%, #000 0%, rgba(0,0,0,0.55) 8%, transparent 18%)`;
    el.style.webkitMaskImage = initialMask;
    el.style.maskImage = initialMask;

    const duration = 1400; // 1.4s continuous cinematic reveal
    const startTime = performance.now();

    const frameStep = (now) => {
      if (transitionIdRef.current !== thisTransition) return;

      const elapsed = now - startTime;
      const u = Math.min(1, elapsed / duration);
      const p = easeCinematic(u);

      if (heroImgRef.current) {
        // Organic expanding feathered reveal from center (50% 45%) outward
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
        // Complete & fully settled: remove temporary reveal mask so the permanent soft edge feathering takes over
        if (heroImgRef.current) {
          heroImgRef.current.style.webkitMaskImage = '';
          heroImgRef.current.style.maskImage = '';
          heroImgRef.current.style.opacity = '1';
          heroImgRef.current.style.filter = 'brightness(1.02) contrast(1.04)';
          heroImgRef.current.style.transform = 'scale(1)';
        }

        // Reveal Name smoothly
        setNameVisible(true);

        // Then reveal Role 180ms later
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

  // Handle phase changes with clean sequential transitions
  const handlePhaseChange = useCallback((targetIdx) => {
    if (targetIdx === activeStageIndex && nameVisible && roleVisible) return;
    setActiveStageIndex(targetIdx);

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    clearAllTimers();

    const thisTransition = ++transitionIdRef.current;

    setNameVisible(false);
    setRoleVisible(false);
    setShowDesc(false);

    // Step 1: Current photo smoothly dissolves into black (220ms)
    if (heroImgRef.current) {
      heroImgRef.current.style.transition = 'opacity 0.22s ease, transform 0.22s ease, filter 0.22s ease';
      heroImgRef.current.style.opacity = '0';
      heroImgRef.current.style.transform = 'scale(0.95)';
      heroImgRef.current.style.filter = 'brightness(0.2)';
    }

    const tExit = setTimeout(() => {
      if (transitionIdRef.current !== thisTransition) return;
      setDisplayedStageIndex(targetIdx);

      // Step 2: Brief clean dark transition (180ms)
      const tDark = setTimeout(() => {
        if (transitionIdRef.current !== thisTransition) return;
        runEmergenceAnimation(thisTransition);
      }, 180);
      timersRef.current.push(tDark);
    }, 220);
    timersRef.current.push(tExit);
  }, [activeStageIndex, nameVisible, roleVisible, runEmergenceAnimation]);

  // Initial President emergence: triggers automatically when Chapter 01 enters viewport
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    // If IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && !hasTriggeredInitialRevealRef.current) {
            hasTriggeredInitialRevealRef.current = true;
            observer.disconnect(); // Never replay on subsequent scroll movements

            // Short pause (120ms) after entering so the visitor clearly experiences the dark state first
            const thisTransition = ++transitionIdRef.current;
            const tStart = setTimeout(() => {
              runEmergenceAnimation(thisTransition);
            }, 120);
            timersRef.current.push(tStart);
          }
        },
        {
          threshold: 0.2, // Triggers when 20% of Chapter 01 enters the viewport
          rootMargin: '0px 0px -50px 0px'
        }
      );

      observer.observe(sectionEl);

      return () => {
        observer.disconnect();
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        clearAllTimers();
      };
    } else {
      // Fallback if observer is unavailable
      const thisTransition = ++transitionIdRef.current;
      const tInit = setTimeout(() => {
        runEmergenceAnimation(thisTransition);
      }, 200);
      timersRef.current.push(tInit);

      return () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        clearAllTimers();
      };
    }
  }, [runEmergenceAnimation]);

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

        {/* Visual Metaphor / Emergence from Darkness Centerpiece */}
        <div className="metaphor-wrapper">
          <div className="emergence-stage">
            {/* The Frameless, Borderless Floating Photograph */}
            <div className="emergence-photo-stage">
              {/* Permanent feathered mask frame: center sharp, corners & edges dissolve into pure black */}
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
      </div>
    </section>
  );
}
