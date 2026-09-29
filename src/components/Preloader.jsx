import React, { useEffect, useState } from 'react';
import './Preloader.css';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsFading(true), 300);
          setTimeout(() => onComplete(), 1100);
          return 100;
        }
        // Organic cinematic progression
        const increment = Math.floor(Math.random() * 8) + 3;
        return Math.min(prev + increment, 100);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`preloader-overlay ${isFading ? 'fade-out' : ''}`}>
      <div className="preloader-content">
        <div className="preloader-monogram">
          <div className="bracket bracket-tl" />
          <div className="monogram-text">GWD</div>
          <div className="bracket bracket-br" />
        </div>
        
        <div className="preloader-bar-wrap">
          <div className="preloader-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="preloader-meta">
          <span className="meta-label">INITIALIZING ARCHIVE</span>
          <span className="meta-val">{progress.toString().padStart(3, '0')}%</span>
        </div>
      </div>
    </div>
  );
}
