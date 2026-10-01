import React, { useEffect, useRef, useState } from 'react';
import VoidFog from './VoidFog';
import '../styles/void.css';

/**
 * VoidSection — Chapter 00: The Void
 *
 * Cinematic Opening Hero Section with rolling volumetric fog
 * billowing from the left and right sides of the screen.
 * Elements reveal smoothly without delay.
 */
// Module-level guard: persists for the entire page session (survives re-renders / re-mounts)
let introCompleted = false;

export default function VoidSection({ onEnter }) {
  // 4 independent reveal states — if intro already finished, initialize true immediately
  const [logoVisible, setLogoVisible]           = useState(() => introCompleted);
  const [titleVisible, setTitleVisible]         = useState(() => introCompleted);
  const [manifestoVisible, setManifestoVisible] = useState(() => introCompleted);
  const [ctaVisible, setCtaVisible]             = useState(() => introCompleted);

  // Smooth cinematic reveal on first open
  useEffect(() => {
    if (introCompleted) return;

    const ids = [
      setTimeout(() => setLogoVisible(true),        80),    // 0.08s — logo begins
      setTimeout(() => setTitleVisible(true),       300),   // 0.3s — GWD CLUB reveals
      setTimeout(() => setManifestoVisible(true),   550),   // 0.55s — Manifesto appears
      setTimeout(() => {
        setCtaVisible(true);                                // 0.8s — Scroll CTA ready
        introCompleted = true;                              // Permanently lock completed state
      }, 800),
    ];

    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <section id="void" className="void-section" aria-label="Chapter 00: The Void">
      {/* Cinematic Left & Right Rolling Atmospheric Fog */}
      <VoidFog />

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
