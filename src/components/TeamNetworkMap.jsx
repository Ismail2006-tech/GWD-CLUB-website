import React, { useState, useRef } from 'react';
import { LEADERSHIP } from '../data/gwdData';
import { NETWORK_MAP_CONFIG } from '../animations/network-map';
import '../styles/teamNetworkMap.css';

export default function TeamNetworkMap() {
  const [selectedLeaderId, setSelectedLeaderId] = useState(null);
  const containerRef = useRef(null);

  const selectedLeader = LEADERSHIP.find((l) => l.id === selectedLeaderId) || null;

  const handleSelect = (id) => {
    setSelectedLeaderId((prev) => (prev === id ? null : id));
  };

  // Node positions arranged in a balanced orbital constellation
  // Center: President (Aldrin Paul) & VP (Mohd Ismail)
  // Surrounding ring: Leads of Administration, Outreach, Operations, PR, Creative, Technical
  const total = LEADERSHIP.length;

  return (
    <div className="team-network-map-section" ref={containerRef} aria-label="Interactive Team Network Map">
      <div className="network-map-header">
        <span className="network-map-eyebrow">INTERACTIVE CONSTELLATION</span>
        <h3 className="network-map-title">LEADERSHIP SYNAPSE MAP</h3>
        <p className="network-map-hint">
          {window.matchMedia('(hover: none)').matches ? 'TAP A NODE TO EXPLORE CONNECTIONS' : 'HOVER OR CLICK A NODE TO TRACE CONNECTIONS'}
        </p>
      </div>

      <div className="network-map-stage">
        {/* Dynamic SVG Connection Lines */}
        <svg className="network-lines-svg" aria-hidden="true">
          {LEADERSHIP.map((leaderA, idxA) =>
            LEADERSHIP.slice(idxA + 1).map((leaderB) => {
              const isSameBranch = leaderA.branch === leaderB.branch;
              const isExecConnected = leaderA.branch === 'Executive' || leaderB.branch === 'Executive';
              const isRelevant =
                selectedLeaderId === null ||
                selectedLeaderId === leaderA.id ||
                selectedLeaderId === leaderB.id;

              const isHighlighted =
                selectedLeaderId !== null &&
                (selectedLeaderId === leaderA.id || selectedLeaderId === leaderB.id);

              return (
                <line
                  key={`${leaderA.id}-${leaderB.id}`}
                  id={`line-${leaderA.id}-${leaderB.id}`}
                  className={`network-edge-line ${isHighlighted ? 'is-highlighted' : ''} ${!isRelevant ? 'is-dimmed' : ''}`}
                  stroke={isHighlighted ? '#ff1f3d' : isSameBranch ? 'rgba(45, 255, 138, 0.35)' : 'rgba(255, 255, 255, 0.08)'}
                  strokeWidth={isHighlighted ? 2.5 : isSameBranch ? 1.5 : 1}
                  strokeDasharray={isHighlighted ? 'none' : '3 3'}
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        <div className="network-nodes-cluster">
          {LEADERSHIP.map((leader, idx) => {
            const isSelected = selectedLeaderId === leader.id;
            const isConnected =
              selectedLeaderId === null ||
              isSelected ||
              leader.branch === selectedLeader?.branch ||
              selectedLeader?.branch === 'Executive' ||
              leader.branch === 'Executive';

            return (
              <div
                key={leader.id}
                id={`node-${leader.id}`}
                className={`network-node-card ${isSelected ? 'is-selected' : ''} ${!isConnected ? 'is-dimmed' : ''}`}
                onClick={() => handleSelect(leader.id)}
                onMouseEnter={() => {
                  if (!window.matchMedia('(hover: none)').matches) {
                    setSelectedLeaderId(leader.id);
                  }
                }}
                onMouseLeave={() => {
                  if (!window.matchMedia('(hover: none)').matches) {
                    setSelectedLeaderId(null);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`${leader.name} — ${leader.position}`}
              >
                <div className="node-avatar-ring">
                  <img
                    src={leader.photoUrl}
                    alt={leader.name}
                    className="node-avatar-img"
                    loading="lazy"
                  />
                  <div className="node-status-glow" />
                </div>
                <div className="node-info">
                  <span className="node-name">{leader.name}</span>
                  <span className="node-role">{leader.position}</span>
                  <span className="node-branch">{leader.branch}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Member Detail Panel (Mobile & Desktop) */}
      {selectedLeader && (
        <div className="network-detail-drawer" role="region" aria-label="Selected Leader Details">
          <div className="detail-drawer-inner">
            <div className="detail-avatar">
              <img src={selectedLeader.photoUrl} alt={selectedLeader.name} />
            </div>
            <div className="detail-text">
              <span className="detail-branch-tag">{selectedLeader.branch} DOMAIN</span>
              <h4 className="detail-name">{selectedLeader.name}</h4>
              <p className="detail-position">{selectedLeader.position}</p>
            </div>
            <button
              className="detail-close-btn"
              onClick={() => setSelectedLeaderId(null)}
              aria-label="Close detail panel"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
