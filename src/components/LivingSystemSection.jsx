import React, { useState, useRef, useEffect } from 'react';
import { TEAM_BRANCHES } from '../data/teamBranchesData';
import '../styles/livingSystem.css';

/**
 * Chapter 07 — TEAM MEMBERS
 * 5 official domain branches with cinematic team photos and mission scope.
 */

export default function LivingSystemSection({ id = "members" }) {
  const [activeBranchId, setActiveBranchId] = useState('management');
  const [photoRevealed, setPhotoRevealed] = useState(false);
  const photoRef = useRef(null);

  const currentBranch = TEAM_BRANCHES.find(b => b.id === activeBranchId) || TEAM_BRANCHES[0];

  // Reset photo reveal on branch switch, then trigger reveal
  useEffect(() => {
    setPhotoRevealed(false);
    if (!currentBranch.photoUrl) return;
    const t = setTimeout(() => setPhotoRevealed(true), 120);
    return () => clearTimeout(t);
  }, [activeBranchId, currentBranch.photoUrl]);

  const handleSelectBranch = (branchId) => {
    if (branchId === activeBranchId) return;
    setActiveBranchId(branchId);
  };

  return (
    <section
      id={id}
      className="team-members-stage"
      aria-label="Chapter 07: Team Members"
    >
      <div className="tm-ambient-grid" aria-hidden="true" />

      <div className="tm-container">
        {/* ── Chapter Header ── */}
        <header className="tm-header">
          <div className="chapter-eyebrow">
            <span className="eyebrow-idx">CHAPTER 07</span>
            <span className="eyebrow-divider">—</span>
            <span className="eyebrow-theme">TEAM MEMBERS</span>
          </div>
          <h2 className="tm-main-title reveal-title">
            TEAM MEMBERS<span className="title-accent-dot">.</span>
          </h2>
          <p className="tm-main-subtitle">
            THE COLLECTIVE FORCE ACROSS FIVE CORE DOMAINS.
          </p>
        </header>

        {/* ── Branch Selector (BRANCH 01 → 05 left-to-right) ── */}
        <nav className="tm-branches-nav" aria-label="Team Branches" role="tablist">
          {TEAM_BRANCHES.map((branch) => {
            const isActive = branch.id === activeBranchId;
            return (
              <button
                key={branch.id}
                className={`tm-branch-tab ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectBranch(branch.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${branch.id}`}
                id={`tab-${branch.id}`}
              >
                <span className="tm-tab-code">{branch.code}</span>
                <span className="tm-tab-name">{branch.name}</span>
                <span className="tm-tab-status">{branch.status}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Branch Detail Panel ── */}
        <div
          key={activeBranchId}
          className="tm-branch-panel"
          role="tabpanel"
          id={`panel-${currentBranch.id}`}
          aria-labelledby={`tab-${currentBranch.id}`}
        >
          {/* Panel header: code + title + category */}
          <div className="tm-panel-header">
            <div className="tm-panel-badge-group">
              <span className="tm-panel-code">{currentBranch.code} // OFFICIAL DOMAIN</span>
              <h3 className="tm-panel-title">{currentBranch.name}</h3>
            </div>
            <span className="tm-panel-category">{currentBranch.category}</span>
          </div>

          {/* Mission & Scope only — Domain Leadership removed */}
          <div className="tm-info-block">
            <span className="tm-info-label">MISSION &amp; SCOPE</span>
            <p className="tm-info-value">{currentBranch.description}</p>
          </div>

          {/* Team Group Photo (cinematic reveal) */}
          {currentBranch.photoUrl ? (
            <div className="tm-photo-frame" ref={photoRef}>
              <img
                src={currentBranch.photoUrl}
                alt={`${currentBranch.name} group photo`}
                className={`tm-team-photo${photoRevealed ? ' revealed' : ''}`}
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : (
            <div className="tm-photo-pending">
              <span className="tm-pending-tag">PHOTO ARCHIVE // {currentBranch.name}</span>
              <span className="tm-pending-label">GROUP PHOTOGRAPH PENDING VERIFICATION</span>
            </div>
          )}

          {/* Next Branch action */}
          <div className="tm-roster-status-box">
            <div className="tm-roster-left">
              <span className="tm-status-indicator" aria-hidden="true" />
              <div>
                <span className="tm-roster-title">MEMBER ARCHIVE // {currentBranch.name}</span>
                <p className="tm-roster-desc">
                  Domain documentation and active member profiles are cataloged as official records are verified.
                </p>
              </div>
            </div>
            <button
              className="tm-roster-action-btn"
              onClick={() => {
                const idx = TEAM_BRANCHES.findIndex(b => b.id === activeBranchId);
                handleSelectBranch(TEAM_BRANCHES[(idx + 1) % TEAM_BRANCHES.length].id);
              }}
            >
              NEXT BRANCH →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
