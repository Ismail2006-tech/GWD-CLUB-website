import React, { useState, useEffect } from 'react';
import AtmosphericFog from './components/AtmosphericFog';
import BackgroundWorld from './components/BackgroundWorld';
import Atmosphere from './components/Atmosphere';
import MinimalNav from './components/MinimalNav';
import CustomCursor from './components/CustomCursor';
import useScrollReveal from './hooks/useScrollReveal';

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

  useScrollReveal(false);

  // Dynamic Scroll Spy across all 16 chapters
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
      { id: '09', el: document.getElementById('journey') },
      { id: '10', el: document.getElementById('memories') },
      { id: '11', el: document.getElementById('projects') },
      { id: 'achievements', el: document.getElementById('achievements') },
      { id: 'future', el: document.getElementById('future') },
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
      '09': 'journey',
      '10': 'memories',
      '11': 'projects',
      'achievements': 'achievements',
      'future': 'future',
    };
    const targetEl = document.getElementById(idMap[chapterId]);
    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnterFromVoid = () => scrollToChapter('01');

  return (
    <div className="gwd-journey-experience">

      {/* Global Cinematic Atmospheric Smoke & Fog — subtle red/crimson haze behind all content */}
      <AtmosphericFog activeChapter={activeChapter} />

      {/* Evolving Background World */}
      <BackgroundWorld activeChapter={activeChapter} />

      {/* Global Atmosphere Engine */}
      <Atmosphere />

      {/* Refined Desktop Custom Cursor */}
      <CustomCursor />

      {/* Non-intrusive Minimal Navigation HUD */}
      <MinimalNav
        activeChapter={activeChapter}
        chapters={CHAPTERS}
        onSelectChapter={scrollToChapter}
      />

      {/* Main Continuous Narrative Canvas — appears immediately */}
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

        {/* 08 — THE EVENTS */}
        <JourneyEventsProjectsSection />

        {/* 10 — THE MEMORIES, 11 — THE ACHIEVEMENTS, 13 — THE FUTURE */}
        <MemoriesTodayFutureSection />
      </main>
    </div>
  );
}
