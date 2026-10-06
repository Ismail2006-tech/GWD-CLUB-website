import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GALLERY_CONFIG } from '../animations/gallery';
import '../styles/memoriesGallery.css';

export default function MemoriesMasonryGallery({ memories }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const containerRef = useRef(null);

  const total = memories.length;

  // Lightbox navigation
  const openLightbox = (idx) => setActivePhotoIdx(idx);
  const closeLightbox = () => setActivePhotoIdx(null);

  const handlePrev = useCallback(() => {
    setActivePhotoIdx((prev) => (prev === null ? null : (prev - 1 + total) % total));
  }, [total]);

  const handleNext = useCallback(() => {
    setActivePhotoIdx((prev) => (prev === null ? null : (prev + 1) % total));
  }, [total]);

  // Keyboard navigation (ESC, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (activePhotoIdx === null) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePhotoIdx, handlePrev, handleNext]);

  // Touch swipe support for Lightbox
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrev();
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="memories-masonry-wrapper" ref={containerRef}>
      <div className="memories-masonry-grid">
        {memories.map((mem, idx) => (
          <MemoryMasonryCard
            key={mem.id || idx}
            memory={mem}
            index={idx}
            onOpen={() => openLightbox(idx)}
          />
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activePhotoIdx !== null && (
        <div
          className="memories-lightbox-backdrop"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo Lightbox"
        >
          <div
            className="memories-lightbox-dialog"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Toolbar */}
            <div className="lightbox-toolbar">
              <span className="lightbox-index">
                MEMORIES // {String(activePhotoIdx + 1).padStart(2, '0')} OF {String(total).padStart(2, '0')}
              </span>
              <button
                className="lightbox-close-btn"
                onClick={closeLightbox}
                aria-label="Close Lightbox (ESC)"
              >
                ✕
              </button>
            </div>

            {/* Main Stage */}
            <div className="lightbox-stage">
              <button
                className="lightbox-arrow prev"
                onClick={handlePrev}
                aria-label="Previous image"
              >
                ‹
              </button>

              <div className="lightbox-img-wrapper">
                <img
                  src={memories[activePhotoIdx].photo}
                  alt={memories[activePhotoIdx].alt || `GWD Archive Photo ${activePhotoIdx + 1}`}
                  className="lightbox-main-img"
                />
              </div>

              <button
                className="lightbox-arrow next"
                onClick={handleNext}
                aria-label="Next image"
              >
                ›
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="lightbox-footer">
              <p className="lightbox-caption">
                {memories[activePhotoIdx].label} — {memories[activePhotoIdx].sub}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MemoryMasonryCard({ memory, index, onOpen }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    // Only apply on non-touch devices
    if (window.matchMedia('(hover: none)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -y * GALLERY_CONFIG.mouseTiltMaxDeg,
      ry: x * GALLERY_CONFIG.mouseTiltMaxDeg,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const delayMs = (index % 3) * 80;

  return (
    <article
      ref={cardRef}
      className={`memory-masonry-item ${inView ? 'in-view' : ''}`}
      style={{
        transitionDelay: `${delayMs}ms`,
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onOpen}
      tabIndex={0}
      role="button"
      aria-label={`View photo ${memory.label || index + 1} in lightbox`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="memory-card-inner">
        <div className="memory-img-frame">
          <img
            src={memory.photo}
            alt={memory.alt || memory.label || `GWD Memory ${index + 1}`}
            className={`memory-masonry-img ${isLoaded ? 'is-crisp' : 'is-blur'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
          />
          <div className="memory-card-overlay">
            <span className="overlay-badge">{memory.label || `0${index + 1}`}</span>
            <span className="overlay-sub">{memory.sub || 'GWD ARCHIVE'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
