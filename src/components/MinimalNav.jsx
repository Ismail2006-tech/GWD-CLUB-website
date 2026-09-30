import React, { useState } from 'react';
import './MinimalNav.css';

export default function MinimalNav({ activeChapter, chapters, onSelectChapter }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const currentChapter = chapters.find(c => c.id === activeChapter) || chapters[0];
  const activeNum = parseInt(activeChapter, 10) || 0;
  const progressPercent = (activeNum / (chapters.length - 1)) * 100;

  return (
    <header className="minimal-hud-nav" aria-label="Experience HUD">
      {/* Top Left: Organization Telemetry */}
      <div className="hud-telemetry">
        <span className="hud-brand-tag">GWD // ARCHIVE</span>
        <button 
          className="hud-index-toggle" 
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="Toggle Chapter Index"
        >
          {drawerOpen ? "[CLOSE INDEX]" : "[CHAPTER INDEX]"}
        </button>
      </div>

      {/* Top Right: Minimal Persistent Chapter Progress Indicator */}
      <div className="hud-current-chapter" aria-live="polite">
        <span className="chapter-num">{currentChapter.id}</span>
        <span className="chapter-total">/ 14</span>
        <span className="chapter-dash">—</span>
        <span className="chapter-title">{currentChapter.title}</span>
      </div>

      {/* Minimal Top Progress Laser */}
      <div className="hud-top-progress-bar">
        <div 
          className="hud-progress-fill" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      {/* Left Edge: Vertical Cinematic Chapter Rail */}
      <nav className="hud-rail" aria-label="Chapter progress">
        <div className="rail-line">
          <div 
            className="rail-progress" 
            style={{ height: `${progressPercent}%` }} 
          />
        </div>
        <div className="rail-points">
          {chapters.map((chapter) => {
            const isActive = chapter.id === activeChapter;
            return (
              <button
                key={chapter.id}
                className={`rail-point ${isActive ? 'active' : ''}`}
                onClick={() => onSelectChapter(chapter.id)}
                title={`${chapter.id} — ${chapter.title}`}
                aria-label={`Jump to Chapter ${chapter.id}: ${chapter.title}`}
              >
                <span className="point-dot" />
                <span className="point-label">
                  <span className="point-idx">{chapter.id}</span>
                  <span className="point-name">{chapter.title}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Slide-out Full Chapter Index Drawer */}
      <div className={`chapter-index-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-inner">
          <div className="drawer-header">
            <span className="drawer-title">GWD CHRONOLOGY // CHAPTER INDEX</span>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
          </div>

          <div className="drawer-chapters-list">
            {chapters.map((ch) => (
              <button
                key={ch.id}
                className={`drawer-chapter-row ${ch.id === activeChapter ? 'active' : ''}`}
                onClick={() => {
                  onSelectChapter(ch.id);
                  setDrawerOpen(false);
                }}
              >
                <span className="row-num">{ch.id}</span>
                <div className="row-text">
                  <span className="row-title">{ch.title}</span>
                  <span className="row-sub">{ch.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
