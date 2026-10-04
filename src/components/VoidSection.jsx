import React, { useEffect, useRef, useState } from 'react';
import '../styles/void.css';

/**
 * VoidSection — Chapter 00: The Void
 *
 * CINEMATIC PARTICLE FORMATION OPENING
 * 
 * Particles begin scattered in darkness, then travel and assemble
 * into the "GWD" text shape. After formation, the rest of the
 * opening sequence plays: GWD CLUB, GET WORK DONE, manifesto, CTA.
 *
 * The sequence plays ONCE and never replays on scroll-back.
 * Uses canvas pixel-sampling to determine particle target positions.
 *
 * Performance:
 * - ~600 particles desktop, ~300 mobile
 * - Pre-computed colors at init
 * - rAF with frame-skip on mobile (~30fps)
 * - No shadowBlur in main loop
 */

let introCompleted = false;

export default function VoidSection({ onEnter }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const [titleVisible, setTitleVisible] = useState(() => introCompleted);
  const [manifestoVisible, setManifestoVisible] = useState(() => introCompleted);
  const [ctaVisible, setCtaVisible] = useState(() => introCompleted);

  // Particle formation + sequenced reveal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isMobile = window.innerWidth < 768;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // --- PARTICLE TARGET SAMPLING ---
    // Render "GWD" on an offscreen canvas, sample pixel positions
    function sampleTextTargets(text, fontSize, maxParticles) {
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      offCanvas.width = width;
      offCanvas.height = height;

      offCtx.fillStyle = '#fff';
      offCtx.font = `900 ${fontSize}px "Rajdhani", "Inter", Arial, sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText(text, width / 2, height / 2 - (isMobile ? 40 : 60));

      const imageData = offCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const targets = [];

      // Sample every Nth pixel to stay within particle budget
      const step = isMobile ? 5 : 3;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          if (data[idx + 3] > 128) {
            targets.push({ x, y });
          }
        }
      }

      // If too many targets, randomly sample down
      if (targets.length > maxParticles) {
        const shuffled = targets.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, maxParticles);
      }
      return targets;
    }

    const PARTICLE_COUNT = isMobile ? 300 : 600;
    const fontSize = isMobile
      ? Math.min(width * 0.28, 120)
      : Math.min(width * 0.16, 200);
    const targets = sampleTextTargets('GWD', fontSize, PARTICLE_COUNT);

    // --- PARTICLE INITIALIZATION ---
    const particles = targets.map((target) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 500;
      return {
        // Start scattered
        x: target.x + Math.cos(angle) * dist,
        y: target.y + Math.sin(angle) * dist,
        // Target position (letter shape)
        tx: target.x,
        ty: target.y,
        // Rendering
        size: Math.random() * 1.8 + 0.6,
        color: Math.random() > 0.35
          ? `rgba(242,242,242,${(0.6 + Math.random() * 0.3).toFixed(2)})`
          : `rgba(255,27,60,${(0.55 + Math.random() * 0.35).toFixed(2)})`,
        // Animation state
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
        delay: Math.random() * 0.35,
        // Ambient drift after formation
        driftPhase: Math.random() * Math.PI * 2,
        driftAmp: Math.random() * 1.2 + 0.3,
      };
    });

    // Background ambient particles (always floating)
    const ambientCount = isMobile ? 15 : 30;
    const ambientParticles = [];
    for (let i = 0; i < ambientCount; i++) {
      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.4,
        color: Math.random() > 0.25
          ? `rgba(0,81,46,${(0.2 + Math.random() * 0.2).toFixed(2)})`
          : `rgba(255,27,60,${(0.3 + Math.random() * 0.25).toFixed(2)})`,
      });
    }

    // --- ANIMATION PHASES ---
    // Phase 0: darkness + signal point (0-1.2s)
    // Phase 1: circular field forming + particles begin moving (1.2-2.5s)
    // Phase 2: particles assembling into GWD (2.5-5.5s)
    // Phase 3: formation complete, text reveals begin (5.5s+)

    let startTime = null;
    let formationComplete = false;
    let frameCount = 0;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (introCompleted || reducedMotion) {
      // Skip animation — show everything assembled immediately
      particles.forEach((p) => {
        p.x = p.tx;
        p.y = p.ty;
        p.progress = 1;
      });
      formationComplete = true;
      if (!introCompleted) {
        setTitleVisible(true);
        setManifestoVisible(true);
        setCtaVisible(true);
        introCompleted = true;
      }
    }

    // Sequenced reveals (only if not already completed)
    const sequenceTimers = [];
    function startTextSequence() {
      if (introCompleted) return;
      sequenceTimers.push(setTimeout(() => setTitleVisible(true), 400));
      sequenceTimers.push(setTimeout(() => setManifestoVisible(true), 1800));
      sequenceTimers.push(
        setTimeout(() => {
          setCtaVisible(true);
          introCompleted = true;
        }, 2800)
      );
    }

    // --- RENDER LOOP ---
    const render = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000; // seconds

      frameCount++;
      if (isMobile && frameCount % 2 !== 0) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // ── AMBIENT PARTICLES (always) ──
      for (const ap of ambientParticles) {
        ap.x += ap.vx;
        ap.y += ap.vy;
        if (ap.x < 0) ap.x = width;
        if (ap.x > width) ap.x = 0;
        if (ap.y < 0) ap.y = height;
        if (ap.y > height) ap.y = 0;
        ctx.beginPath();
        ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2);
        ctx.fillStyle = ap.color;
        ctx.fill();
      }

      // ── PHASE 0: RED SIGNAL POINT (0-1.2s) ──
      if (elapsed < 1.2 && !formationComplete) {
        const pulse = (Math.sin(elapsed * 4) + 1) / 2;
        const signalAlpha = Math.min(elapsed / 0.5, 1);
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - (isMobile ? 40 : 60), 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,27,60,${(0.6 + pulse * 0.3) * signalAlpha})`;
        ctx.shadowColor = '#ff1b3c';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── PHASE 1: CIRCULAR FIELD (1.0s+) ──
      if (elapsed > 1.0 && !formationComplete) {
        const fieldProgress = Math.min((elapsed - 1.0) / 2.0, 1);
        const radius = Math.min(width, height) * 0.38 * fieldProgress;
        const fieldAlpha = fieldProgress * 0.15;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - (isMobile ? 40 : 60), radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,27,60,${fieldAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── PHASE 2: PARTICLE ASSEMBLY (1.2s+) ──
      if (elapsed > 1.2 || formationComplete) {
        const assemblyTime = Math.max(0, elapsed - 1.2);

        let allDone = true;
        for (const p of particles) {
          if (p.progress < 1 && !formationComplete) {
            const delayedTime = Math.max(0, assemblyTime - p.delay);
            if (delayedTime > 0) {
              p.progress = Math.min(1, p.progress + p.speed * 1.8);
            }
            if (p.progress < 1) allDone = false;
          }

          // Ease: cubic ease-in-out
          const t = p.progress;
          const eased =
            t < 0.5
              ? 4 * t * t * t
              : 1 - Math.pow(-2 * t + 2, 3) / 2;

          // Interpolate position
          let px = p.x + (p.tx - p.x) * eased;
          let py = p.y + (p.ty - p.y) * eased;

          // Post-formation: subtle ambient drift
          if (p.progress >= 1) {
            const drift = Math.sin(elapsed * 0.5 + p.driftPhase);
            px = p.tx + drift * p.driftAmp;
            py = p.ty + Math.cos(elapsed * 0.3 + p.driftPhase * 1.3) * p.driftAmp * 0.6;
          }

          // Alpha ramp: fade in as particles start moving
          const alpha = formationComplete
            ? 1
            : Math.min(1, p.progress * 3);

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Trigger text sequence when formation completes
        if (allDone && !formationComplete) {
          formationComplete = true;
          startTextSequence();
        }
      }

      // ── PERSISTENT CIRCULAR FIELD (post-formation) ──
      if (formationComplete) {
        const pulse = (Math.sin(elapsed * 0.4) + 1) / 2;
        const radius = Math.min(width, height) * 0.38;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2 - (isMobile ? 40 : 60), radius + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,27,60,${0.08 + pulse * 0.04})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      sequenceTimers.forEach(clearTimeout);
    };
  }, []);

  return (
    <section id="void" className="void-section" aria-label="Chapter 00: The Void">
      <canvas ref={canvasRef} className="void-particles-canvas" />

      {/* Atmospheric center aura */}
      <div className="void-abyss-glow" />

      {/* Core content — text elements revealed in sequence after particle formation */}
      <div className="void-core-experience">

        {/* GWD text is rendered by particles on canvas — logo image hidden */}

        {/* Step 2: GWD CLUB + GET WORK DONE */}
        <div className={`void-monolith-title${titleVisible ? ' intro-visible' : ''}`}>
          <h1 className="void-gwd-brand">
            <span className="brand-word gwd-word">GWD</span>
            <span className="brand-word club-word">CLUB</span>
          </h1>
          <p className="void-tagline-sub">GET WORK DONE</p>
        </div>

        {/* Step 3: EVERY STORY HAS A BEGINNING */}
        <div className={`void-manifesto-container${manifestoVisible ? ' intro-visible' : ''}`}>
          <div className="manifesto-line-separator" />
          <p className="void-manifesto-text">
            EVERY STORY HAS A BEGINNING.
          </p>
        </div>

        {/* Step 4: SCROLL TO ENTER */}
        <div className={`void-cta-wrapper${ctaVisible ? ' intro-visible' : ''}`}>
          <div
            className="void-scroll-invitation"
            onClick={onEnter}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEnter();
              }
            }}
            aria-label="Scroll or activate to enter experience"
          >
            <div className="scroll-pulse-ring" />
            <div className="scroll-chevron-indicator">
              <span className="chevron-bar" />
            </div>
            <span className="scroll-instruction-label">SCROLL TO ENTER</span>
          </div>
        </div>

      </div>
    </section>
  );
}
