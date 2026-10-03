import React, { useState } from 'react';
import { EVENTS_DATA, LEADERSHIP } from '../data/gwdData';
import '../styles/journey.css';

export default function JourneyEventsProjectsSection() {
  const [activeEventIdx, setActiveEventIdx] = useState(0);
  const currentEvent = EVENTS_DATA[activeEventIdx];
  const eventLead = LEADERSHIP.find(l => l.id === currentEvent.leadId);

  return (
    <section id="journey-events-projects" className="journey-flow" aria-label="Chapter 08: Recovered Archive">
      {/* 09 — THE EVENTS (Recovered Archive) */}
      <div id="events" className="events-documentary-stage">
        <div className="section-container">
          <header className="events-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 08</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">RECOVERED ARCHIVES</span>
            </div>

            <div className="events-headline-split">
              <h2 className="events-title reveal-title">THE EVENTS<span className="title-accent-dot">.</span></h2>
              <div className="event-tabs" role="tablist" aria-label="Event archives">
                {EVENTS_DATA.map((evt, idx) => (
                  <button
                    key={evt.id}
                    onClick={() => setActiveEventIdx(idx)}
                    className={`event-tab-btn ${activeEventIdx === idx ? 'active' : ''}`}
                    role="tab"
                    aria-selected={activeEventIdx === idx}
                    data-cursor="button"
                  >
                    DOSSIER 0{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Recovered Archive Feature */}
          <article className="documentary-feature">
            {/* Cinematic Large Photo Frame */}
            <div className="documentary-visual-side">
              <div className="doc-photo-box" data-cursor="image" tabIndex={0} aria-label={`Event record: ${currentEvent.name}`}>
                <div className="doc-photo-corner tl" />
                <div className="doc-photo-corner br" />
                <div className="archive-stamp-overlay">RECOVERED // AUTHENTICATED</div>
                <span className="doc-photo-placeholder">{currentEvent.photoPlaceholder}</span>
                <span className="doc-ratio-tag">WIDE ARCHIVE STILL</span>
              </div>
            </div>

            {/* Archive Dossier Details */}
            <div className="documentary-narrative-side">
              <div className="doc-meta-strip">
                <span className="doc-date-tag">ARCHIVE DATE // {currentEvent.date}</span>
                <span className="doc-status-indicator">VERIFIED RECORD</span>
              </div>

              <h3 className="doc-event-title">{currentEvent.name}</h3>

              <div className="doc-description-block">
                <span className="block-label">01 / SYNOPSIS & CONTEXT</span>
                <p className="block-text">{currentEvent.description}</p>
              </div>

              <div className="doc-people-block">
                <span className="block-label">02 / LEAD COORDINATOR</span>
                {eventLead && (
                  <div className="doc-lead-badge">
                    <span className="lead-role">{eventLead.position}:</span>
                    <span className="lead-name">{eventLead.name}</span>
                  </div>
                )}
              </div>

              <div className="doc-outcome-block">
                <span className="block-label">03 / OUTCOME & COMMUNITY IMPACT</span>
                <p className="block-text accent-red">{currentEvent.outcome}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
