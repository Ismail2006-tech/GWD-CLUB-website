import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LEADERSHIP, VOICES_OF_GWD } from '../data/gwdData';
import '../styles/leaders.css';

export default function PeopleLeadersSection() {
  const [activeLeaderIdx, setActiveLeaderIdx] = useState(0);
  const [devStage, setDevStage] = useState(3); // 0 = identifying, 1 = developing photo, 2 = reveal name, 3 = reveal role
  const timersRef = useRef([]);

  const currentLeader = LEADERSHIP[activeLeaderIdx];

  const triggerDevelopmentSequence = useCallback((newIdx) => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    setActiveLeaderIdx(newIdx);
    setDevStage(0); // Identifying / dark blur

    const t1 = setTimeout(() => {
      setDevStage(1); // Photo emerges
    }, 280);

    const t2 = setTimeout(() => {
      setDevStage(2); // Name reveals
    }, 600);

    const t3 = setTimeout(() => {
      setDevStage(3); // Role reveals
    }, 850);

    timersRef.current = [t1, t2, t3];
  }, []);

  // Eagerly pre-cache all leadership photos immediately on mount
  useEffect(() => {
    LEADERSHIP.forEach((leader) => {
      if (leader.photoUrl) {
        const img = new Image();
        img.src = leader.photoUrl;
      }
    });
    return () => timersRef.current.forEach(t => clearTimeout(t));
  }, []);

  const nextLeader = () => {
    const nextIdx = (activeLeaderIdx + 1) % LEADERSHIP.length;
    triggerDevelopmentSequence(nextIdx);
  };

  const prevLeader = () => {
    const prevIdx = (activeLeaderIdx - 1 + LEADERSHIP.length) % LEADERSHIP.length;
    triggerDevelopmentSequence(prevIdx);
  };

  const selectLeader = (idx) => {
    if (idx === activeLeaderIdx) return;
    triggerDevelopmentSequence(idx);
  };

  return (
    <section id="people-and-leaders" className="people-leaders-flow" aria-label="Chapters 03, 04, 05: People and Leaders">
      {/* 03 — THE PEOPLE (The Transitional Manifesto) */}
      <div id="people" className="people-manifesto-stage">
        <div className="people-backdrop-gradient" />
        <div className="people-manifesto-container">
          <div className="chapter-eyebrow center">
            <span className="eyebrow-idx">CHAPTER 03</span>
            <span className="eyebrow-divider">—</span>
            <span className="eyebrow-theme">THE HUMAN FACTOR</span>
          </div>

          <h2 className="people-statement-massive reveal-title">
            A CLUB IS NOT BUILT BY A LOGO<span className="statement-dot">.</span>
            <br />
            <span className="statement-highlight">IT IS BUILT BY PEOPLE.</span>
          </h2>
          <div className="statement-line" />
        </div>
      </div>

      {/* 04 — THE LEADERS (Cinematic Individual Composition Reveals) */}
      <div id="leaders" className="leaders-cinematic-stage">
        <div className="section-container">
          <header className="leaders-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 04</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE ARCHITECTS OF EXECUTION</span>
            </div>

            <div className="leaders-headline-row">
              <h2 className="leaders-huge-title reveal-title">THE LEADERS<span className="title-accent-dot">.</span></h2>
              <div className="leader-indexer">
                <span className="current-idx">{(activeLeaderIdx + 1).toString().padStart(2, '0')}</span>
                <span className="total-idx">/ {LEADERSHIP.length.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </header>

          {/* Large Visual Composition Stage for Single Leader Reveal */}
          <div className="leader-monolith-card">
            <div className="leader-card-glow" />

            {/* Left/Main: Exact Photo Placeholder with Strict Label */}
            <div className="leader-photo-frame" data-cursor="image" tabIndex={0} aria-label={`Portrait of ${currentLeader.name}`}>
              <div className="frame-corner c-tl" />
              <div className="frame-corner c-tr" />
              <div className="frame-corner c-bl" />
              <div className="frame-corner c-br" />

              {/* Development status overlay */}
              {devStage === 0 && (
                <div className="photo-identifying-overlay" aria-live="polite">
                  <div className="identifying-scan-beam" />
                  <span className="identifying-tag-text">IDENTIFYING ARCHIVE...</span>
                </div>
              )}

              <div className="leader-photo-viewport">
                {LEADERSHIP.map((leader, idx) => {
                  if (!leader.photoUrl) return null;
                  const isActive = activeLeaderIdx === idx;
                  const isDeveloping = isActive && devStage < 1;
                  return (
                    <img
                      key={leader.id}
                      src={leader.photoUrl}
                      alt={leader.name}
                      className={`leader-actual-img ${isActive ? 'is-active' : 'is-hidden'} ${isDeveloping ? 'is-developing' : ''}`}
                      loading="eager"
                      decoding="async"
                    />
                  );
                })}

                {!currentLeader.photoUrl && (
                  <div className="photo-placeholder-box">
                    <div className="placeholder-scanline" />
                    <div className="placeholder-icon">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="strict-photo-label">{currentLeader.photoPlaceholder}</span>
                    <span className="photo-ratio-hint">PORTRAIT SPECIFICATION // 3:4</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right/Info: Strictly Position, Full Name, and Controls */}
            <div className="leader-identity-info">
              <div className={`leader-position-tag ${devStage >= 3 ? 'revealed' : 'concealed'}`}>
                <span className="tag-pulse" />
                <span className="tag-text">{currentLeader.position}</span>
              </div>

              <h3 className={`leader-fullname ${devStage >= 2 ? 'revealed' : 'concealed'}`}>
                {currentLeader.name}
              </h3>

              <div className="identity-separator-line" />

              {/* Minimalist Switcher Controls */}
              <div className="leader-controls">
                <button
                  onClick={prevLeader}
                  className="control-nav-btn prev"
                  aria-label="Previous Leader"
                  title="Previous Leader"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span className="btn-label">PREV</span>
                </button>

                <div className="leader-nav-pills">
                  {LEADERSHIP.map((leader, idx) => (
                    <button
                      key={leader.id}
                      onClick={() => selectLeader(idx)}
                      className={`pill-dot ${activeLeaderIdx === idx ? 'active' : ''}`}
                      title={`${leader.position}: ${leader.name}`}
                      aria-label={`View ${leader.name}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextLeader}
                  className="control-nav-btn next"
                  aria-label="Next Leader"
                  title="Next Leader"
                >
                  <span className="btn-label">NEXT</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Leadership Directory Roster (Quick Tap) */}
              <div className="leader-quick-roster">
                {LEADERSHIP.map((lead, idx) => (
                  <button
                    key={lead.id}
                    onClick={() => setActiveLeaderIdx(idx)}
                    className={`roster-item ${activeLeaderIdx === idx ? 'active' : ''}`}
                  >
                    <span className="roster-role">{lead.position}</span>
                    <span className="roster-name">{lead.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 05 — VOICES OF GWD (Recurring Storytelling Element) */}
      <div id="voices" className="voices-section">
        <div className="section-container">
          <header className="voices-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 05</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">AUTHENTIC ECHOES</span>
            </div>
            <h2 className="voices-title reveal-title">VOICES OF GWD CLUB<span className="title-accent-dot">.</span></h2>
          </header>

          <div className="voices-grid">
            {VOICES_OF_GWD.map((v, i) => (
              <div key={i} className="voice-card">
                <div className="voice-indicator-pip" />
                <div className="voice-strict-text">{v.quote}</div>
                <div className="voice-attribution">
                  <span className="voice-author">{v.author}</span>
                  <span className="voice-sep">—</span>
                  <span className="voice-pos">{v.position}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
