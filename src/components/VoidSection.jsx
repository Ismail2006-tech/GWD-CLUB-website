import React, { useEffect, useRef, useState } from 'react';
import '../styles/void.css';

/**
 * VoidSection — Chapter 00: The Void
 *
 * Handles its own one-time cinematic intro sequence internally.
 * Uses hasPlayedRef so the sequence NEVER replays when scrolling
 * back up to this section. State: INITIAL → PLAYING → COMPLETED.
 *
 * Timing:
 *   300ms  → logo begins fading in
 *   1800ms → GWD CLUB + GET WORK DONE appear
 *   3200ms → EVERY STORY HAS A BEGINNING. appears
 *   4200ms → SCROLL TO ENTER appears
 *
 * All elements use CSS transitions with animation-fill-mode equivalent
 * (opacity + transform transitions, not keyframe animations) so the
 * completed state is permanent for the entire page session.
 */
// Module-level guard: persists for the entire page session (survives re-renders / re-mounts)
let introCompleted = false;

export default function VoidSection({ onEnter }) {
  const canvasRef = useRef(null);

  // 4 independent reveal states — if intro already finished, initialize true immediately
  const [logoVisible, setLogoVisible]           = useState(() => introCompleted);
  const [titleVisible, setTitleVisible]         = useState(() => introCompleted);
  const [manifestoVisible, setManifestoVisible] = useState(() => introCompleted);
  const [ctaVisible, setCtaVisible]             = useState(() => introCompleted);

  // One-time intro sequencer — never runs again once introCompleted is true
  useEffect(() => {
    if (introCompleted) return;

    const ids = [
      setTimeout(() => setLogoVisible(true),        300),   // 0.3s — logo starts fade in
      setTimeout(() => setTitleVisible(true),       1800),  // 1.8s — GWD CLUB starts fade in
      setTimeout(() => setManifestoVisible(true),   3200),  // 3.2s — EVERY STORY HAS A BEGINNING.
      setTimeout(() => {
        setCtaVisible(true);                                // 4.3s — SCROLL TO ENTER
        introCompleted = true;                              // Permanently lock completed state
      }, 4300),
    ];

    return () => ids.forEach(clearTimeout);
  }, []);

  // Ambient particle canvas — always running, completely separate from intro
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Controlled, minimal particles (subtle green and red)
    const particleCount = 42;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.5 + 0.5,
        color: Math.random() > 0.2 ? 'rgba(0, 81, 46, 0.45)' : 'rgba(255, 27, 60, 0.6)',
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section id="void" className="void-section" aria-label="Chapter 00: The Void">
      <canvas ref={canvasRef} className="void-particles-canvas" />

      {/* Atmospheric center aura */}
      <div className="void-abyss-glow" />

      {/* Core content — always rendered in the DOM, visibility controlled per-element */}
      <div className="void-core-experience">

        {/* Step 1: GWD Logo */}
        <div className="official-logo-revelation">
          <div className={`logo-halo-effect${logoVisible ? ' intro-visible' : ''}`} />
          <img
            src="/gwd-logo.png"
            alt="Official GWD Club Logo"
            className={`official-gwd-emblem${logoVisible ? ' intro-visible' : ''}`}
            loading="eager"
          />
        </div>

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
