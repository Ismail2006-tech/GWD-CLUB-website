import React, { useState, useEffect, useRef } from 'react';
import AtmosphericFog from './components/AtmosphericFog';
import BackgroundWorld from './components/BackgroundWorld';
import Atmosphere from './components/Atmosphere';
import MinimalNav from './components/MinimalNav';
import CustomCursor from './components/CustomCursor';
import useScrollReveal from './hooks/useScrollReveal';
import { scrollStore } from './hooks/useScrollStore';

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

function ScrollProgressBar() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, (scrollY / maxScroll) * 100);
      bar.style.width = `${pct}%`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div ref={barRef} className="scroll-progress-bar" aria-hidden="true" />;
}

export default function App() {
  const [activeChapter, setActiveChapter] = useState('00');

  useScrollReveal(false);

  // Dynamic Scroll Spy across all chapters derived from CHAPTERS single source of truth
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const overallProgress = Math.min(1, Math.max(0, scrollY / maxScroll));

      let currentActiveId = '00';
      let currentChapterProgress = 0;
      const windowHeight = window.innerHeight;

      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        const item = CHAPTERS[i];
        const el = document.getElementById(item.key);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.45) {
            currentActiveId = item.id;
            const elHeight = Math.max(1, rect.height);
            const relativeTop = windowHeight * 0.45 - rect.top;
            currentChapterProgress = Math.min(1, Math.max(0, relativeTop / elHeight));
            break;
          }
        }
      }

      setActiveChapter(currentActiveId);
      scrollStore.updateState({
        scrollY,
        overallProgress,
        activeChapter: currentActiveId,
        chapterProgress: currentChapterProgress,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToChapter = (chapterId) => {
    const chapterObj = CHAPTERS.find(c => c.id === chapterId);
    if (!chapterObj) return;
    const targetEl = document.getElementById(chapterObj.key);
    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnterFromVoid = () => scrollToChapter('01');

  return (
    <div className="gwd-journey-experience">
      {/* Crimson Scroll Progress Bar — fixed at top */}
      <ScrollProgressBar />

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
