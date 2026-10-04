import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const [enabled] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
  const [visible, setVisible] = useState(false);
  const [cursorType, setCursorType] = useState('default'); // 'default' | 'pointer' | 'button' | 'image'
  const [cursorText, setCursorText] = useState('');

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    // Global event delegation for interactive element inspection
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      // Master Prompt §30 Cursor States:
      // PERSON → TRACE
      const personEl = target.closest('.leader-monolith-card, .constellation-node, .tm-member-pill, .emergence-stage');
      if (personEl) {
        setCursorType('image');
        setCursorText('TRACE');
        return;
      }

      // PROJECT → OPEN
      const projectEl = target.closest('.project-case-dossier, .projects-story-stage');
      if (projectEl) {
        setCursorType('button');
        setCursorText('OPEN');
        return;
      }

      // CHAPTER → ENTER
      const chapterEl = target.closest('.rail-point, .drawer-chapter-row, .hud-index-toggle, .stage-pill');
      if (chapterEl) {
        setCursorType('button');
        setCursorText('ENTER');
        return;
      }

      // EVENT → ENTER
      const eventEl = target.closest('.events-documentary-stage, .event-tab-btn');
      if (eventEl) {
        setCursorType('button');
        setCursorText('ENTER');
        return;
      }

      // PHOTO → VIEW
      const imageEl = target.closest(
        '[data-cursor="image"], .doc-photo-box, .memory-image-container, .achievement-photo-box, .core-team-group-frame, .tm-photo-frame'
      );
      if (imageEl) {
        setCursorType('image');
        setCursorText('VIEW');
        return;
      }

      // Buttons and CTA triggers
      const buttonEl = target.closest(
        'button, [role="button"], [role="tab"], .void-scroll-invitation, .audio-atmosphere-hud, .control-nav-btn'
      );
      if (buttonEl) {
        setCursorType('button');
        setCursorText('');
        return;
      }

      // Links and clickable text
      const linkEl = target.closest('a, [data-cursor="pointer"]');
      if (linkEl) {
        setCursorType('pointer');
        setCursorText('');
        return;
      }

      // Default state
      setCursorType('default');
      setCursorText('');
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth physics loop for ring following dot
    const render = () => {
      const { x: targetX, y: targetY } = mousePos.current;

      // Dot moves instantly for zero perceived input latency
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      // Ring follows with responsive lerp
      ringPos.current.x += (targetX - ringPos.current.x) * 0.22;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.22;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [enabled, visible]);

  if (!enabled) return null;

  return (
    <div
      className={`custom-cursor-root state-${cursorType} ${visible ? 'is-visible' : 'is-hidden'}`}
      aria-hidden="true"
    >
      {/* Central small red point */}
      <div ref={dotRef} className="cursor-dot" />

      {/* Trailing subtle circular ring */}
      <div ref={ringRef} className="cursor-ring">
        {cursorType === 'image' && (
          <span className="cursor-badge-text">{cursorText}</span>
        )}
      </div>
    </div>
  );
}
