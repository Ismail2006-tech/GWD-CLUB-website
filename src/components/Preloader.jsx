import React, { useEffect, useState } from 'react';
import './Preloader.css';

// Preload priority hero assets so nothing pops in blurry
const PRIORITY_ASSETS = [
  '/gwd-logo.png',
  '/photos/aldrin-paul.webp',
  '/photos/mohd-ismail.webp',
  '/photos/core-team.png',
];

export default function Preloader({ onComplete }) {
  const [phase, setPhase] = useState('dot'); // 'dot' -> 'ring' -> 'expand' -> 'done'

  useEffect(() => {
    // 1. Kick off image preloading in background
    PRIORITY_ASSETS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // 2. Exact choreographed timing (Total: 1400ms <= 1.5s max)
    // 0ms - 400ms: Red dot emerges
    // 400ms - 950ms: Dot expands into Orbit Ring
    // 950ms - 1350ms: Ring expands outward to reveal hero
    // 1400ms: Complete
    const tRing = setTimeout(() => setPhase('ring'), 380);
    const tExpand = setTimeout(() => setPhase('expand'), 920);
    const tDone = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 1380);

    return () => {
      clearTimeout(tRing);
      clearTimeout(tExpand);
      clearTimeout(tDone);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`preloader-cinematic-stage ${phase === 'expand' ? 'stage-expand' : ''}`} aria-hidden="true">
      <div className="preloader-orbit-system">
        <div className={`preloader-dot ${phase !== 'dot' ? 'dot-into-ring' : ''}`} />
        <div className={`preloader-ring ${phase === 'ring' || phase === 'expand' ? 'ring-active' : ''}`} />
      </div>
      <div className={`preloader-label ${phase === 'expand' ? 'label-fade' : ''}`}>
        GWD // INITIALIZING ARCHIVE
      </div>
    </div>
  );
}
