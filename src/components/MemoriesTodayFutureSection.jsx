import React, { useState } from 'react';
import { MEMORIES_DATA, ACHIEVEMENTS_DATA } from '../data/gwdData';
import '../styles/future.css';

function MemoryPhoto({ memory, side }) {
  const itemRef = React.useRef(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        } else {
          if (entry.boundingClientRect.top > 0) setInView(false);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={itemRef}
      className={`memory-photo-cell side-${side} ${inView ? 'is-revealed' : ''}`}
    >
      <div className="memory-image-container">
        <img
          src={memory.photo}
          alt={memory.alt}
          className="memory-real-photo"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

function MemoryPairRow({ left, right }) {
  return (
    <div className="memory-pair-row">
      {left && <MemoryPhoto memory={left} side="left" />}
      {right && <MemoryPhoto memory={right} side="right" />}
    </div>
  );
}

function AchievementPhotoCarousel({ photos, title }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const total = photos?.length || 0;

  // Reset photo index when photos change
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

  // Touch handlers for mobile swipe
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
    if (isLeftSwipe) {
      if (total > 1) setPhotoIdx((prev) => (prev === total - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe) {
      if (total > 1) setPhotoIdx((prev) => (prev === 0 ? total - 1 : prev - 1));
    }
  };

  const currentPhoto = photos && photos[photoIdx] ? photos[photoIdx] : null;

  return (
    <div className="achievement-visual-side">
      <div
        className="achievement-photo-box"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label={`Photo ${photoIdx + 1} of ${total} for ${title}`}
      >
        <div className="doc-photo-corner tl" />
        <div className="doc-photo-corner br" />
        <div className="archive-stamp-overlay">AUTHENTICATED ARCHIVE // EVIDENCE</div>

        {currentPhoto ? (
          <img
            key={currentPhoto}
            src={currentPhoto}
            alt={`${title} - Photo ${photoIdx + 1}`}
            className="achievement-real-photo"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="achievement-photo-placeholder">
            <span>[ACHIEVEMENT PHOTOGRAPH]</span>
          </div>
        )}
      </div>

      {/* Photo Carousel Navigation Bar */}
      {total > 0 && (
        <div className="achievement-carousel-bar">
          <button
            className="ach-nav-arrow ach-nav-prev"
            onClick={handlePrev}
            aria-label="Previous photograph"
            disabled={total <= 1}
          >
            ← PREV
          </button>

          <div className="ach-counter-display">
            <span className="ach-counter-current">
              {String(photoIdx + 1).padStart(2, '0')}
            </span>
            <span className="ach-counter-sep">/</span>
            <span className="ach-counter-total">
              {String(total).padStart(2, '0')}
            </span>
          </div>

          <button
            className="ach-nav-arrow ach-nav-next"
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
        <div className="achievement-carousel-dots" role="tablist" aria-label="Photo pagination">
          {photos.map((_, i) => (
            <button
              key={i}
              className={`ach-dot ${i === photoIdx ? 'active' : ''}`}
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

export default function MemoriesTodayFutureSection() {
  const [activeAchIdx, setActiveAchIdx] = useState(0);
  const currentAchievement = ACHIEVEMENTS_DATA[activeAchIdx] || ACHIEVEMENTS_DATA[0];

  return (
    <section id="memories-today-future" className="future-flow" aria-label="Chapters 10, 11, 13: Memories, Achievements, and The Future">
      {/* 10 — THE MEMORIES (Cinematic Photo Archive) */}
      <div id="memories" className="memories-archive-stage">
        <div className="section-container">
          <header className="memories-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 10</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE MEMORIES</span>
            </div>

            <h2 className="memories-title reveal-title">THE MEMORIES<span className="title-accent-dot">.</span></h2>
            <p className="memories-sub">An archive of moments from the GWD journey. Preserved in quiet space.</p>
          </header>

          {/* Cinematic Paired Memory Sequence — two photos side by side per row */}
          <div className="memories-cinematic-stream">
            {Array.from({ length: Math.ceil(MEMORIES_DATA.length / 2) }, (_, i) => (
              <MemoryPairRow
                key={i}
                left={MEMORIES_DATA[i * 2]}
                right={MEMORIES_DATA[i * 2 + 1]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 11 — THE ACHIEVEMENTS (Premium Digital Archive Dossiers) */}
      <div id="achievements" className="achievements-stage">
        <div className="section-container">
          <header className="achievements-header">
            <div className="chapter-eyebrow">
              <span className="eyebrow-idx">CHAPTER 11</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">VERIFIED EVIDENCE & DOSSIERS</span>
            </div>

            <div className="achievements-headline-split">
              <h2 className="achievements-title reveal-title">THE ACHIEVEMENTS<span className="title-accent-dot">.</span></h2>
              <div className="achievement-tabs" role="tablist" aria-label="Achievement dossiers">
                {ACHIEVEMENTS_DATA.map((ach, idx) => (
                  <button
                    key={ach.id}
                    onClick={() => setActiveAchIdx(idx)}
                    className={`achievement-tab-btn ${activeAchIdx === idx ? 'active' : ''}`}
                    role="tab"
                    aria-selected={activeAchIdx === idx}
                    data-cursor="button"
                  >
                    {ach.dossierLabel || `DOSSIER 0${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Achievement Dossier Feature (Two-Column Layout) */}
          <article className="achievement-dossier-feature">
            {/* Left Side: Photo Archive with Multi-Photo Carousel */}
            <AchievementPhotoCarousel
              photos={currentAchievement.photos}
              title={currentAchievement.title}
            />

            {/* Right Side: Achievement Information Panel */}
            <div className="achievement-narrative-side">
              <div className="ach-meta-strip">
                <span className="ach-date-tag">ARCHIVE DATE // {currentAchievement.date}</span>
                <span className="ach-status-indicator">VERIFIED RECORD</span>
              </div>

              <h3 className="ach-event-title">{currentAchievement.title}</h3>

              <div className="ach-description-block">
                <span className="ach-block-label">01 / HISTORY & CONTEXT</span>
                <p className="ach-block-text">{currentAchievement.history}</p>
              </div>

              <div className="ach-description-block">
                <span className="ach-block-label">02 / ACHIEVEMENT</span>
                <p className="ach-block-text">{currentAchievement.result}</p>
              </div>

              <div className="ach-outcome-block">
                <span className="ach-block-label">03 / OUTCOME & IMPACT</span>
                <p className="ach-block-text accent-red">{currentAchievement.impact}</p>
              </div>
            </div>
          </article>
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

          {/* Social & Contact Information — Existing Final Ending */}
          <div className="final-connect-section">
            <span className="connect-kicker">STAY CONNECTED</span>

            <p className="connect-message">
              THE JOURNEY CONTINUES<br />
              BEYOND THIS SCREEN.
            </p>

            <div className="connect-links-group">
              <a
                href="https://www.instagram.com/gwdclub.vjit"
                target="_blank"
                rel="noopener noreferrer"
                className="connect-link-item"
                aria-label="Instagram: GWD CLUB VJIT"
              >
                <span className="connect-platform">INSTAGRAM</span>
                <span className="connect-handle">GWD CLUB VJIT</span>
              </a>

              <a
                href="https://www.linkedin.com/showcase/gwd-club-vjit/"
                target="_blank"
                rel="noopener noreferrer"
                className="connect-link-item"
                aria-label="LinkedIn: GWD CLUB VJIT"
              >
                <span className="connect-platform">LINKEDIN</span>
                <span className="connect-handle">GWD CLUB VJIT</span>
              </a>

              <a
                href="mailto:gwdclubvjit@gmail.com"
                className="connect-link-item"
                aria-label="Email: gwdclubvjit@gmail.com"
              >
                <span className="connect-platform">EMAIL</span>
                <span className="connect-handle">gwdclubvjit@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
