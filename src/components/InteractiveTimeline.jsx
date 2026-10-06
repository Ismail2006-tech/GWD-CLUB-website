import React, { useState } from 'react';
import { JOURNEY_DATA } from '../data/gwdData';
import { SHOW_PLACEHOLDER_SECTIONS } from '../data/config';
import '../styles/interactiveTimeline.css';

export default function InteractiveTimeline() {
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Filter unverified milestones if any had placeholder tags
  const validMilestones = JOURNEY_DATA.filter((m) => {
    if (SHOW_PLACEHOLDER_SECTIONS) return true;
    return !m.title.includes('[ADD') && !m.summary.includes('[ADD');
  });

  const activeMilestone = validMilestones[selectedIdx] || validMilestones[0];

  return (
    <div className="interactive-timeline-module" aria-label="Interactive Journey Timeline">
      <div className="timeline-header">
        <span className="timeline-eyebrow">CHRONOLOGICAL EXPANSION</span>
        <h3 className="timeline-title">THE TRAVELLING TIMELINE</h3>
      </div>

      {/* Track / Nodes (Horizontal on Desktop, Vertical on Mobile) */}
      <div className="timeline-track-container">
        <div className="timeline-rail" />
        <div
          className="timeline-rail-progress"
          style={{
            width: `${(selectedIdx / Math.max(1, validMilestones.length - 1)) * 100}%`,
          }}
        />

        <div className="timeline-nodes-bar">
          {validMilestones.map((item, idx) => {
            const isActive = idx === selectedIdx;
            return (
              <button
                key={item.id || idx}
                className={`timeline-node-btn ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedIdx(idx)}
                aria-label={`Select ${item.phase} - ${item.title}`}
                aria-pressed={isActive}
              >
                <div className="node-indicator">
                  <div className="node-pulse-circle" />
                </div>
                <div className="node-meta">
                  <span className="node-phase">{item.phase}</span>
                  <span className="node-short-title">{item.code || item.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Milestone Dossier Card */}
      {activeMilestone && (
        <div className="timeline-active-dossier" key={activeMilestone.id}>
          <div className="dossier-inner">
            <div className="dossier-meta-row">
              <span className="dossier-tag">{activeMilestone.tag || 'MILESTONE RECORD'}</span>
              <span className="dossier-period">{activeMilestone.period}</span>
            </div>
            <h4 className="dossier-heading">{activeMilestone.title}</h4>
            <p className="dossier-summary">{activeMilestone.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
