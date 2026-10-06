import React, { useState, useEffect, useRef } from 'react';
import { EVENTS_DATA, JOURNEY_DATA, PROJECTS_DATA } from '../data/gwdData';
import { SHOW_PLACEHOLDER_SECTIONS } from '../data/config';
import InteractiveTimeline from './InteractiveTimeline';
import '../styles/journey.css';

function EventPhotoCarousel({ photos, title }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDeveloping, setIsDeveloping] = useState(false);
  const total = photos?.length || 0;

  useEffect(() => {
    setPhotoIdx(0);
  }, [photos]);

  const switchPhoto = (newIdx) => {
    setIsDeveloping(true);
    setPhotoIdx(newIdx);
    setTimeout(() => setIsDeveloping(false), 300);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (total <= 1) return;
    switchPhoto(photoIdx === 0 ? total - 1 : photoIdx - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (total <= 1) return;
    switchPhoto(photoIdx === total - 1 ? 0 : photoIdx + 1);
  };

  const minSwipeDistance = 45;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && total > 1) {
      switchPhoto(photoIdx === total - 1 ? 0 : photoIdx + 1);
    }
    if (distance < -minSwipeDistance && total > 1) {
      switchPhoto(photoIdx === 0 ? total - 1 : photoIdx - 1);
    }
  };

  const currentPhoto = photos && photos[photoIdx] ? photos[photoIdx] : null;

  return (
    <div className="documentary-visual-side reveal-from-left">
      <div
        className="doc-photo-box"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label={`Photo ${photoIdx + 1} of ${total} for ${title}`}
      >
        <div className="doc-photo-corner tl" />
        <div className="doc-photo-corner br" />
        <div className="archive-stamp-overlay">RECOVERED // AUTHENTICATED</div>

        {currentPhoto ? (
          <img
            key={currentPhoto}
            src={currentPhoto}
            alt={`${title} - Photo ${photoIdx + 1}`}
            className={`doc-real-photo ${isDeveloping ? 'photo-developing' : ''}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="doc-photo-placeholder">[EVENT PHOTO]</span>
        )}
      </div>

      {total > 0 && (
        <div className="doc-carousel-bar">
          <button
            className="doc-nav-arrow doc-nav-prev"
            onClick={handlePrev}
            aria-label="Previous photograph"
            disabled={total <= 1}
          >
            ← PREV
          </button>

          <div className="doc-counter-display">
            <span className="doc-counter-current">
              {String(photoIdx + 1).padStart(2, '0')}
            </span>
            <span className="doc-counter-sep">/</span>
            <span className="doc-counter-total">
              {String(total).padStart(2, '0')}
            </span>
          </div>

          <button
            className="doc-nav-arrow doc-nav-next"
            onClick={handleNext}
            aria-label="Next photograph"
            disabled={total <= 1}
          >
            NEXT →
          </button>
        </div>
      )}

      {total > 1 && (
        <div className="doc-carousel-dots" role="tablist" aria-label="Photo pagination">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`doc-dot ${i === photoIdx ? 'active' : ''}`}
              onClick={() => switchPhoto(i)}
              aria-label={`Jump to photo ${i + 1}`}
              aria-selected={i === photoIdx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function JourneyEventsProjectsSection() {
  const [activeEventIdx, setActiveEventIdx] = useState(0);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [timelineProgress, setTimelineProgress] = useState(0.2);

  const timelineRef = useRef(null);
  const currentEvent = EVENTS_DATA[activeEventIdx] || EVENTS_DATA[0];
  const currentProject = PROJECTS_DATA[activeProjectIdx] || PROJECTS_DATA[0];

  // Scroll listener for Chapter 09 travelling line
  useEffect(() => {
    const handleScroll = () => {
      const el = timelineRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const total = rect.height;
        const current = windowHeight * 0.7 - rect.top;
        const progress = Math.max(0, Math.min(1, current / total));
        setTimelineProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="journey-events-projects" className="journey-flow" aria-label="Chapters 08, 09, 11: Events, Journey, Projects">

      {/* ─────────────────────────────────────────────
         08 — THE EVENTS (Recovered Archive)
         ───────────────────────────────────────────── */}
      <div id="events" className="events-documentary-stage">
        <div className="section-container">
          <header className="events-header">
            <div className="chapter-eyebrow reveal-eyebrow">
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
                    {evt.dossierLabel || `DOSSIER 0${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <article className="documentary-feature">
            <EventPhotoCarousel
              photos={currentEvent.photos}
              title={currentEvent.name}
            />

            <div className="documentary-narrative-side reveal-from-right">
              <div className="doc-meta-strip">
                {currentEvent.date && (!currentEvent.date.includes('[ADD') || SHOW_PLACEHOLDER_SECTIONS) && (
                  <span className="doc-date-tag">ARCHIVE DATE // {currentEvent.date}</span>
                )}
                <span className="doc-status-indicator">VERIFIED RECORD</span>
              </div>

              {currentEvent.subtitle && (
                <div className="doc-kicker-tag">{currentEvent.subtitle}</div>
              )}

              <h3 className="doc-event-title">{currentEvent.name}</h3>

              {/* 01 / OVERVIEW */}
              {currentEvent.overview && (
                <div className="doc-description-block">
                  <span className="block-label">01 / OVERVIEW</span>
                  <p className="block-text">{currentEvent.overview}</p>
                </div>
              )}

              {/* 02 / KEY INFORMATION */}
              {currentEvent.keyMetrics && currentEvent.keyMetrics.length > 0 && (
                <div className="doc-description-block">
                  <span className="block-label">02 / KEY INFORMATION</span>
                  <div className="event-metrics-row">
                    {currentEvent.keyMetrics.map((metric, mIdx) => (
                      <span key={mIdx} className="event-metric-pill">{metric}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 02 / FOCUS (for Orientation Day) */}
              {currentEvent.focus && currentEvent.focus.length > 0 && (
                <div className="doc-description-block">
                  <span className="block-label">02 / FOCUS</span>
                  <div className="event-metrics-row">
                    {currentEvent.focus.map((fItem, fIdx) => (
                      <span key={fIdx} className="event-metric-pill">{fItem}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 03 / EVENT FORMAT & HOSTS */}
              {(currentEvent.format || currentEvent.hostedBy) && (
                <div className="doc-description-block">
                  <span className="block-label">03 / EVENT FORMAT & HOSTED BY</span>
                  <p className="block-text">
                    {currentEvent.format && <><span className="doc-sub-highlight">Format:</span> {currentEvent.format}<br /></>}
                    {currentEvent.hostedBy && <><span className="doc-sub-highlight">Hosted by:</span> {currentEvent.hostedBy}</>}
                  </p>
                </div>
              )}

              {/* 04 / ASSOCIATIONS */}
              {currentEvent.associations && currentEvent.associations.length > 0 && (
                <div className="doc-description-block">
                  <span className="block-label">04 / ASSOCIATIONS</span>
                  <ul className="doc-list-clean">
                    {currentEvent.associations.map((assoc, aIdx) => (
                      <li key={aIdx}>{assoc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 05 / BUILT WITH */}
              {currentEvent.builtWith && currentEvent.builtWith.length > 0 && (
                <div className="doc-description-block">
                  <span className="block-label">05 / BUILT WITH</span>
                  <div className="event-tech-tags">
                    {currentEvent.builtWith.map((tech, tIdx) => (
                      <span key={tIdx} className="event-tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 03 / MILESTONE (for Core Team event) */}
              {currentEvent.milestone && (
                <div className="doc-description-block">
                  <span className="block-label">03 / MILESTONE</span>
                  <p className="block-text doc-sub-highlight">{currentEvent.milestone}</p>
                  {currentEvent.milestoneDescription && (
                    <p className="block-text" style={{ marginTop: '8px' }}>{currentEvent.milestoneDescription}</p>
                  )}
                </div>
              )}

              {/* 04 / THEMES (for Core Team event) */}
              {currentEvent.themes && currentEvent.themes.length > 0 && (
                <div className="doc-description-block">
                  <span className="block-label">04 / THEMES</span>
                  <div className="event-metrics-row">
                    {currentEvent.themes.map((theme, tIdx) => (
                      <span key={tIdx} className="event-metric-pill">{theme}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 06 / CLOSING DIRECTIVE */}
              {currentEvent.closingQuote && (
                <div className="doc-outcome-block">
                  <span className="block-label">06 / CLOSING DIRECTIVE</span>
                  <p className="block-text accent-red quote-text" style={{ whiteSpace: 'pre-line' }}>{currentEvent.closingQuote}</p>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
         09 — THE JOURNEY (The Travelling Line Timeline)
         ───────────────────────────────────────────── */}
      <div id="journey" className="journey-timeline-stage" ref={timelineRef}>
        <div className="section-container">
          <header className="journey-header">
            <div className="chapter-eyebrow reveal-eyebrow">
              <span className="eyebrow-idx">CHAPTER 09</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE TRAVELLING LINE</span>
            </div>
            <h2 className="journey-title reveal-title">THE JOURNEY<span className="title-accent-dot">.</span></h2>
            <p className="journey-sub">
              A visible path through the growing story of GWD. From the first spark to competitive execution.
            </p>
          </header>

          {/* Interactive Milestone Timeline */}
          <InteractiveTimeline />

          <div className="vertical-timeline-track">
            {/* The Physical Red Travelling Line */}
            <div
              className="central-timeline-laser"
              style={{
                height: `${Math.max(10, Math.min(100, timelineProgress * 100))}%`,
                transition: 'height 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {JOURNEY_DATA.map((item, idx) => {
              const nodeThreshold = (idx + 0.5) / JOURNEY_DATA.length;
              const isPassed = timelineProgress >= nodeThreshold;
              const isSideLeft = idx % 2 === 0;

              return (
                <div
                  key={item.id}
                  className={`timeline-node-row ${isSideLeft ? 'left' : 'right'} ${isPassed ? 'node-reached' : ''}`}
                >
                  <div className={`node-marker ${isPassed ? 'active' : ''}`}>
                    <div className="node-glow-ring" />
                    <div className="node-inner-point" />
                  </div>

                  <div className="timeline-node-card reveal-stagger" data-stagger={idx}>
                    <div className="timeline-card-header">
                      <span className="timeline-phase-tag">{item.phase} // {item.code}</span>
                      <span className="timeline-period-badge">{item.period}</span>
                    </div>
                    <h3 className="timeline-card-title">{item.title}</h3>
                    <p className="timeline-card-desc">{item.summary}</p>
                    <span className="timeline-anchor-tag">{item.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
         11 — THE PROJECTS / WORK (Case Files)
         ───────────────────────────────────────────── */}
      <div id="projects" className="projects-story-stage">
        <div className="section-container">
          <header className="projects-header">
            <div className="chapter-eyebrow reveal-eyebrow">
              <span className="eyebrow-idx">CHAPTER 11</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">CASE FILES &amp; BUILDS</span>
            </div>

            <div className="events-headline-split">
              <h2 className="projects-title reveal-title">THE PROJECTS<span className="title-accent-dot">.</span></h2>
              <div className="event-tabs" role="tablist" aria-label="Project Case Files">
                {PROJECTS_DATA.map((proj, pIdx) => (
                  <button
                    key={proj.id}
                    onClick={() => setActiveProjectIdx(pIdx)}
                    className={`event-tab-btn ${activeProjectIdx === pIdx ? 'active' : ''}`}
                    role="tab"
                    aria-selected={activeProjectIdx === pIdx}
                    data-cursor="button"
                  >
                    {proj.caseLabel}
                  </button>
                ))}
              </div>
            </div>
            <p className="projects-sub">
              Verified project files executed by GWD squads. Problem → Idea → People → Build → Result.
            </p>
          </header>

          <article className="project-case-dossier">
            <div className="project-case-header">
              <span className="case-id-badge">{currentProject.caseLabel}</span>
              <h3 className="case-main-title">{currentProject.title}</h3>
              <span className="case-lead-tag">{currentProject.lead}</span>
            </div>

            <div className="case-progression-stream">
              {/* 01 // PROBLEM */}
              <div className="case-step-node reveal-stagger">
                <div className="case-node-pin">
                  <span className="pin-dot" />
                  <span className="pin-line" />
                </div>
                <div className="case-step-content">
                  <span className="step-label">01 // THE PROBLEM</span>
                  <p className="step-text">{currentProject.problem}</p>
                </div>
              </div>

              {/* 02 // IDEA */}
              <div className="case-step-node reveal-stagger">
                <div className="case-node-pin">
                  <span className="pin-dot" />
                  <span className="pin-line" />
                </div>
                <div className="case-step-content">
                  <span className="step-label">02 // THE IDEA</span>
                  <p className="step-text">{currentProject.idea}</p>
                </div>
              </div>

              {/* 03 // PEOPLE */}
              <div className="case-step-node reveal-stagger">
                <div className="case-node-pin">
                  <span className="pin-dot" />
                  <span className="pin-line" />
                </div>
                <div className="case-step-content">
                  <span className="step-label">03 // THE PEOPLE</span>
                  <p className="step-text">{currentProject.people}</p>
                </div>
              </div>

              {/* 04 // BUILD */}
              <div className="case-step-node reveal-stagger">
                <div className="case-node-pin">
                  <span className="pin-dot" />
                  <span className="pin-line" />
                </div>
                <div className="case-step-content">
                  <span className="step-label">04 // THE BUILD</span>
                  <p className="step-text">{currentProject.build}</p>
                </div>
              </div>

              {/* 05 // RESULT */}
              <div className="case-step-node result-step">
                <div className="case-node-pin">
                  <span className="pin-dot accent" />
                </div>
                <div className="case-step-content">
                  <span className="step-label accent">05 // THE RESULT</span>
                  <p className="step-text accent-red">{currentProject.result}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

    </section>
  );
}
