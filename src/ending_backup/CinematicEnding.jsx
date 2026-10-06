/**
 * GWD CLUB — CINEMATIC ENDING COMPONENT
 *
 * File: src/components/CinematicEnding.jsx
 * Description: Fully integrated multi-scene pinned ending experience:
 * Scene A (Recap) -> Scene B (Particle GWD Logo & Brackets) -> Scene C (Headlines, Big Title, Buttons, Status)
 * -> Scene D (Stay Connected Contact Grid).
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EndingNetworkBackground } from '../animations/ending/network-bg';
import { RecapScene } from '../animations/ending/recap';
import { LogoParticleSystem } from '../animations/ending/logo-particles';
import { EndingMasterTimeline } from '../animations/ending/ending';
import { endingAudio } from '../animations/ending/ending-audio';
import '../styles/ending.css';

export default function CinematicEnding({ onOpenJoinModal }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);

  // Canvases
  const networkCanvasRef = useRef(null);
  const recapCanvasRef = useRef(null);
  const particlesCanvasRef = useRef(null);

  // Engines
  const networkBgRef = useRef(null);
  const recapSceneRef = useRef(null);
  const logoParticlesRef = useRef(null);
  const timelineRef = useRef(null);

  // DOM Refs for Timeline animations
  const headline1Ref = useRef(null);
  const headline2Ref = useRef(null);
  const headline3Ref = useRef(null);
  const bigTitleContainerRef = useRef(null);
  const chromaticRedRef = useRef(null);
  const chromaticCyanRef = useRef(null);
  const glintSweepRef = useRef(null);
  const subLineRef = useRef(null);
  const joinBtnRef = useRef(null);
  const replayBtnRef = useRef(null);
  const statusTextRef = useRef(null);

  // UI States
  const [hudChapterText, setHudChapterText] = useState('RECAP');
  const [recapCounterText, setRecapCounterText] = useState('CHAPTER 00 / 07');
  const [soundEnabled, setSoundEnabled] = useState(() => endingAudio.isEnabled);
  const [showSkip, setShowSkip] = useState(true);
  const [rippleActive, setRippleActive] = useState(false);
  const [rippleSize, setRippleSize] = useState(0);

  // Initialize Engines & Timeline
  useEffect(() => {

    // 1. Init Background Network Canvas
    if (networkCanvasRef.current) {
      networkBgRef.current = new EndingNetworkBackground(networkCanvasRef.current);
    }

    // 2. Init Recap Scene
    if (recapCanvasRef.current) {
      recapSceneRef.current = new RecapScene(
        recapCanvasRef.current,
        null,
        (currentNum, total) => {
          setRecapCounterText(`CHAPTER ${currentNum} / 0${total}`);
        }
      );
    }

    // 3. Init Logo Particles System
    if (particlesCanvasRef.current) {
      logoParticlesRef.current = new LogoParticleSystem(particlesCanvasRef.current);
    }

    // Handle Resize & Canvas Resizing
    const handleCanvasResize = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const w = stage.clientWidth || window.innerWidth;
      const h = stage.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      [recapCanvasRef.current, particlesCanvasRef.current].forEach(canvas => {
        if (canvas) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.scale(dpr, dpr);
        }
      });

      recapSceneRef.current?.resize(w, h, dpr);
      logoParticlesRef.current?.resize(w, h, dpr);
    };

    handleCanvasResize();
    window.addEventListener('resize', handleCanvasResize);

    // 4. Init Master Timeline
    timelineRef.current = new EndingMasterTimeline({
      container: containerRef.current,
      stage: stageRef.current,
      networkBg: networkBgRef.current,
      recapScene: recapSceneRef.current,
      logoParticles: logoParticlesRef.current,
      domElements: {
        headline1: headline1Ref.current,
        headline2: headline2Ref.current,
        headline3: headline3Ref.current,
        bigTitle: bigTitleContainerRef.current,
        chromaticRed: chromaticRedRef.current,
        chromaticCyan: chromaticCyanRef.current,
        glintSweep: glintSweepRef.current,
        subLine: subLineRef.current,
        joinBtn: joinBtnRef.current,
        replayBtn: replayBtnRef.current,
        statusText: statusTextRef.current,
      },
      onHudChange: (label) => setHudChapterText(label),
      onComplete: () => setShowSkip(false),
    });

    timelineRef.current.initScrollTrigger();

    // 5. Mouse tracking for parallax
    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      networkBgRef.current?.setMouse(normX, normY);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            networkBgRef.current?.resume();
          } else {
            networkBgRef.current?.pause();
          }
        });
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', handleCanvasResize);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      timelineRef.current?.destroy();
      networkBgRef.current?.destroy();
    };
  }, []);

  // Magnetic Button Hover
  const handleJoinMouseMove = useCallback((e) => {
    const btn = joinBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Magnetic shift up to 4px
    btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12 - 4}px)`;
  }, []);

  const handleJoinMouseLeave = useCallback(() => {
    const btn = joinBtnRef.current;
    if (btn) btn.style.transform = 'translate(0px, 0px)';
  }, []);

  // Join Button Click Sequence
  const handleJoinClick = useCallback(() => {
    // 1. Sound Sequence
    endingAudio.playJoinSuccessSequence();

    // 2. Ripple Expansion
    const maxDim = Math.max(window.innerWidth, window.innerHeight) * 0.75;
    setRippleSize(maxDim);
    setRippleActive(true);

    // 3. Particle emblem burst
    logoParticlesRef.current?.triggerBurst();

    // 4. Background network surge (opacity 0.2 -> 0.55 over 1s)
    networkBgRef.current?.triggerSurge(1.0);

    // 5. Retype status line in red as WELCOME TO THE NETWORK.
    if (statusTextRef.current) {
      statusTextRef.current.classList.add('status-success');
      timelineRef.current?.startTypewriter('WELCOME TO THE NETWORK.', statusTextRef.current);
    }

    // 6. Open existing modal after short cinematic beat
    setTimeout(() => {
      onOpenJoinModal?.();
      setRippleActive(false);
    }, 700);
  }, [onOpenJoinModal]);

  // Replay The Journey Click
  const handleReplayClick = useCallback(() => {
    // Smooth scroll to top over 2s
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 2.0 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Reset ending timeline so it replays when reached again
    setTimeout(() => {
      timelineRef.current?.reset();
      setShowSkip(true);
    }, 1200);
  }, []);

  // Sound Toggle Click
  const handleSoundToggle = useCallback(() => {
    const active = endingAudio.toggleSound();
    setSoundEnabled(active);
  }, []);

  // Skip Autoplay Click
  const handleSkipClick = useCallback(() => {
    timelineRef.current?.skip();
    setShowSkip(false);
  }, []);

  return (
    <div id="future" ref={containerRef} className="cinematic-ending-root" aria-label="Chapter 11: The Future">
      {/* Viewport Pinned Stage */}
      <div ref={stageRef} className="ending-viewport-stage">
        {/* Vignette & Grain Layer */}
        <div className="ending-vignette-overlay" aria-hidden="true" />

        {/* Ambient Drifting Network Canvas */}
        <canvas ref={networkCanvasRef} className="ending-network-canvas" aria-hidden="true" />

        {/* Scene A: Recap Spline Canvas */}
        <canvas ref={recapCanvasRef} className="ending-recap-canvas" aria-hidden="true" />

        {/* Scene B: Particle GWD Logo Canvas */}
        <canvas ref={particlesCanvasRef} className="ending-particles-canvas" aria-hidden="true" />

        {/* Persistent Telemetry HUD */}
        <div className="ending-hud-layer" aria-hidden="true">
          <span className="ending-hud-telemetry">GWD // ARCHIVE</span>
          <span className="ending-hud-chapter">{hudChapterText}</span>
        </div>

        {/* Sound Toggle Button (Bottom-Left) */}
        <button
          className={`ending-sound-toggle ${soundEnabled ? 'active' : ''}`}
          onClick={handleSoundToggle}
          aria-label={soundEnabled ? 'Disable Ending Audio' : 'Enable Ending Audio'}
          aria-pressed={soundEnabled}
        >
          <span className="sound-indicator-dot" />
          <span>SOUND: {soundEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Skip Button (Bottom-Right, during autoplay) */}
        {showSkip && (
          <button
            className="ending-skip-btn"
            onClick={handleSkipClick}
            aria-label="Skip recap and intro animations"
          >
            SKIP ⏩
          </button>
        )}

        {/* Scene A: Recap DOM Titles & Bottom Counter */}
        {hudChapterText === 'RECAP' && (
          <div className="ending-recap-dom-layer" aria-hidden="true">
            <h2 className="ending-recap-title">THE JOURNEY SO FAR</h2>
            <div className="ending-recap-counter">{recapCounterText}</div>
          </div>
        )}

        {/* Scene C: Main Content Typography Flow */}
        <div className="ending-main-content-flow">
          {/* Masked Headline Lines */}
          <div className="ending-masked-headline">
            <p ref={headline1Ref} className="headline-text-line">THE FUTURE.</p>
          </div>
          <div className="ending-masked-headline">
            <p ref={headline2Ref} className="headline-text-line">THE UNKNOWN AWAITS.</p>
          </div>
          <div className="ending-masked-headline">
            <p ref={headline3Ref} className="headline-text-line accent-red">THE STORY IS STILL BEING WRITTEN.</p>
          </div>

          {/* Big Title GWD CLUB with Chromatic Aberration & Glint Sweep */}
          <div ref={bigTitleContainerRef} className="ending-big-title-container">
            {/* Chromatic Ghost Layers */}
            <div ref={chromaticRedRef} className="chromatic-ghost red" aria-hidden="true">
              <span>GWD</span>
              <span>CLUB</span>
            </div>
            <div ref={chromaticCyanRef} className="chromatic-ghost cyan" aria-hidden="true">
              <span>GWD</span>
              <span>CLUB</span>
            </div>

            {/* Main Crisp Title */}
            <h1 className="ending-big-title">
              <span className="title-word-gwd">GWD</span>
              <span className="title-word-club">CLUB</span>
            </h1>

            {/* Glint Sweep Band */}
            <div className="title-glint-mask" aria-hidden="true">
              <div ref={glintSweepRef} className="glint-sweep-band" />
            </div>
          </div>

          {/* Sub-line: GET WORK DONE */}
          <p ref={subLineRef} className="ending-sub-manifesto">GET WORK DONE</p>

          {/* Interactive Buttons Group */}
          <div className="ending-buttons-group">
            {/* Join The Club Button */}
            <button
              ref={joinBtnRef}
              className="ending-primary-btn"
              onClick={handleJoinClick}
              onMouseEnter={() => endingAudio.playHoverChime()}
              onMouseMove={handleJoinMouseMove}
              onMouseLeave={handleJoinMouseLeave}
              data-cursor="button"
              aria-label="Open Join GWD Club Registration Form"
            >
              <span className="btn-diagonal-shine" aria-hidden="true" />
              <span>JOIN THE CLUB</span>
              <span aria-hidden="true">→</span>
            </button>

            {/* Replay The Journey Button */}
            <button
              ref={replayBtnRef}
              className="ending-secondary-btn"
              onClick={handleReplayClick}
              data-cursor="button"
              aria-label="Replay the journey from the beginning"
            >
              REPLAY THE JOURNEY
            </button>
          </div>

          {/* Telemetry Status Line */}
          <div className="ending-status-line">
            <span className="ending-status-dot" aria-hidden="true" />
            <span ref={statusTextRef} className="ending-status-text">
              END OF CURRENT ARCHIVE // HORIZON ACTIVE
            </span>
          </div>
        </div>

        {/* Join Click Radial Ripple Shockwaves */}
        {rippleActive && (
          <>
            <div
              className="ending-ripple-shockwave red-ring"
              style={{
                width: `${rippleSize}px`,
                height: `${rippleSize}px`,
                animation: 'rippleExpand 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
              aria-hidden="true"
            />
            <div
              className="ending-ripple-shockwave white-ring"
              style={{
                width: `${rippleSize * 0.9}px`,
                height: `${rippleSize * 0.9}px`,
                animation: 'rippleExpand 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.12s forwards',
              }}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {/* 7. STAY CONNECTED BLOCK (Natural Scroll Section Below Viewport) */}
      <section className="ending-stay-connected-section" aria-label="Stay Connected with GWD Club">
        <span className="connected-kicker-label">STAY CONNECTED</span>

        <h2 className="connected-main-heading">
          THE JOURNEY CONTINUES<br />
          BEYOND THIS SCREEN.
        </h2>

        <div className="connected-columns-grid">
          {/* INSTAGRAM */}
          <a
            href="https://www.instagram.com/gwdclub.vjit"
            target="_blank"
            rel="noopener noreferrer"
            className="connected-card-column"
            aria-label="Follow GWD Club on Instagram"
          >
            <div className="connected-icon-wrap" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <span className="connected-label-tag">INSTAGRAM</span>
            <span className="connected-value-tag">GWD CLUB VJIT</span>
            <span className="connected-card-underline" aria-hidden="true" />
          </a>

          {/* LINKEDIN */}
          <a
            href="https://www.linkedin.com/showcase/gwd-club-vjit/"
            target="_blank"
            rel="noopener noreferrer"
            className="connected-card-column"
            aria-label="Connect with GWD Club on LinkedIn"
          >
            <div className="connected-icon-wrap" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </div>
            <span className="connected-label-tag">LINKEDIN</span>
            <span className="connected-value-tag">GWD CLUB VJIT</span>
            <span className="connected-card-underline" aria-hidden="true" />
          </a>

          {/* EMAIL */}
          <a
            href="mailto:gwdclubvjit@gmail.com"
            className="connected-card-column"
            aria-label="Send email to GWD Club"
          >
            <div className="connected-icon-wrap" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <span className="connected-label-tag">EMAIL</span>
            <span className="connected-value-tag">gwdclubvjit@gmail.com</span>
            <span className="connected-card-underline" aria-hidden="true" />
          </a>
        </div>

        {/* Global Ending Footer Brand Tag */}
        <div className="connected-footer-brand">
          GWD CLUB — GET WORK DONE
        </div>
      </section>
    </div>
  );
}
