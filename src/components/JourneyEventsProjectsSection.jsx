import React, { useState } from 'react';
import { EVENTS_DATA, PROJECTS_DATA, LEADERSHIP } from '../data/gwdData';
import '../styles/journey.css';

export default function JourneyEventsProjectsSection() {
  const [activeEventIdx, setActiveEventIdx] = useState(0);
  const currentEvent = EVENTS_DATA[activeEventIdx];
  const eventLead = LEADERSHIP.find(l => l.id === currentEvent.leadId);

  return (
    <section id="journey-events-projects" className="journey-flow" aria-label="Chapters 09, 10: Recovered Archive and Case Files">
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

      {/* 10 — THE PROJECTS (Case Files: Problem → Idea → People → Build → Result) */}
      <div id="projects" className="projects-story-stage">
        <div className="section-container">
          <header className="projects-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 09</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">CASE FILES</span>
            </div>

            <h2 className="projects-title reveal-title">THE PROJECTS<span className="title-accent-dot">.</span></h2>
            <p className="projects-sub">Every project started as a challenge. Here is the exact case file of how GWD built solutions.</p>
          </header>

          <div className="projects-story-grid">
            {PROJECTS_DATA.map((proj) => {
              const lead = LEADERSHIP.find(l => l.id === proj.leadId);
              return (
                <article key={proj.id} className="project-story-card case-file-card">
                  <div className="proj-photo-frame" data-cursor="image" tabIndex={0} aria-label={`Project image: ${proj.title}`}>
                    <div className="case-file-badge">CASE FILE // {proj.id.toUpperCase()}</div>
                    <span className="proj-photo-tag">{proj.photoPlaceholder}</span>
                  </div>

                  <div className="proj-story-body">
                    <div className="proj-tag-row">
                      <span className="proj-id-badge">PROJECT ARCHIVE</span>
                      {lead && <span className="proj-lead-tag">LEAD: {lead.name}</span>}
                    </div>

                    <h3 className="proj-title">{proj.title}</h3>

                    <div className="proj-narrative-sections">
                      <div className="narrative-slot">
                        <span className="narrative-heading">01 / THE PROBLEM</span>
                        <p className="narrative-text">{proj.whyCreated}</p>
                      </div>

                      <div className="narrative-slot">
                        <span className="narrative-heading">02 / THE IDEA & APPROACH</span>
                        <p className="narrative-text">{proj.whyCreated}</p>
                      </div>

                      <div className="narrative-slot">
                        <span className="narrative-heading">03 / THE PEOPLE INVOLVED</span>
                        <p className="narrative-text">{lead ? `${lead.name} (${lead.position})` : '[ADD CONTRIBUTORS]'}</p>
                      </div>

                      <div className="narrative-slot">
                        <span className="narrative-heading">04 / THE BUILD</span>
                        <p className="narrative-text">{proj.whatCreated}</p>
                      </div>

                      <div className="narrative-slot">
                        <span className="narrative-heading">05 / THE RESULT</span>
                        <p className="narrative-text highlight">{proj.result}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
