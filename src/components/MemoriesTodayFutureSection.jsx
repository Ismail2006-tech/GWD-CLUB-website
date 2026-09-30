import React, { useState } from 'react';
import { MEMORIES_DATA, ACHIEVEMENTS_DATA, LEADERSHIP } from '../data/gwdData';
import '../styles/future.css';

export default function MemoriesTodayFutureSection() {
  const [activeMemory, setActiveMemory] = useState(MEMORIES_DATA[0]);

  return (
    <section id="memories-today-future" className="future-flow" aria-label="Chapters 11, 12, 13, 14: Memories, Achievements, Today, and Future">
      {/* 11 — THE MEMORIES (Calm Visual Archive) */}
      <div id="memories" className="memories-archive-stage">
        <div className="section-container">
          <header className="memories-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 11</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE ATMOSPHERIC ARCHIVE</span>
            </div>

            <h2 className="memories-title reveal-title">THE MEMORIES<span className="title-accent-dot">.</span></h2>
            <p className="memories-sub">Fragments of time, emotion, and shared effort preserved in darkness.</p>
          </header>

          <div className="memories-viewport-space">
            {/* Memory Cluster */}
            <div className="memories-grid-cluster">
              {MEMORIES_DATA.map((mem) => {
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
                    aria-label={`Inspect memory: ${mem.event}`}
                    style={{ transform: `scale(${isSelected ? 1.04 : 1})` }}
                  >
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

            {/* Active Memory Spotlight Drawer */}
            <div className="active-memory-spotlight">
              <div className="spotlight-badge">INSPECTING ARCHIVE RECORD</div>
              <h3 className="spotlight-title">{activeMemory.event}</h3>
              <span className="spotlight-date">DATE // {activeMemory.date}</span>

              <div className="spotlight-caption-box">
                <span className="caption-tag">CAPTION:</span>
                <p className="caption-text">{activeMemory.caption}</p>
              </div>

              <div className="spotlight-photo-frame" data-cursor="image">
                <span className="spotlight-placeholder">{activeMemory.photoPlaceholder}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 12 — THE ACHIEVEMENTS (Verified Statistics Counters) */}
      <div id="achievements" className="achievements-stage">
        <div className="section-container">
          <header className="achievements-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 12</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">VERIFIED MILESTONES</span>
            </div>

            <h2 className="achievements-title reveal-title">THE ACHIEVEMENTS<span className="title-accent-dot">.</span></h2>
          </header>

          <div className="achievements-metrics-grid">
            {ACHIEVEMENTS_DATA.map((item, idx) => (
              <div key={idx} className="metric-monolith reveal-fade">
                <div className="metric-tick" />
                <span className="metric-number-placeholder">{item.placeholder}</span>
                <span className="metric-label">{item.label}</span>
                <span className="metric-subtext">AWAITING FORMAL AUDIT DATA</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 13 — GWD TODAY (The Present State) */}
      <div id="today" className="gwd-today-stage">
        <div className="section-container">
          <header className="today-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 13</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE PRESENT TENSE</span>
            </div>

            <h2 className="today-title reveal-title">GWD TODAY<span className="title-accent-dot">.</span></h2>
            <p className="today-sub">
              Active, disciplined, and unified. A snapshot of the current leadership cohort steering the club right now.
            </p>
          </header>

          {/* Current Leaders Unified Roster Grid */}
          <div className="current-cohort-grid">
            {LEADERSHIP.map((leader) => (
              <div
                key={leader.id}
                className="cohort-card reveal-fade"
                data-cursor="image"
                tabIndex={0}
                aria-label={`Cohort: ${leader.name}, ${leader.position}`}
              >
                <div className="cohort-photo-slot">
                  <span className="cohort-photo-tag">{leader.photoPlaceholder}</span>
                </div>
                <div className="cohort-info">
                  <span className="cohort-role">{leader.position}</span>
                  <h4 className="cohort-name">{leader.name}</h4>
                  <span className="cohort-status">ACTIVE CADRE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 14 — THE FUTURE (Mirrors The Void) */}
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
            <p className="future-step step-three">THE JOURNEY CONTINUES.</p>
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
