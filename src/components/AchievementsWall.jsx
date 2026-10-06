import React from 'react';
import { ACHIEVEMENTS_DATA } from '../data/gwdData';
import '../styles/achievementsWall.css';

export default function AchievementsWall() {
  return (
    <div className="achievements-wall-grid" aria-label="Verified Achievements Showcase">
      {ACHIEVEMENTS_DATA.map((ach) => {
        const photo = ach.photos && ach.photos[0] ? ach.photos[0] : null;
        const overview = ach.blocks?.find((b) => b.label.includes('OVERVIEW'))?.text || '';
        const position = ach.blocks?.find((b) => b.label.includes('POSITION'))?.text || ach.subtitle;

        return (
          <article key={ach.id} className="achievement-medal-card">
            {/* Medal Badge */}
            <div className="medal-badge-wrapper">
              <div className="medal-badge-ribbon">
                <span className="medal-badge-icon">🎖</span>
                <span className="medal-badge-rank">{ach.subtitle}</span>
              </div>
              <div className="medal-shine-sweep" aria-hidden="true" />
            </div>

            {/* Photo */}
            {photo && (
              <div className="achievement-card-photo-frame">
                <img
                  src={photo}
                  alt={`${ach.title} achievement record`}
                  className="achievement-card-img"
                  loading="lazy"
                />
                <div className="photo-corner tl" />
                <div className="photo-corner br" />
              </div>
            )}

            {/* Content */}
            <div className="achievement-card-body">
              <div className="achievement-meta-strip">
                <span className="ach-date-tag">{ach.date}</span>
                <span className="ach-status-badge">VERIFIED</span>
              </div>
              <h3 className="achievement-card-title">{ach.title}</h3>
              <p className="achievement-card-overview">{overview}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
