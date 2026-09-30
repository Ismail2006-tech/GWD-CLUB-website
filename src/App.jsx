import React, { useState, useEffect } from 'react';
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

  // Trigger high-performance scroll reveal on content load
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
      { id: '07', el: document.getElementById('structure') },
      { id: '08', el: document.getElementById('members') },
      { id: '09', el: document.getElementById('events') },
      { id: '10', el: document.getElementById('projects') },
      { id: '11', el: document.getElementById('memories') },
      { id: '12', el: document.getElementById('achievements') },
      { id: '13', el: document.getElementById('today') },
      { id: '14', el: document.getElementById('future') }
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
      '07': 'structure',
      '08': 'members',
      '09': 'events',
      '10': 'projects',
      '11': 'memories',
      '12': 'achievements',
      '13': 'today',
      '14': 'future'
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
