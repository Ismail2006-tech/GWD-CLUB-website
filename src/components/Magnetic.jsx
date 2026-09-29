import React, { useRef, useEffect } from 'react';

/**
 * Magnetic button wrapper for major interactive CTAs.
 * Subtly attracts the element toward the cursor on hover.
 * Automatically disabled on touch / mobile devices and when reduced motion is preferred.
 */
export default function Magnetic({ children, strength = 0.25, max = 8, className = '', ...props }) {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Guard: Only enable on desktop with fine pointer
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasFinePointer || prefersReducedMotion) return;

    let rafId = null;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = (e.clientX - centerX) * strength;
      let dy = (e.clientY - centerY) * strength;

      // Restrain to max bounds
      dx = Math.max(-max, Math.min(max, dx));
      dy = Math.max(-max, Math.min(max, dy));

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        el.style.transition = 'transform 0.1s cubic-bezier(0.2, 0.8, 0.4, 1)';
      });
    };

    const handleMouseLeave = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = 'translate3d(0, 0, 0)';
        el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [strength, max]);

  return (
    <div
      ref={elementRef}
      className={`magnetic-interaction-wrap ${className}`}
      style={{ display: 'inline-block' }}
      {...props}
    >
      {children}
    </div>
  );
}
