/**
 * GWD CLUB — MASTER CINEMATIC ENDING ORCHESTRATOR
 *
 * File: src/animations/ending/ending.js
 * Description: Master GSAP & requestAnimationFrame timeline driver.
 * Manages viewport pinning, 19s cinematic playback, user skipping,
 * chromatic titles, typewriter status, audio synchronization, and replay navigation.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { endingAudio } from './ending-audio';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// TWEAKABLE TIMELINE CONSTANTS
// ==========================================
export const TIMELINE_CONFIG = {
  TOTAL_AUTOPLAY_DURATION: 16.0,  // seconds until unpinning allows free scrolling
  STATUS_TEXT_DEFAULT: 'END OF CURRENT ARCHIVE // HORIZON ACTIVE',
  STATUS_TEXT_SUCCESS: 'WELCOME TO THE NETWORK.',
  TYPE_SPEED: 0.038,              // seconds per character
  HEADLINE_EASE: 'power4.out',
  TITLE_EASE: 'power3.out',
};

export class EndingMasterTimeline {
  constructor(options) {
    this.container = options.container;
    this.stage = options.stage;
    this.networkBg = options.networkBg;
    this.recapScene = options.recapScene;
    this.logoParticles = options.logoParticles;
    this.domElements = options.domElements; // headline, title, buttons, status, etc.
    this.onHudChange = options.onHudChange;
    this.onComplete = options.onComplete;

    this.elapsed = 0;
    this.isPlaying = false;
    this.isSkipped = false;
    this.isCompleted = false;
    this.scrollTriggerInstance = null;
    this.rafId = null;
    this.lastTime = 0;

    // Track audio triggers
    this.triggeredAudio = {
      h1: false,
      h2: false,
      h3: false,
      title: false,
      glint: false,
      buttons: false,
    };

    this.typewriterInterval = null;
    this._recapCleared = false;
    this.bindEvents();
  }

  bindEvents() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleWheel = this.handleWheel.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e) {
    if (e.key === 'Escape' && this.isPlaying && !this.isSkipped) {
      this.skip();
    }
  }

  handleWheel(e) {
    // If user tries scrolling hard during autoplay, allow skip after 2.5s
    if (this.isPlaying && !this.isSkipped && this.elapsed > 2.5 && Math.abs(e.deltaY) > 40) {
      this.skip();
    }
  }

  initScrollTrigger() {
    if (!this.container) return;

    // Create pinned ScrollTrigger for the ending stage
    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: this.container,
      start: 'top top',
      end: '+=2400',
      pin: this.stage,
      pinSpacing: true,
      anticipatePin: 1,
      onEnter: () => {
        if (!this.isPlaying && !this.isCompleted) {
          this.play();
        }
      },
      onLeaveBack: () => {
        // Leaving back up resets playback capability
        if (this.elapsed > 1) {
          this.reset();
        }
      },
    });

    window.addEventListener('wheel', this.handleWheel, { passive: true });
  }

  play() {
    this.isPlaying = true;
    this.isSkipped = false;
    this.isCompleted = false;
    this.elapsed = 0;
    this._recapCleared = false;
    this.lastTime = performance.now();

    // Start background pad if sound is enabled
    endingAudio.startAmbientPad();

    // Reset components
    this.networkBg?.setRecapMode(true);
    this.recapScene?.start();
    this.logoParticles?.start();

    // Set HUD to RECAP
    this.onHudChange?.('RECAP');

    this.tick = this.tick.bind(this);
    this.rafId = requestAnimationFrame(this.tick);
  }

  tick(now) {
    if (!this.isPlaying) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.elapsed += dt;

    // 1. Update Sub-Engines
    if (this.recapScene?.isActive) {
      this.recapScene.update(dt);
    }
    if (this.logoParticles?.isActive) {
      this.logoParticles.update(dt, this.elapsed);
    }

    // 2. Scene A → Scene B transition at 3.5s (collapse finishes)
    if (this.recapScene) {
      // Keep rendering during collapse even if elapsed > 3.5
      if (!this.recapScene.isDone) {
        this.recapScene.render();
      } else if (!this._recapCleared) {
        this._recapCleared = true;
        // Clear the recap canvas
        const rc = this.recapScene.canvas;
        if (rc) {
          const rctx = rc.getContext('2d');
          rctx?.clearRect(0, 0, rc.width, rc.height);
        }
        this.networkBg?.setRecapMode(false);
        this.onHudChange?.('11 — THE FUTURE');
      }
    }

    // 3. Audio & DOM Timeline cues
    this.checkTimelineCues(this.elapsed);

    // 4. Autoplay unpin check
    if (this.elapsed >= TIMELINE_CONFIG.TOTAL_AUTOPLAY_DURATION && !this.isCompleted) {
      this.finishAutoplay();
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  checkTimelineCues(t) {
    const el = this.domElements;
    if (!el) return;

    // 9.4s: Headline 1
    if (t >= 9.4 && !this.triggeredAudio.h1) {
      this.triggeredAudio.h1 = true;
      endingAudio.playWhoosh(900, 0.45);
      if (el.headline1) {
        gsap.to(el.headline1, { y: 0, opacity: 1, duration: 0.9, ease: TIMELINE_CONFIG.HEADLINE_EASE });
      }
    }

    // 9.8s: Headline 2
    if (t >= 9.8 && !this.triggeredAudio.h2) {
      this.triggeredAudio.h2 = true;
      endingAudio.playWhoosh(1000, 0.45);
      if (el.headline2) {
        gsap.to(el.headline2, { y: 0, opacity: 1, duration: 0.9, ease: TIMELINE_CONFIG.HEADLINE_EASE });
      }
    }

    // 10.2s: Headline 3
    if (t >= 10.2 && !this.triggeredAudio.h3) {
      this.triggeredAudio.h3 = true;
      endingAudio.playWhoosh(1100, 0.5);
      if (el.headline3) {
        gsap.to(el.headline3, { y: 0, opacity: 1, duration: 1.0, ease: TIMELINE_CONFIG.HEADLINE_EASE });
      }
    }

    // 11.0s: Big Title GWD CLUB (Chromatic convergence)
    if (t >= 11.0 && !this.triggeredAudio.title) {
      this.triggeredAudio.title = true;
      endingAudio.playThump(42, 330);
      if (el.bigTitle) {
        gsap.fromTo(el.bigTitle,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: TIMELINE_CONFIG.TITLE_EASE }
        );
      }
      if (el.chromaticRed) {
        gsap.fromTo(el.chromaticRed,
          { x: -14, opacity: 0.47 },
          { x: 0, opacity: 0, duration: 1.1, ease: 'power2.out' }
        );
      }
      if (el.chromaticCyan) {
        gsap.fromTo(el.chromaticCyan,
          { x: 14, opacity: 0.47 },
          { x: 0, opacity: 0, duration: 1.1, ease: 'power2.out' }
        );
      }
    }

    // 11.9s: Sub-line "GET WORK DONE"
    if (t >= 11.9 && el.subLine && el.subLine.style.opacity !== '1') {
      gsap.to(el.subLine, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    }

    // 12.3s: Glint sweep
    if (t >= 12.3 && !this.triggeredAudio.glint) {
      this.triggeredAudio.glint = true;
      endingAudio.playWhoosh(1400, 0.7);
      if (el.glintSweep) {
        gsap.fromTo(el.glintSweep,
          { x: '-120%', opacity: 0 },
          { x: '220%', opacity: 0.7, duration: 1.1, ease: 'power2.inOut' }
        );
      }
    }

    // 12.4s: Buttons rise and fade in
    if (t >= 12.4 && !this.triggeredAudio.buttons) {
      this.triggeredAudio.buttons = true;
      endingAudio.playWhoosh(700, 0.4);
      if (el.joinBtn) {
        gsap.fromTo(el.joinBtn,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );
      }
      if (el.replayBtn) {
        gsap.fromTo(el.replayBtn,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
        );
      }
    }

    // 13.1s: Status line typewriter effect
    if (t >= 13.1 && !this.typewriterInterval && el.statusText) {
      this.startTypewriter(TIMELINE_CONFIG.STATUS_TEXT_DEFAULT, el.statusText);
    }
  }

  startTypewriter(fullText, element, onComplete) {
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    let index = 0;
    element.textContent = '';

    this.typewriterInterval = setInterval(() => {
      if (index < fullText.length) {
        element.textContent += fullText[index];
        endingAudio.playTypeClick();
        index++;
      } else {
        clearInterval(this.typewriterInterval);
        this.typewriterInterval = null;
        onComplete?.();
      }
    }, TIMELINE_CONFIG.TYPE_SPEED * 1000);
  }

  skip() {
    if (this.isSkipped) return;
    this.isSkipped = true;

    // Fast-forward timeline to 14.5s
    this.elapsed = 14.5;

    // Fade out recap and position logo in emblem mode
    if (this.recapScene) {
      this.recapScene.isActive = false;
      this.recapScene.isDone = true;
    }
    this.networkBg?.setRecapMode(false);
    this.onHudChange?.('11 — THE FUTURE');

    // Force DOM elements to final state with quick 0.4s fade
    const el = this.domElements;
    if (el) {
      gsap.to([el.headline1, el.headline2, el.headline3], { y: 0, opacity: 1, duration: 0.4 });
      gsap.to(el.bigTitle, { y: 0, opacity: 1, duration: 0.4 });
      gsap.to(el.subLine, { opacity: 1, duration: 0.4 });
      gsap.to([el.joinBtn, el.replayBtn], { y: 0, opacity: 1, duration: 0.4 });
      if (el.statusText) el.statusText.textContent = TIMELINE_CONFIG.STATUS_TEXT_DEFAULT;
    }

    this.finishAutoplay();
  }

  finishAutoplay() {
    this.isCompleted = true;
    this.onComplete?.();
  }

  reset() {
    this.isPlaying = false;
    this.isSkipped = false;
    this.isCompleted = false;
    this.elapsed = 0;
    this._recapCleared = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);
    this.typewriterInterval = null;

    this.triggeredAudio = {
      h1: false,
      h2: false,
      h3: false,
      title: false,
      glint: false,
      buttons: false,
    };

    const el = this.domElements;
    if (el) {
      gsap.set([el.headline1, el.headline2, el.headline3], { y: '90%', opacity: 0 });
      gsap.set(el.bigTitle, { y: 30, opacity: 0 });
      gsap.set(el.subLine, { opacity: 0 });
      gsap.set([el.joinBtn, el.replayBtn], { y: 40, opacity: 0 });
      if (el.statusText) el.statusText.textContent = '';
    }
  }

  destroy() {
    this.reset();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('wheel', this.handleWheel);
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
      this.scrollTriggerInstance = null;
    }
  }
}
