/**
 * useTiltCard.js — 3D tilt effect for photo / video cards
 * ─────────────────────────────────────────────────────────
 * Reads from the single mouse engine. Apply to any card ref.
 *
 * Usage:
 *   const { cardRef, glowStyle } = useTiltCard();
 *   <div ref={cardRef} style={{ perspective: '1000px', ...glowStyle }}> ... </div>
 */

import { useRef, useState, useEffect } from 'react';
import { onMouse, TILT_MAX_DEG, TILT_PERSPECTIVE } from '../animations/mouse';

export default function useTiltCard() {
  const cardRef   = useRef(null);
  const innerRef  = useRef(null); // optional: ref to the inner element that actually rotates
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const card  = cardRef.current;
    const inner = innerRef.current ?? card;
    if (!card || prefersReducedMotion) return;

    card.style.perspective = `${TILT_PERSPECTIVE}px`;
    inner.style.willChange = 'transform';
    inner.style.transition = 'transform 0.15s ease-out';

    let hovered = false;

    const onEnter = () => { hovered = true; };
    const onLeave = () => {
      hovered = false;
      inner.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
      setGlowPos({ x: 50, y: 50 });
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);

    const unsub = onMouse(() => {
      if (!hovered) return;
      const rect = card.getBoundingClientRect();
      // Get actual mouse pixel from latest event (approximated via window store)
      const mx   = window.__mouseClientX ?? 0;
      const my   = window.__mouseClientY ?? 0;
      const nx   = ((mx - rect.left)  / rect.width)  * 2 - 1;
      const ny   = ((my - rect.top)   / rect.height) * 2 - 1;
      const rx   = Math.max(-TILT_MAX_DEG, Math.min(TILT_MAX_DEG, -ny * TILT_MAX_DEG));
      const ry   = Math.max(-TILT_MAX_DEG, Math.min(TILT_MAX_DEG,  nx * TILT_MAX_DEG));
      inner.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(4px)`;
      setGlowPos({ x: ((nx + 1) / 2) * 100, y: ((ny + 1) / 2) * 100 });
    });

    // Store raw mouse coords in a global for the tilt calculation
    const storeMouse = (e) => {
      window.__mouseClientX = e.clientX;
      window.__mouseClientY = e.clientY;
    };
    window.addEventListener('mousemove', storeMouse, { passive: true });

    return () => {
      unsub();
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousemove', storeMouse);
      inner.style.willChange = '';
    };
  }, [prefersReducedMotion]);

  /** Inline radial highlight style — apply to a pseudo-overlay div inside the card */
  const glowStyle = {
    background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.06) 0%, transparent 65%)`,
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 2,
    borderRadius: 'inherit',
    transition: 'background 0.12s ease',
  };

  return { cardRef, innerRef, glowStyle };
}
