import React, { useState, useEffect, useRef } from 'react';
import { MEMORIES_DATA, ACHIEVEMENTS_DATA } from '../data/gwdData';
import MemoriesMasonryGallery from './MemoriesMasonryGallery';
import AchievementsWall from './AchievementsWall';
import JoinClubModal from './JoinClubModal';
import CinematicEnding from './CinematicEnding';
import '../styles/future.css';

function AchievementPhotoCarousel({ photos, title }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const total = photos?.length || 0;

  React.useEffect(() => {
    setPhotoIdx(0);
  }, [photos]);

  const handlePrev = () => {
    if (total <= 1) return;
    setPhotoIdx((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    if (total <= 1) return;
    setPhotoIdx((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 40) handleNext();
    else if (distance < -40) handlePrev();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const currentPhoto = photos && photos[photoIdx] ? photos[photoIdx] : null;

  return (
    <div
      className="achievement-carousel-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="achievement-photo-frame">
        <div className="achievement-photo-corner tl" />
        <div className="achievement-photo-corner br" />
        <div className="archive-stamp-overlay">VERIFIED EVIDENCE // ARCHIVE</div>

        {currentPhoto && (
          <img
            key={currentPhoto}
            src={currentPhoto}
            alt={`${title} - Photo ${photoIdx + 1}`}
            className="achievement-real-photo"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

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
          <span className="ach-carousel-counter">
            {String(photoIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
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
    </div>
  );
}

export default function MemoriesTodayFutureSection() {
  const [activeAchIdx, setActiveAchIdx] = useState(0);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const currentAchievement = ACHIEVEMENTS_DATA[activeAchIdx] || ACHIEVEMENTS_DATA[0];


  return (
    <section id="memories-today-future" className="future-flow" aria-label="Chapters 10, 11, 13: Memories, Achievements, and The Future">
      {/* 10 — THE MEMORIES (Balanced Masonry Photo Gallery) */}
      <div id="memories" className="memories-archive-stage">
        <div className="section-container">
          <header className="memories-header">
            <div className="chapter-eyebrow reveal-eyebrow">
              <span className="eyebrow-idx">CHAPTER 10</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">THE MEMORIES</span>
            </div>

            <h2 className="memories-title reveal-title">THE MEMORIES<span className="title-accent-dot">.</span></h2>
            <p className="memories-sub">An archive of moments from the GWD journey. Preserved in quiet space.</p>
          </header>

          {/* Balanced Masonry Gallery with Fullscreen Lightbox */}
          <MemoriesMasonryGallery memories={MEMORIES_DATA} />
        </div>
      </div>

      {/* THE ACHIEVEMENTS (Premium Digital Archive Dossiers + Achievements Wall) */}
      <div id="achievements" className="achievements-stage">
        <div className="section-container">
          <header className="achievements-header">
            <div className="chapter-eyebrow reveal-eyebrow">
              <span className="eyebrow-idx">VERIFIED EVIDENCE</span>
              <span className="eyebrow-divider">—</span>
              <span className="eyebrow-theme">COMPETITIVE DOSSIERS</span>
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
            <AchievementPhotoCarousel
              photos={currentAchievement.photos}
              title={currentAchievement.title}
            />

            <div className="achievement-narrative-side reveal-from-right">
              <div className="ach-meta-strip">
                <span className="ach-date-tag">ARCHIVE DATE // {currentAchievement.date}</span>
                <span className="ach-status-indicator">VERIFIED RECORD</span>
              </div>

              {currentAchievement.subtitle && (
                <div className="ach-subtitle-tag">{currentAchievement.subtitle}</div>
              )}
              <h3 className="ach-event-title">{currentAchievement.title}</h3>

              {currentAchievement.blocks?.map((block, bIdx) => (
                <div key={bIdx} className="ach-description-block">
                  <span className="ach-block-label">{block.label}</span>
                  <p className={`ach-block-text ${block.isAccent ? 'accent-red' : ''}`}>{block.text}</p>
                </div>
              ))}
            </div>
          </article>

          {/* Medal-Style Achievements Wall */}
          <AchievementsWall />
        </div>
      </div>

      {/* 11 — THE FUTURE (Cinematic Multi-Scene Ending Experience) */}
      <CinematicEnding onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      {/* Join the Club Modal Form */}
      <JoinClubModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </section>
  );
}
