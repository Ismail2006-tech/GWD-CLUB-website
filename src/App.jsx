import React, { useState, useEffect, useCallback } from 'react';
import BackgroundWorld from './components/BackgroundWorld';
import AtmosphericFog from './components/AtmosphericFog';
import Atmosphere from './components/Atmosphere';
import MinimalNav from './components/MinimalNav';
import CustomCursor from './components/CustomCursor';
import useScrollReveal from './hooks/useScrollReveal';
import EntrySmokeIntro from './components/EntrySmokeIntro';

// Chapter Sections
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

export default function App() {
  const [activeChapter, setActiveChapter] = useState('00');

  // Entry smoke has already played this session?
  const alreadyPlayed = (() => {
    try { return window.sessionStorage.getItem('gwd_entry_smoke_played_v1') === 'true'; } catch { return false; }
  })();
  const [smokeComplete, setSmokeComplete] = useState(alreadyPlayed);
  const handleSmokeComplete = useCallback(() => setSmokeComplete(true), []);

  // Trigger high-performance scroll reveal on content load
  useScrollReveal(false);

  // Dynamic Scroll Spy across all 16 chapters
  useEffect(() => {

    const sectionDefinitions = [
      { id: '00', domId: 'void' },
      { id: '01', domId: 'beginning' },
      { id: '02', domId: 'why' },
      { id: '03', domId: 'people' },
      { id: '04', domId: 'leaders' },
      { id: '05', domId: 'voices' },
      { id: '06', domId: 'core-team' },
      { id: '07', domId: 'members' },
      { id: '08', domId: 'events' },
      { id: '09', domId: 'projects' },
      { id: '10', domId: 'memories' },
      { id: '11', domId: 'achievements' },
      { id: '12', domId: 'today' },
      { id: '13', domId: 'future' },
    ];

    const handleScroll = () => {
      const windowHeight = window.innerHeight;

      for (let i = sectionDefinitions.length - 1; i >= 0; i--) {
        const item = sectionDefinitions[i];
        const el = document.getElementById(item.domId);
        if (el) {
          const rect = el.getBoundingClientRect();
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
      '13': 'future'
    };

    const targetEl = document.getElementById(idMap[chapterId]);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEnterFromVoid = () => {
    scrollToChapter('01');
  };

  return (
    <div className="gwd-journey-experience">
      {/* ONE-TIME CINEMATIC ENTRY SMOKE — Covers the entire website on first load.
          Unmounts itself completely after 3.8s. Never replays. */}
      {!smokeComplete && (
        <EntrySmokeIntro onComplete={handleSmokeComplete} />
      )}

      {/* Evolving Background World (geometry, density, and movement per chapter) */}
      <BackgroundWorld activeChapter={activeChapter} />

      {/* Cinematic Atmospheric Fog — Black + Light Red Environment */}
      <AtmosphericFog activeChapter={activeChapter} />

      {/* Global Atmosphere Engine (Lights, Grain, Audio Drone) */}
      <Atmosphere />

      {/* Refined Desktop Custom Cursor */}
      <CustomCursor />

      {/* Non-intrusive Minimal Navigation HUD */}
      <MinimalNav
        activeChapter={activeChapter}
        chapters={CHAPTERS}
        onSelectChapter={scrollToChapter}
      />

      {/* Main Continuous Narrative Canvas */}
      <main className="story-stream">
        {/* 00 — THE VOID */}
        <VoidSection onEnter={handleEnterFromVoid} />

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
