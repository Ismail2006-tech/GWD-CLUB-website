import React, { useState, useEffect, useCallback } from 'react';
import AtmosphericFog from './components/AtmosphericFog';
import BackgroundWorld from './components/BackgroundWorld';
import Atmosphere from './components/Atmosphere';
import MinimalNav from './components/MinimalNav';
import CustomCursor from './components/CustomCursor';
import useScrollReveal from './hooks/useScrollReveal';

// ── Smoke Systems ────────────────────────────────────────────────────────────
import EntrySmokeIntro from './components/EntrySmokeIntro'; // System 1 — cinematic entry
import BottomSmoke from './components/BottomSmoke';          // System 2 — continuous bottom

// ── Chapter Sections ─────────────────────────────────────────────────────────
import VoidSection from './components/VoidSection';
import BeginningSection from './components/BeginningSection';
import WhySection from './components/WhySection';
import PeopleLeadersSection from './components/PeopleLeadersSection';
import CoreStructureMembersSection from './components/CoreStructureMembersSection';
import JourneyEventsProjectsSection from './components/JourneyEventsProjectsSection';
import MemoriesTodayFutureSection from './components/MemoriesTodayFutureSection';

import { CHAPTERS } from './data/gwdData';
import './styles/variables.css';
import './styles/microInteractions.css';
import './App.css';

// Session check — did the cinematic intro already play this session?
const SESSION_KEY = 'gwd_smoke_intro_v3';
const introAlreadyDone = () => {
  try {
    return typeof window !== 'undefined' &&
      window.sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch { return false; }
};

export default function App() {
  const [activeChapter, setActiveChapter] = useState('00');

  // Whether System 1 intro has completed (or was already done this session).
  // If already done: start revealed immediately. Otherwise wait for onComplete.
  const [contentRevealed, setContentRevealed] = useState(() => introAlreadyDone());

  useScrollReveal(false);

  // Called by EntrySmokeIntro when the smoke has fully left the screen
  const handleIntroComplete = useCallback(() => {
    setContentRevealed(true);
  }, []);

  // Dynamic Scroll Spy across all chapters
  useEffect(() => {
    const sections = [
      { id: '00', el: document.getElementById('void') },
      { id: '01', el: document.getElementById('beginning') },
      { id: '02', el: document.getElementById('why') },
      { id: '03', el: document.getElementById('people') },
      { id: '04', el: document.getElementById('leaders') },
      { id: '05', el: document.getElementById('voices') },
      { id: '06', el: document.getElementById('core-team') },
      { id: '07', el: document.getElementById('members') },
      { id: '08', el: document.getElementById('events') },
      { id: '09', el: document.getElementById('projects') },
      { id: '10', el: document.getElementById('memories') },
      { id: '11', el: document.getElementById('achievements') },
      { id: '12', el: document.getElementById('today') },
      { id: '13', el: document.getElementById('future') },
    ];

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      for (let i = sections.length - 1; i >= 0; i--) {
        const item = sections[i];
        if (item.el) {
          const rect = item.el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.45) {
            setActiveChapter(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToChapter = (chapterId) => {
    const idMap = {
      '00': 'void',
      '01': 'beginning',
      '02': 'why',
      '03': 'people',
      '04': 'leaders',
      '05': 'voices',
      '06': 'core-team',
      '07': 'members',
      '08': 'events',
      '09': 'projects',
      '10': 'memories',
      '11': 'achievements',
      '12': 'today',
      '13': 'future',
    };
    const targetEl = document.getElementById(idMap[chapterId]);
    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnterFromVoid = () => scrollToChapter('01');

  return (
    <div className="gwd-journey-experience">

      {/* ── SYSTEM 1: CINEMATIC ENTRY SMOKE ────────────────────────────────
          Full-screen black curtain + large grey/white smoke crosses screen.
          Plays only once per session. Unmounts completely after completion. */}
      <EntrySmokeIntro onComplete={handleIntroComplete} />

      {/* ── SYSTEM 2: CONTINUOUS BOTTOM ATMOSPHERE SMOKE ───────────────────
          Subtle grey smoke drifting left→right along bottom 20-25% of
          viewport. Persists through ALL chapters without restart. */}
      {contentRevealed && <BottomSmoke />}

      {/* Global Cinematic Atmospheric Fog (background red/crimson glow) */}
      <AtmosphericFog activeChapter={activeChapter} />

      {/* Evolving Background World */}
      <BackgroundWorld activeChapter={activeChapter} />

      {/* Global Atmosphere Engine */}
      <Atmosphere />

      {/* Refined Desktop Custom Cursor */}
      <CustomCursor />

      {/* Minimal Navigation HUD — hidden until intro completes */}
      {contentRevealed && (
        <MinimalNav
          activeChapter={activeChapter}
          chapters={CHAPTERS}
          onSelectChapter={scrollToChapter}
        />
      )}

      {/* Main Continuous Narrative Canvas
          Hidden (opacity:0, pointer-events:none) until smoke exits.
          Uses CSS transition so reveal is a gentle settle, not a hard pop. */}
      <main
        className="story-stream"
        style={{
          opacity: contentRevealed ? 1 : 0,
          transition: contentRevealed ? 'opacity 0.6s ease-out' : 'none',
          pointerEvents: contentRevealed ? 'auto' : 'none',
        }}
      >
        {/* 00 — THE VOID */}
        <VoidSection onEnter={handleEnterFromVoid} introReady={contentRevealed} />

        {/* 01 — THE BEGINNING */}
        <BeginningSection />

        {/* 02 — WHY GWD EXISTS */}
        <WhySection />

        {/* 03 — THE PEOPLE, 04 — THE LEADERS, 05 — VOICES OF GWD */}
        <PeopleLeadersSection />

        {/* 06 — THE CORE TEAM, 07 — THE STRUCTURE, 08 — THE MEMBERS */}
        <CoreStructureMembersSection />

        {/* 09 — THE JOURNEY, 10 — THE EVENTS, 11 — THE PROJECTS */}
        <JourneyEventsProjectsSection />

        {/* 12 — THE MEMORIES, 13 — THE ACHIEVEMENTS, 14 — GWD TODAY, 15 — THE FUTURE */}
        <MemoriesTodayFutureSection />
      </main>
    </div>
  );
}
