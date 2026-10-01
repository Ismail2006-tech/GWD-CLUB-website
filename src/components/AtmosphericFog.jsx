import React, { useEffect, useRef } from 'react';
import '../styles/atmosphericFog.css';

/**
 * GWD CLUB — GLOBAL CINEMATIC ATMOSPHERIC SMOKE SYSTEM
 * 
 * Persistent, continuous atmospheric background across the entire website.
 * Runs seamlessly from Chapter 00 (The Void) through Chapter 15 (The Future).
 * 
 * Layers:
 * 1. Background Fog: Expansive, slow-breathing light red ambient bloom.
 * 2. Mid Fog: Organic smoke formations drifting in multiple directions.
 * 3. Near Atmosphere: Fine floating atmospheric vapor particles & micro-dust on canvas.
 * 4. Deep Green Trace: Subtle, rare emerald presence.
 * 
 * Black remains 80–90% dominant everywhere.
 * Transitions are ultra-gradual (lerped over 3–5 seconds). Never resets.
 */

// Chapter atmospheric DNA — subtle modulation, continuous world
const CHAPTER_ATMOSPHERE = {
  // 00 — THE VOID: almost completely black, mysterious faint red haze
  '00': { intensity: 0.28, fogOpacity: 0.18, vaporCount: 22, glowPos: [35, 65] },
  // 01 — THE BEGINNING: slightly more visible red atmosphere, subtle emerging fog
  '01': { intensity: 0.44, fogOpacity: 0.30, vaporCount: 36, glowPos: [25, 52] },
  // 02 — WHY GWD EXISTS: balanced atmosphere, slightly clearer red light
  '02': { intensity: 0.54, fogOpacity: 0.38, vaporCount: 44, glowPos: [50, 42] },
  // 03 — THE PEOPLE: soft atmospheric movement, human-focused environment
  '03': { intensity: 0.48, fogOpacity: 0.34, vaporCount: 38, glowPos: [65, 50] },
  // 04 — THE LEADERS: subtle red bloom around active identities, black dominant
  '04': { intensity: 0.56, fogOpacity: 0.40, vaporCount: 42, glowPos: [40, 58] },
  // 05 — VOICES OF GWD: softer, calmer fog, reduced intensity
  '05': { intensity: 0.42, fogOpacity: 0.28, vaporCount: 30, glowPos: [30, 46] },
  // 06 — THE CORE TEAM: atmospheric depth behind team photo, never obscures faces
  '06': { intensity: 0.50, fogOpacity: 0.36, vaporCount: 38, glowPos: [55, 52] },
  // 07 — LIVING SYSTEM / STRUCTURE: subtle red atmosphere around network
  '07': { intensity: 0.54, fogOpacity: 0.40, vaporCount: 42, glowPos: [46, 50] },
  // 08 — THE MEMBERS: atmospheric archive feeling, soft drifting fog
  '08': { intensity: 0.46, fogOpacity: 0.32, vaporCount: 34, glowPos: [38, 62] },
  // 09 — THE JOURNEY: gradual movement, travelling through time
  '09': { intensity: 0.52, fogOpacity: 0.38, vaporCount: 40, glowPos: [52, 45] },
  // 10 — EVENTS: slightly more dynamic atmosphere, still subtle
  '10': { intensity: 0.56, fogOpacity: 0.40, vaporCount: 44, glowPos: [58, 48] },
  // 11 — PROJECTS / WORK: cleaner atmosphere, less fog behind important info
  '11': { intensity: 0.46, fogOpacity: 0.30, vaporCount: 32, glowPos: [42, 54] },
  // 12 — MEMORIES: softer, dreamier haze, slightly more diffuse
  '12': { intensity: 0.42, fogOpacity: 0.28, vaporCount: 28, glowPos: [50, 50] },
  // 13 — ACHIEVEMENTS: controlled atmosphere, red highlights sharper
  '13': { intensity: 0.52, fogOpacity: 0.36, vaporCount: 38, glowPos: [45, 52] },
  // 14 — GWD TODAY: clearer, more confident atmosphere, slightly stronger red presence
  '14': { intensity: 0.55, fogOpacity: 0.38, vaporCount: 40, glowPos: [50, 56] },
  // 15 — THE FUTURE: atmosphere gradually darker again, red light slowly fades toward black
  '15': { intensity: 0.22, fogOpacity: 0.14, vaporCount: 16, glowPos: [50, 50] },
};

// Key aliases for bulletproof chapter lookup
const KEY_ALIASES = {
  void: '00',
  beginning: '01',
  why: '02',
  people: '03',
  leaders: '04',
  voices: '05',
  'core-team': '06',
  core: '06',
  'living-system': '07',
  structure: '07',
  members: '08',
  journey: '09',
  events: '10',
  projects: '11',
  memories: '12',
  achievements: '13',
  today: '14',
  future: '15',
};

function normalizeChapter(key) {
  if (!key) return '00';
  const str = String(key).toLowerCase().trim();
  if (KEY_ALIASES[str]) return KEY_ALIASES[str];
  const pad = str.padStart(2, '0');
  if (CHAPTER_ATMOSPHERE[pad]) return pad;
  return '00';
}

export default function AtmosphericFog({ activeChapter }) {
  const envRef = useRef(null);
  const atmoA = useRef(null);
  const atmoB = useRef(null);
  const atmoC = useRef(null);
  const greenAtmo = useRef(null);
  const canvasRef = useRef(null);

  // Scroll & Momentum tracking
  const scrollYRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const smoothedVelocityRef = useRef(0);

  // Lerping animation state
  const targetAtmoRef = useRef(CHAPTER_ATMOSPHERE['00']);
  const lerpedIntensity = useRef(0.28);
  const lerpedFogOpacity = useRef(0.18);
  const lerpedGlowX = useRef(35);
  const lerpedGlowY = useRef(65);
  const lerpedVaporCount = useRef(22);

  // Particles state for Layer 3 (Near Atmospheric Vapor & Micro-Dust)
  const particlesRef = useRef([]);

  // 1. Scroll tracking with momentum
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      scrollYRef.current = window.scrollY || window.pageYOffset;
      if (!ticking) {
        requestAnimationFrame(() => {
          scrollVelocityRef.current = scrollYRef.current - lastScrollYRef.current;
          lastScrollYRef.current = scrollYRef.current;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 2. Chapter target updates (continuous smooth transition)
  useEffect(() => {
    const id = normalizeChapter(activeChapter);
    targetAtmoRef.current = CHAPTER_ATMOSPHERE[id] || CHAPTER_ATMOSPHERE['00'];
  }, [activeChapter]);

  // 3. Vapor & Micro-Dust Canvas Engine (Layer 3)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    // Initialize atmospheric vapor particles
    const MAX_VAPOR = window.innerWidth < 768 ? 24 : 52;
    particlesRef.current = Array.from({ length: MAX_VAPOR }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.15 - 0.05, // gentle natural upward rise
      radius: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.35 + 0.12,
      phase: Math.random() * Math.PI * 2,
      hueType: Math.random() > 0.22 ? 'red' : Math.random() > 0.5 ? 'warm' : 'green',
    }));

    const lerp = (a, b, t) => a + (b - a) * t;

    const renderLoop = (time) => {
      const t = targetAtmoRef.current;
      const LERP_SPEED = 0.015; // Slow, cinematic interpolation (3-4 seconds per change)

      lerpedIntensity.current = lerp(lerpedIntensity.current, t.intensity, LERP_SPEED);
      lerpedFogOpacity.current = lerp(lerpedFogOpacity.current, t.fogOpacity, LERP_SPEED);
      lerpedGlowX.current = lerp(lerpedGlowX.current, t.glowPos[0], LERP_SPEED);
      lerpedGlowY.current = lerp(lerpedGlowY.current, t.glowPos[1], LERP_SPEED);
      lerpedVaporCount.current = lerp(lerpedVaporCount.current, t.vaporCount, LERP_SPEED);

      // Smooth scroll velocity damping for subtle momentum
      smoothedVelocityRef.current = lerp(
        smoothedVelocityRef.current,
        scrollVelocityRef.current * 0.06,
        0.08
      );
      scrollVelocityRef.current *= 0.92; // damp naturally

      // Continuous slow scroll drift on CSS layers (very subtle 1.2% offset)
      const scrollShift = scrollYRef.current * 0.012;
      if (envRef.current) {
        envRef.current.style.setProperty('--scroll-drift', `${scrollShift}px`);
        envRef.current.style.setProperty('--fog-base-opacity', lerpedFogOpacity.current);
      }

      // Update Layer 1: Atmospheric Glows
      if (atmoA.current) {
        const ox = lerpedGlowX.current;
        const oy = lerpedGlowY.current;
        atmoA.current.style.opacity = lerpedIntensity.current * 0.95;
        atmoA.current.style.left = `${ox - 30}%`;
        atmoA.current.style.top = `${oy - 30}%`;
      }

      if (atmoB.current) {
        const ox = 100 - lerpedGlowX.current;
        const oy = 100 - lerpedGlowY.current;
        atmoB.current.style.opacity = lerpedIntensity.current * 0.65;
        atmoB.current.style.left = `${ox - 30}%`;
        atmoB.current.style.top = `${oy - 20}%`;
      }

      if (atmoC.current) {
        atmoC.current.style.opacity = lerpedIntensity.current * 0.45;
      }

      if (greenAtmo.current) {
        greenAtmo.current.style.opacity = lerpedIntensity.current * 0.22;
      }

      // Render Layer 3: Atmospheric Vapor Canvas
      ctx.clearRect(0, 0, width, height);

      const activeCount = Math.min(
        particlesRef.current.length,
        Math.floor(lerpedVaporCount.current * (window.innerWidth < 768 ? 0.6 : 1.1))
      );
      const intensity = lerpedIntensity.current;
      const momentumY = smoothedVelocityRef.current;

      for (let i = 0; i < activeCount; i++) {
        const p = particlesRef.current[i];

        // Organic Brownian motion + subtle scroll momentum
        p.x += p.vx + Math.sin(time * 0.0006 + p.phase) * 0.15;
        p.y += p.vy - momentumY + Math.cos(time * 0.0005 + p.phase) * 0.12;

        // Wrap gently around edges
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Soft pulsating alpha
        const pulse = 0.8 + Math.sin(time * 0.0012 + p.phase) * 0.2;
        const alpha = p.baseAlpha * intensity * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.hueType === 'red') {
          ctx.fillStyle = `rgba(255, 35, 60, ${alpha * 0.85})`;
        } else if (p.hueType === 'warm') {
          ctx.fillStyle = `rgba(240, 220, 210, ${alpha * 0.55})`;
        } else {
          ctx.fillStyle = `rgba(0, 81, 46, ${alpha * 0.65})`;
        }
        ctx.fill();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', onResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={envRef}
      className="atmospheric-fog-env"
      aria-hidden="true"
      role="presentation"
    >
      {/* ================================================================
          LAYER 1: EXPANSIVE LIGHT RED ATMOSPHERIC BLOOM (Background Fog)
          ================================================================ */}
      <div ref={atmoA} className="atmo-glow atmo-glow--primary" />
      <div ref={atmoB} className="atmo-glow atmo-glow--secondary" />
      <div ref={atmoC} className="atmo-glow atmo-glow--tertiary" />

      {/* Deep green subtle accent — rare, cinematic trace */}
      <div ref={greenAtmo} className="atmo-glow atmo-glow--green" />

      {/* ================================================================
          LAYER 2: DRIFTING MID-LEVEL ORGANIC FOG / SMOKE
          Multiple asynchronous speeds, directions, and scales
          ================================================================ */}
      {/* Drift 1: Slow horizontal L -> R */}
      <div className="fog-blob fog-blob--1" />
      {/* Drift 2: Slow diagonal R -> L */}
      <div className="fog-blob fog-blob--2" />
      {/* Drift 3: Wide mid-level translucent smoke sheet */}
      <div className="fog-blob fog-blob--3" />
      {/* Drift 4: Upward rising soft organic wisp */}
      <div className="fog-blob fog-blob--4" />
      {/* Drift 5: Gentle expanding and fading cloud */}
      <div className="fog-blob fog-blob--5" />
      {/* Drift 6: Ambient low-altitude counter drift */}
      <div className="fog-blob fog-blob--6" />

      {/* ================================================================
          LAYER 3: NEAR ATMOSPHERIC VAPOR & PARTICLES CANVAS
          Continuous floating vapor motes responding to scroll momentum
          ================================================================ */}
      <canvas ref={canvasRef} className="atmo-vapor-canvas" />

      {/* ================================================================
          LAYER 4: AUTHENTIC 35mm FILM GRAIN TEXTURE
          Prevents gradient banding and provides cinematic documentary feel
          ================================================================ */}
      <div className="atmo-grain-overlay" />
    </div>
  );
}
