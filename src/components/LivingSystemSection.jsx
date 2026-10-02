import React, { useState } from 'react';
import { TEAM_BRANCHES } from '../data/teamBranchesData';
import '../styles/livingSystem.css';

/**
 * Chapter 07 — TEAM MEMBERS
 * Clean, cinematic domain archive across the 5 official branches.
 */

export default function LivingSystemSection({ id = "members" }) {
  // Default to Branch 01: Management Team
  const [activeBranchId, setActiveBranchId] = useState('management');

  const currentBranch = TEAM_BRANCHES.find(b => b.id === activeBranchId) || TEAM_BRANCHES[0];

  return (
    <section 
      id={id}
      className="team-members-stage" 
      aria-label="Chapter 07: Team Members"
    >
      <div className="tm-ambient-grid" aria-hidden="true" />

      <div className="tm-container">
        {/* ── Chapter Header ────────────────────────────────── */}
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

        {/* ── Top Branch Selector (Exact Left-to-Right 01 -> 05) ── */}
        <nav className="tm-branches-nav" aria-label="Team Branches Selector" role="tablist">
          {TEAM_BRANCHES.map((branch) => {
            const isActive = branch.id === activeBranchId;
            return (
              <button
                key={branch.id}
                className={`tm-branch-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveBranchId(branch.id)}
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

        {/* ── Focused Branch Detail Stage ───────────────────── */}
        <div 
          className="tm-branch-panel"
          role="tabpanel"
          id={`panel-${currentBranch.id}`}
          aria-labelledby={`tab-${currentBranch.id}`}
        >
          <div className="tm-panel-header">
            <div className="tm-panel-badge-group">
              <span className="tm-panel-code">{currentBranch.code} // OFFICIAL DOMAIN</span>
              <h3 className="tm-panel-title">{currentBranch.name}</h3>
            </div>
            <span className="tm-panel-category">{currentBranch.category}</span>
          </div>

          <div className="tm-info-grid">
            <div className="tm-info-block">
              <span className="tm-info-label">DOMAIN LEADERSHIP</span>
              <p className="tm-info-value tm-info-lead">{currentBranch.lead}</p>
            </div>

            <div className="tm-info-block">
              <span className="tm-info-label">MISSION & SCOPE</span>
              <p className="tm-info-value">{currentBranch.description}</p>
            </div>
          </div>

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
                const currentIndex = TEAM_BRANCHES.findIndex(b => b.id === activeBranchId);
                const nextIndex = (currentIndex + 1) % TEAM_BRANCHES.length;
                setActiveBranchId(TEAM_BRANCHES[nextIndex].id);
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
