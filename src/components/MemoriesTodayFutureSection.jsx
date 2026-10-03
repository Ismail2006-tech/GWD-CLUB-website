import React, { useState } from 'react';
import { MEMORIES_DATA, ACHIEVEMENTS_DATA } from '../data/gwdData';
import '../styles/future.css';

export default function MemoriesTodayFutureSection() {
  const [activeMemory, setActiveMemory] = useState(MEMORIES_DATA[0]);

  return (
    <section id="memories-today-future" className="future-flow" aria-label="Chapters 10, 11, 12, 13: Memories, Achievements, GWD Today, and The Future">
      {/* 10 — THE MEMORIES (Cinematic Photo Exhibition) */}
      <div id="memories" className="memories-archive-stage">
        <div className="section-container">
          <header className="memories-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 10</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">PHOTOGRAPHY EXHIBITION</span>
            </div>

            <h2 className="memories-title reveal-title">THE MEMORIES<span className="title-accent-dot">.</span></h2>
            <p className="memories-sub">An immersive photographic exhibition. Fragments of time, emotion, and shared effort preserved in darkness.</p>
          </header>

          <div className="memories-viewport-space">
            {/* Gallery Filmstrip Cluster */}
            <div className="memories-grid-cluster">
              {MEMORIES_DATA.map((mem, idx) => {
                const isSelected = activeMemory.id === mem.id;
                return (
                  <div
                    key={mem.id}
                    onClick={() => setActiveMemory(mem)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveMemory(mem);
                      }
                    }}
                    className={`memory-frame ${isSelected ? 'active' : ''}`}
                    data-cursor="image"
                    role="button"
                    tabIndex={0}
                    aria-label={`Exhibition plate: ${mem.event}`}
                    style={{ transform: `scale(${isSelected ? 1.04 : 1})` }}
                  >
                    <div className="exhibition-plate-num">FRAME 0{idx + 1}</div>
                    <div className="memory-photo-box">
                      <span className="mem-tag">{mem.photoPlaceholder}</span>
                    </div>
                    <div className="memory-quick-meta">
                      <span className="mem-event-name">{mem.event}</span>
                      <span className="mem-date">{mem.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Exhibition Spotlight Frame */}
            <div className="active-memory-spotlight">
              <div className="spotlight-badge">EXHIBITION SPOTLIGHT // ACTIVE PLATE</div>
              <h3 className="spotlight-title">{activeMemory.event}</h3>
              <span className="spotlight-date">ARCHIVE RECORD // {activeMemory.date}</span>

              <div className="spotlight-caption-box">
                <span className="caption-tag">EXHIBITION NOTES:</span>
                <p className="caption-text">{activeMemory.caption}</p>
              </div>

              <div className="spotlight-photo-frame" data-cursor="image">
                <div className="spotlight-beam-glow" />
                <span className="spotlight-placeholder">{activeMemory.photoPlaceholder}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 11 — THE ACHIEVEMENTS (Verified Evidence & Checkpoints) */}
      <div id="achievements" className="achievements-stage">
        <div className="section-container">
          <header className="achievements-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 11</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">VERIFIED EVIDENCE & CHECKPOINTS</span>
            </div>

            <h2 className="achievements-title reveal-title">THE ACHIEVEMENTS<span className="title-accent-dot">.</span></h2>
            <p className="achievements-sub">Every milestone backed by tangible execution and community footprint.</p>
          </header>

          <div className="achievements-metrics-grid">
            {ACHIEVEMENTS_DATA.map((item, idx) => (
              <div key={idx} className="metric-monolith evidence-card reveal-fade">
                <div className="evidence-header-row">
                  <span className="evidence-checkpoint-tag">CHECKPOINT 0{idx + 1}</span>
                  <span className="evidence-status-pill">AUTHENTICATED</span>
                </div>
                <div className="metric-tick" />
                <span className="metric-number-placeholder">{item.placeholder}</span>
                <span className="metric-label">{item.label}</span>
                <span className="metric-subtext">OFFICIAL CLUB EVIDENCE LOG</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 12 — GWD TODAY (Pure Reflection) */}
      <div id="today" className="gwd-today-stage">
        <div className="today-inner">

          {/* Chapter number — appears first */}
          <span className="today-chapter-label" aria-label="Chapter 12">CHAPTER 12</span>

          {/* Primary visual element: GWD TODAY */}
          <h2 className="today-main-title">
            GWD<br />TODAY
          </h2>

          {/* Three-line emotional thought */}
          <p className="today-reflection">
            Every chapter brought us here.<br />
            Every person added something to the story.<br />
            And the story is still being written.
          </p>
        </div>
      </div>

      {/* 13 — THE FUTURE (Minimal Void + Single Beacon) */}
      <div id="future" className="the-future-stage">
        <div className="future-abyss-aura" />
        <div className="future-red-beacon" />
        <div className="future-emerald-refraction" />

        <div className="future-core-message">
          {/* Logo slowly appears again */}
          <div className="future-logo-wrapper">
            <img
              src="/gwd-logo.png"
              alt="GWD Club Emblem"
              className="future-gwd-emblem"
            />
          </div>

          <div className="future-narrative-flow">
            <p className="future-step step-one">WHAT COMES NEXT?</p>
            <p className="future-step step-two">THE STORY ISN'T OVER.</p>
            <p className="future-step step-three">THE UNKNOWN AWAITS.</p>
          </div>

          <div className="future-final-brand">
            <h2 className="final-gwd-name">
              <span className="f-gwd">GWD</span>
              <span className="f-club">CLUB</span>
            </h2>
            <span className="final-manifesto-sub">GET WORK DONE</span>
          </div>

          <div className="terminal-silence-marker">
            <span className="silence-dot" />
            <span className="silence-code">END OF CURRENT ARCHIVE // HORIZON ACTIVE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
