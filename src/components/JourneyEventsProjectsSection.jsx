import React, { useState } from 'react';
import { JOURNEY_TIMELINE, EVENTS_DATA, PROJECTS_DATA, LEADERSHIP } from '../data/gwdData';
import '../styles/journey.css';

export default function JourneyEventsProjectsSection() {
  const [activeEventIdx, setActiveEventIdx] = useState(0);
  const currentEvent = EVENTS_DATA[activeEventIdx];
  const eventLead = LEADERSHIP.find(l => l.id === currentEvent.leadId);

  return (
    <section id="journey-events-projects" className="journey-flow" aria-label="Chapters 09, 10, 11: Journey, Events, and Projects">
      {/* 09 — THE JOURNEY (Vertical Cinematic Timeline) */}
      <div id="journey" className="journey-timeline-stage">
        <div className="section-container">
          <header className="journey-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 09</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE TIMELINE OF MOMENTUM</span>
            </div>

            <h2 className="journey-title reveal-title">THE JOURNEY<span className="title-accent-dot">.</span></h2>
            <p className="journey-sub">From a bold premise to an enduring institution. Discover the milestones that forged GWD.</p>
          </header>

          <div className="vertical-timeline-track">
            <div className="central-timeline-laser" />

            {JOURNEY_TIMELINE.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={item.year} className={`timeline-node-row ${isEven ? 'left' : 'right'}`}>
                  <div className="node-marker">
                    <span className="marker-core" />
                    <span className="marker-ping" />
                  </div>

                  <div className="timeline-content-card reveal-fade">
                    <div className="timeline-meta-bar">
                      <span className="timeline-era-tag">{item.year}</span>
                      <span className="timeline-phase-tag">{item.tag}</span>
                    </div>

                    <h3 className="timeline-node-title">{item.title}</h3>
                    <p className="timeline-node-desc">{item.description}</p>

                    <div className="timeline-photo-slot" data-cursor="image" tabIndex={0} aria-label={`Timeline photo: ${item.photoPlaceholder}`}>
                      <span className="timeline-photo-label">{item.photoPlaceholder}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 10 — THE EVENTS (Mini Documentary Chronicles) */}
      <div id="events" className="events-documentary-stage">
        <div className="section-container">
          <header className="events-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 10</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">DOCUMENTARY CHRONICLES</span>
            </div>

            <div className="events-headline-split">
              <h2 className="events-title reveal-title">THE EVENTS<span className="title-accent-dot">.</span></h2>
              <div className="event-tabs" role="tablist" aria-label="Event chronicles">
                {EVENTS_DATA.map((evt, idx) => (
                  <button
                    key={evt.id}
                    onClick={() => setActiveEventIdx(idx)}
                    className={`event-tab-btn ${activeEventIdx === idx ? 'active' : ''}`}
                    role="tab"
                    aria-selected={activeEventIdx === idx}
                    data-cursor="button"
                  >
                    EVENT 0{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Documentary Showcase Viewport */}
          <article className="documentary-feature">
            {/* Cinematic Large Photo Frame */}
            <div className="documentary-visual-side">
              <div className="doc-photo-box" data-cursor="image" tabIndex={0} aria-label={`Event photograph: ${currentEvent.name}`}>
                <div className="doc-photo-corner tl" />
                <div className="doc-photo-corner br" />
                <span className="doc-photo-placeholder">{currentEvent.photoPlaceholder}</span>
                <span className="doc-ratio-tag">WIDE DOCUMENTARY STILL</span>
              </div>
            </div>

            {/* Documentary Details & Narrative */}
            <div className="documentary-narrative-side">
              <div className="doc-meta-strip">
                <span className="doc-date-tag">{currentEvent.date}</span>
                <span className="doc-status-indicator">CHRONICLED</span>
              </div>

              <h3 className="doc-event-title">{currentEvent.name}</h3>

              <div className="doc-description-block">
                <span className="block-label">SYNOPSIS & CONTEXT</span>
                <p className="block-text">{currentEvent.description}</p>
              </div>

              <div className="doc-people-block">
                <span className="block-label">COORDINATING LEADERSHIP</span>
                {eventLead && (
                  <div className="doc-lead-badge">
                    <span className="lead-role">{eventLead.position}:</span>
                    <span className="lead-name">{eventLead.name}</span>
                  </div>
                )}
              </div>

              <div className="doc-outcome-block">
                <span className="block-label">OUTCOME / IMPACT</span>
                <p className="block-text accent-red">{currentEvent.outcome}</p>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* 11 — THE PROJECTS (Treat Projects Like Stories) */}
      <div id="projects" className="projects-story-stage">
        <div className="section-container">
          <header className="projects-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 11</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">CRAFTED REALITIES</span>
            </div>

            <h2 className="projects-title reveal-title">THE PROJECTS<span className="title-accent-dot">.</span></h2>
            <p className="projects-sub">Every project started as a challenge. Here is how GWD built solutions.</p>
          </header>

          <div className="projects-story-grid">
            {PROJECTS_DATA.map((proj) => {
              const lead = LEADERSHIP.find(l => l.id === proj.leadId);
              return (
                <article key={proj.id} className="project-story-card">
                  <div className="proj-photo-frame" data-cursor="image" tabIndex={0} aria-label={`Project image: ${proj.title}`}>
                    <span className="proj-photo-tag">{proj.photoPlaceholder}</span>
                  </div>

                  <div className="proj-story-body">
                    <div className="proj-tag-row">
                      <span className="proj-id-badge">{proj.id.toUpperCase()}</span>
                      {lead && <span className="proj-lead-tag">LEAD: {lead.name}</span>}
                    </div>

                    <h3 className="proj-title">{proj.title}</h3>

                    <div className="proj-narrative-sections">
                      <div className="narrative-slot">
                        <span className="narrative-heading">WHY IT WAS CREATED</span>
                        <p className="narrative-text">{proj.whyCreated}</p>
                      </div>

                      <div className="narrative-slot">
                        <span className="narrative-heading">WHAT WAS CREATED</span>
                        <p className="narrative-text">{proj.whatCreated}</p>
                      </div>

                      <div className="narrative-slot">
                        <span className="narrative-heading">RESULT</span>
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
