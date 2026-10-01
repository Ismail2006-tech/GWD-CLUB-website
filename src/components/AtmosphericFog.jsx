import React, { useEffect, useRef } from 'react';
import '../styles/atmosphericFog.css';

// Per-chapter atmospheric intensity settings
// intensity: 0–1 strength of red atmosphere
// fogOpacity: base fog visibility
// glowPos: where primary glow sits (% x, % y)
// spread: how wide/diffuse the atmosphere is
const CHAPTER_ATMO = {
  '00': { intensity: 0.12, fogOpacity: 0.06, glowPos: [30, 70], spread: 0.5 },   // THE VOID — almost black
  '01': { intensity: 0.22, fogOpacity: 0.12, glowPos: [20, 55], spread: 0.7 },   // THE BEGINNING
  '02': { intensity: 0.28, fogOpacity: 0.15, glowPos: [50, 40], spread: 0.8 },   // WHY GWD
  '03': { intensity: 0.25, fogOpacity: 0.14, glowPos: [65, 50], spread: 0.75 },  // THE PEOPLE
  '04': { intensity: 0.30, fogOpacity: 0.16, glowPos: [40, 60], spread: 0.85 },  // THE LEADERS
  '05': { intensity: 0.22, fogOpacity: 0.13, glowPos: [30, 45], spread: 0.7 },   // VOICES
  '06': { intensity: 0.28, fogOpacity: 0.15, glowPos: [55, 55], spread: 0.8 },   // CORE TEAM
  '07': { intensity: 0.20, fogOpacity: 0.12, glowPos: [45, 50], spread: 0.65 },  // MEMBERS
  '08': { intensity: 0.25, fogOpacity: 0.14, glowPos: [35, 65], spread: 0.72 },  // EVENTS
  '09': { intensity: 0.27, fogOpacity: 0.15, glowPos: [60, 40], spread: 0.78 },  // PROJECTS
  '10': { intensity: 0.20, fogOpacity: 0.10, glowPos: [50, 50], spread: 0.6 },   // MEMORIES — softer
  '11': { intensity: 0.24, fogOpacity: 0.13, glowPos: [40, 55], spread: 0.7 },   // ACHIEVEMENTS
  '12': { intensity: 0.18, fogOpacity: 0.09, glowPos: [50, 60], spread: 0.55 },  // TODAY — fading
  '13': { intensity: 0.10, fogOpacity: 0.05, glowPos: [50, 50], spread: 0.35 },  // FUTURE — back to black
};

export default function AtmosphericFog({ activeChapter }) {
  const envRef = useRef(null);
  const atmoA = useRef(null);
  const atmoB = useRef(null);
  const atmoC = useRef(null);
  const greenAtmo = useRef(null);
  const scrollYRef = useRef(0);
  const rafRef = useRef(null);
  const currentAtmo = useRef(CHAPTER_ATMO['00']);
  const targetAtmo = useRef(CHAPTER_ATMO['00']);
  const lerpedIntensity = useRef(0.12);
  const lerpedFogOpacity = useRef(0.06);
  const lerpedGlowX = useRef(30);
  const lerpedGlowY = useRef(70);

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Chapter target update
  useEffect(() => {
    const cfg = CHAPTER_ATMO[activeChapter] || CHAPTER_ATMO['00'];
    targetAtmo.current = cfg;
  }, [activeChapter]);

  // Smooth lerp animation loop
  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const SPEED = 0.015; // very slow interpolation = cinematic

    const tick = () => {
      const t = targetAtmo.current;
      lerpedIntensity.current = lerp(lerpedIntensity.current, t.intensity, SPEED);
      lerpedFogOpacity.current = lerp(lerpedFogOpacity.current, t.fogOpacity, SPEED);
      lerpedGlowX.current = lerp(lerpedGlowX.current, t.glowPos[0], SPEED);
      lerpedGlowY.current = lerp(lerpedGlowY.current, t.glowPos[1], SPEED);

      // Scroll parallax offset (very subtle — 3% of scroll)
      const scrollShift = scrollYRef.current * 0.015;

      if (envRef.current) {
        envRef.current.style.setProperty('--scroll-drift', `${scrollShift}px`);
      }

      // Primary atmospheric glow
      if (atmoA.current) {
        const ox = lerpedGlowX.current;
        const oy = lerpedGlowY.current;
        atmoA.current.style.opacity = lerpedIntensity.current * 0.9;
        atmoA.current.style.left = `${ox - 30}%`;
        atmoA.current.style.top = `${oy - 30}%`;
      }

      // Secondary glow — offset position
      if (atmoB.current) {
        const ox = 100 - lerpedGlowX.current;
        const oy = 100 - lerpedGlowY.current;
        atmoB.current.style.opacity = lerpedIntensity.current * 0.4;
        atmoB.current.style.left = `${ox - 30}%`;
        atmoB.current.style.top = `${oy - 20}%`;
      }

      // Tertiary small glow
      if (atmoC.current) {
        atmoC.current.style.opacity = lerpedIntensity.current * 0.25;
      }

      // Green subtle accent
      if (greenAtmo.current) {
        greenAtmo.current.style.opacity = lerpedIntensity.current * 0.08;
      }

      // Fog opacity
      if (envRef.current) {
        envRef.current.style.setProperty('--fog-base-opacity', lerpedFogOpacity.current);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={envRef}
      className="atmospheric-fog-env"
      aria-hidden="true"
      role="presentation"
    >
      {/* === LAYER 1: Atmospheric Red Glows === */}
      <div ref={atmoA} className="atmo-glow atmo-glow--primary" />
      <div ref={atmoB} className="atmo-glow atmo-glow--secondary" />
      <div ref={atmoC} className="atmo-glow atmo-glow--tertiary" />

      {/* Deep green subtle accent — rare */}
      <div ref={greenAtmo} className="atmo-glow atmo-glow--green" />

      {/* === LAYER 2: Fog / Smoke === */}
      {/* Each fog blob has its own animation speed and direction */}
      <div className="fog-blob fog-blob--1" />
      <div className="fog-blob fog-blob--2" />
      <div className="fog-blob fog-blob--3" />
      <div className="fog-blob fog-blob--4" />
      <div className="fog-blob fog-blob--5" />
      {/* Mobile: fewer blobs (CSS handles hiding extras) */}
    </div>
  );
}
