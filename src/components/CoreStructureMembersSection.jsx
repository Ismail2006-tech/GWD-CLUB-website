import React, { useEffect, useRef, useCallback } from 'react';
import LivingSystemSection from './LivingSystemSection';
import '../styles/structure.css';

export default function CoreStructureMembersSection() {
  // Chapter 06 — Core Team Photo Cinematic Left + Right -> Center Reveal
  const coreTeamImgRef = useRef(null);
  const coreTeamFrameRef = useRef(null);
  const leftGlowRef = useRef(null);
  const rightGlowRef = useRef(null);
  const coreRevealRafRef = useRef(null);
  const coreRevealProgressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const coreRevealStartedRef = useRef(false);
  const coreRevealCompletedRef = useRef(false);

  // Cinematic Left + Right -> Center photo reveal
  const applyCoreRevealFrame = useCallback((progress) => {
    const img = coreTeamImgRef.current;
    const leftGlow = leftGlowRef.current;
    const rightGlow = rightGlowRef.current;
    if (!img) return;

    if (progress <= 0) {
      const mask = 'linear-gradient(to right, transparent 0%, transparent 100%)';
      img.style.webkitMaskImage = mask;
      img.style.maskImage = mask;
      img.style.opacity = '1';
      img.style.transform = 'scale(1.018)';
      if (leftGlow) leftGlow.style.opacity = '0';
      if (rightGlow) rightGlow.style.opacity = '0';
      return;
    }

    if (progress >= 0.985) {
      // Seamless complete reveal — zero split, zero seam
      const finalMask = 'linear-gradient(to right, black 0%, black 100%)';
      img.style.webkitMaskImage = finalMask;
      img.style.maskImage = finalMask;
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
      img.style.filter = 'brightness(1) contrast(1.05)';
      img.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      if (leftGlow) {
        leftGlow.style.opacity = '0';
        leftGlow.style.transition = 'opacity 0.4s ease';
      }
      if (rightGlow) {
        rightGlow.style.opacity = '0';
        rightGlow.style.transition = 'opacity 0.4s ease';
      }
      return;
    }

    // Eased progress (cubic smooth in-out)
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    // Reach moves from 0% at outer edges toward 51% in the center
    const reach = eased * 51;
    const feather = 8.5;

    const leftSolid = Math.max(0, reach - feather).toFixed(2);
    const leftFade = Math.min(50, reach + feather).toFixed(2);
    const rightFade = Math.max(50, 100 - (reach + feather)).toFixed(2);
    const rightSolid = Math.min(100, 100 - (reach - feather)).toFixed(2);

    // Left revealed -> feather -> dark center -> feather -> Right revealed
    const mask = `linear-gradient(to right, black 0%, black ${leftSolid}%, transparent ${leftFade}%, transparent ${rightFade}%, black ${rightSolid}%, black 100%)`;

    img.style.webkitMaskImage = mask;
    img.style.maskImage = mask;
    img.style.opacity = '1';

    // Cinematic camera push settle and lighting
    const scale = (1.018 - eased * 0.018).toFixed(4);
    const brightness = (0.90 + eased * 0.10).toFixed(3);
    const contrast = (1.07 - eased * 0.02).toFixed(3);
    img.style.transform = `scale(${scale})`;
    img.style.filter = `brightness(${brightness}) contrast(${contrast})`;

    // Subtle crimson scanning filaments at the leading edges
    const glowOpacity = Math.sin(progress * Math.PI) * 0.55;
    if (leftGlow) {
      leftGlow.style.opacity = glowOpacity.toFixed(2);
      leftGlow.style.left = `${Math.min(50, reach).toFixed(2)}%`;
    }
    if (rightGlow) {
      rightGlow.style.opacity = glowOpacity.toFixed(2);
      rightGlow.style.right = `${Math.min(50, reach).toFixed(2)}%`;
    }
  }, []);

  useEffect(() => {
    const frame = coreTeamFrameRef.current;
    const img = coreTeamImgRef.current;
    if (!frame || !img) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      coreRevealCompletedRef.current = true;
      applyCoreRevealFrame(1);
      return;
    }

    // Start completely hidden in darkness
    applyCoreRevealFrame(0);

    const updateScrollProgress = () => {
      if (coreRevealCompletedRef.current) return;
      const rect = frame.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      const startTrigger = windowHeight * 0.90;
      const endTrigger = windowHeight * 0.50;

      if (rect.top <= startTrigger) {
        const raw = (startTrigger - rect.top) / (startTrigger - endTrigger);
        const clamped = Math.max(0, Math.min(1, raw));
        if (clamped > targetProgressRef.current) {
          targetProgressRef.current = clamped;
        }
        if (!coreRevealStartedRef.current && clamped > 0.01) {
          coreRevealStartedRef.current = true;
        }
      }
    };

    const runLoop = () => {
      if (coreRevealCompletedRef.current) return;

      if (coreRevealStartedRef.current) {
        const diff = targetProgressRef.current - coreRevealProgressRef.current;
        const forwardStep = Math.max(diff * 0.14, 0.007);
        coreRevealProgressRef.current = Math.min(1, coreRevealProgressRef.current + forwardStep);

        applyCoreRevealFrame(coreRevealProgressRef.current);

        if (coreRevealProgressRef.current >= 0.985) {
          coreRevealProgressRef.current = 1;
          coreRevealCompletedRef.current = true;
          applyCoreRevealFrame(1);
          window.removeEventListener('scroll', updateScrollProgress);
          window.removeEventListener('resize', updateScrollProgress);
          return;
        }
      }

      coreRevealRafRef.current = requestAnimationFrame(runLoop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateScrollProgress();
            if (!coreRevealStartedRef.current) {
              coreRevealStartedRef.current = true;
              targetProgressRef.current = Math.max(targetProgressRef.current, 0.2);
            }
          }
        });
      },
      { threshold: [0, 0.1, 0.25, 0.5] }
    );

    observer.observe(frame);
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });

    updateScrollProgress();
    coreRevealRafRef.current = requestAnimationFrame(runLoop);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      if (coreRevealRafRef.current) cancelAnimationFrame(coreRevealRafRef.current);
    };
  }, [applyCoreRevealFrame]);

  return (
    <section id="structure-and-members" className="structure-flow" aria-label="Chapters 06 & 07: Core Team and The Living System">
      {/* 06 — THE CORE TEAM */}
      <div id="core-team" className="core-team-stage">
        <div className="section-container">
          <header className="core-team-header">
            <div className="chapter-eyebrow center reveal-eyebrow">
              <span className="eyebrow-idx">CHAPTER 06</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE COLLECTIVE FORCE</span>
            </div>

            <h2 className="core-team-statement reveal-title">
              ONE CLUB<span className="title-accent-dot">.</span>
              <br />
              MANY MINDS<span className="title-accent-dot">.</span>
            </h2>
          </header>

          {/* Chapter 06 — Core Team Cinematic Photo Reveal (Left + Right -> Center) */}
          <div
            ref={coreTeamFrameRef}
            className="core-team-group-frame"
            data-cursor="image"
            tabIndex={0}
            aria-label="GWD Core Team photograph"
          >
            <div className="group-photo-viewport">
              <img
                ref={coreTeamImgRef}
                src="/photos/core-team.png"
                alt="GWD Club Core Team — all 9 members"
                className="core-team-photo"
                loading="eager"
                decoding="async"
              />
              <div ref={leftGlowRef} className="reveal-light-bar left" aria-hidden="true" />
              <div ref={rightGlowRef} className="reveal-light-bar right" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* 07 — THE LIVING SYSTEM (How GWD Moves) */}
      <LivingSystemSection id="members" />
    </section>
  );
}
