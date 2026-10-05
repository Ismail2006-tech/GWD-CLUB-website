/**
 * MouseParallaxLayer.jsx
 * ──────────────────────
 * Wraps any content and shifts it with the mouse at the specified depth.
 * depth > 0  → shifts WITH the mouse (foreground feel)
 * depth < 0  → shifts AGAINST the mouse (background feel)
 *
 * Usage:
 *   <MouseParallaxLayer depth={20}>
 *     <img ... />
 *   </MouseParallaxLayer>
 */

import React, { useRef, useEffect } from 'react';
import { onMouse } from '../animations/mouse';

/** Check once at module level */
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function MouseParallaxLayer({
  children,
  depth = 10,
  className = '',
  style = {},
  as: Tag = 'div',
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    // Never apply parallax if reduced motion is preferred
    if (!el || prefersReducedMotion) return;

    el.style.willChange = 'transform';

    const unsub = onMouse((x, y) => {
      const tx = x * depth;
      const ty = y * depth;
      el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
    });

    return () => {
      unsub();
      el.style.willChange = '';
      el.style.transform   = '';
    };
  }, [depth]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
