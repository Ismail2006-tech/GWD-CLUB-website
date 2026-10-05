import React from 'react';
import { STAGE_1_DATA } from '../data/gwdData';
import '../styles/why.css';

export default function WhySection() {
  const data = STAGE_1_DATA.why;

  return (
    <section id="why" className="why-section" aria-label="Chapter 02: Why GWD Exists">
      {/* Subtle background dim-green atmospheric refraction */}
      <div className="why-emerald-refraction" />
      <div className="why-red-faint-glow" />

      <div className="section-container">
        {/* Header Block */}
        <header className="why-header">
          <div className="chapter-eyebrow reveal-eyebrow">
            <span className="eyebrow-idx">CHAPTER 02</span>
            <span className="eyebrow-divider">—</span>
            <span className="eyebrow-theme">PURPOSE & ETHOS</span>
          </div>

          <h2 className="why-huge-title reveal-title">
            WHY<span className="title-interrogation">?</span>
          </h2>

          {/* Central Core Philosophy */}
          <div className="why-central-manifesto reveal-fade">
            <div className="manifesto-lead-bracket tl" />
            <p className="manifesto-line primary">{data.centralMessage[0]}</p>
            <div className="manifesto-connector-pulse">
              <span className="connector-dot" />
              <span className="connector-line" />
            </div>
            <p className="manifesto-line accent">{data.centralMessage[1]}</p>
            <div className="manifesto-lead-bracket br" />
          </div>
        </header>

        {/* ONE INTEGRATED VISUAL SYSTEM: PURPOSE → VALUES → VISION */}
        <div className="why-unified-system">
          {/* Continuous Vector Spine connecting all three ideas */}
          <div className="system-backbone-track">
            <div className="backbone-line" />
            <div className="backbone-pulse-node top" />
            <div className="backbone-pulse-node middle" />
            <div className="backbone-pulse-node bottom" />
          </div>

          <div className="system-stations">
            {data.sections.map((item, idx) => (
              <div key={item.tag} className={`system-station station-${idx + 1} reveal-stagger`} data-stagger={idx}>
                {/* Station Vector Node Marker */}
                <div className="station-node-anchor">
                  <div className="node-glow-ring" />
                  <div className="node-inner-point" />
                  <span className="node-stem-line" />
                </div>

                {/* Station Content */}
                <div className="station-content-body">
                  <div className="station-meta-row">
                    <span className="station-tag">{item.tag}</span>
                    <span className="station-step-indicator">PHASE 0{idx + 1}</span>
                  </div>

                  <h3 className="station-title">{item.title}</h3>
                  <p className="station-narrative">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CINEMATIC ENDING: LEARNING → IMPLEMENTING → BUILDING → FUTURE */}
        <div className="why-cinematic-ending">
          <div className="ending-horizon-line" />

          <div className="ending-progression-row">
            {data.evolution.map((evo, i) => (
              <React.Fragment key={evo.label}>
                <div className={`evolution-milestone ${i === data.evolution.length - 1 ? 'future-highlight' : ''}`}>
                  <span className="evo-num">{evo.stage}</span>
                  <span className="evo-label">{evo.label}</span>
                  <div className="evo-glow-dot" />
                </div>
                {i < data.evolution.length - 1 && (
                  <div className="evolution-vector-arrow">
                    <span className="vector-beam" />
                    <span className="vector-tip">→</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="ending-manifesto-subtle">
            <p className="subtle-line">
              GWD CLUB is where students don't just learn.
              <span className="subtle-highlight"> They implement. They build. </span>
              And they grow toward the future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
