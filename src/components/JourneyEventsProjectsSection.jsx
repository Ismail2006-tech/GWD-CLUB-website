import React, { useState } from 'react';
import { EVENTS_DATA } from '../data/gwdData';
import '../styles/journey.css';

function EventPhotoCarousel({ photos, title }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const total = photos?.length || 0;

  React.useEffect(() => {
    setPhotoIdx(0);
  }, [photos]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (total <= 1) return;
    setPhotoIdx((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (total <= 1) return;
    setPhotoIdx((prev) => (prev === total - 1 ? 0 : prev + 1));
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
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && total > 1) {
      setPhotoIdx((prev) => (prev === total - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe && total > 1) {
      setPhotoIdx((prev) => (prev === 0 ? total - 1 : prev - 1));
    }
  };

  const currentPhoto = photos && photos[photoIdx] ? photos[photoIdx] : null;

  return (
    <div className="documentary-visual-side">
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
            className="doc-real-photo"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="doc-photo-placeholder">[EVENT PHOTO]</span>
        )}
      </div>

      {/* Photo Carousel Navigation Bar */}
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

      {/* Pagination Dots */}
      {total > 1 && (
        <div className="doc-carousel-dots" role="tablist" aria-label="Photo pagination">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`doc-dot ${i === photoIdx ? 'active' : ''}`}
              onClick={() => setPhotoIdx(i)}
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
  const currentEvent = EVENTS_DATA[activeEventIdx] || EVENTS_DATA[0];

  return (
    <section id="journey-events-projects" className="journey-flow" aria-label="Chapter 08: Recovered Archive">
      {/* 08 — THE EVENTS (Recovered Archive) */}
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
                    {evt.dossierLabel || `DOSSIER 0${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Recovered Archive Feature */}
          <article className="documentary-feature">
            {/* Cinematic Large Photo Frame Carousel */}
            <EventPhotoCarousel
              photos={currentEvent.photos}
              title={currentEvent.name}
            />

            {/* Archive Dossier Details */}
            <div className="documentary-narrative-side">
              <div className="doc-meta-strip">
                <span className="doc-date-tag">ARCHIVE DATE // {currentEvent.date}</span>
                <span className="doc-status-indicator">VERIFIED RECORD</span>
              </div>

              {currentEvent.subtitle && (
                <div className="doc-kicker-tag">{currentEvent.subtitle}</div>
              )}

              <h3 className="doc-event-title">{currentEvent.name}</h3>

              {/* 01 / SHORT OVERVIEW */}
              <div className="doc-description-block">
                <span className="block-label">01 / SHORT OVERVIEW</span>
                <p className="block-text">{currentEvent.overview}</p>
              </div>

              {/* 02 / KEY INFORMATION */}
              <div className="doc-description-block">
                <span className="block-label">02 / KEY INFORMATION</span>
                <div className="event-metrics-row">
                  {currentEvent.keyMetrics?.map((metric, mIdx) => (
                    <span key={mIdx} className="event-metric-pill">{metric}</span>
                  ))}
                </div>
              </div>

              {/* 03 / EVENT FORMAT & HOSTS */}
              <div className="doc-description-block">
                <span className="block-label">03 / EVENT FORMAT & HOSTED BY</span>
                <p className="block-text">
                  <span className="doc-sub-highlight">Format:</span> {currentEvent.format}<br />
                  <span className="doc-sub-highlight">Hosted by:</span> {currentEvent.hostedBy}
                </p>
              </div>

              {/* 04 / ASSOCIATIONS */}
              <div className="doc-description-block">
                <span className="block-label">04 / ASSOCIATIONS</span>
                <ul className="doc-list-clean">
                  {currentEvent.associations?.map((assoc, aIdx) => (
                    <li key={aIdx}>{assoc}</li>
                  ))}
                </ul>
              </div>

              {/* 05 / BUILT WITH */}
              <div className="doc-description-block">
                <span className="block-label">05 / BUILT WITH</span>
                <div className="event-tech-tags">
                  {currentEvent.builtWith?.map((tech, tIdx) => (
                    <span key={tIdx} className="event-tech-tag">{tech}</span>
                  ))}
                </div>
              </div>

              {/* 06 / CLOSING DIRECTIVE */}
              {currentEvent.closingQuote && (
                <div className="doc-outcome-block">
                  <span className="block-label">06 / CLOSING DIRECTIVE</span>
                  <p className="block-text accent-red quote-text">{currentEvent.closingQuote}</p>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
