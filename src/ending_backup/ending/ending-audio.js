/**
 * GWD CLUB — ENDING WEB AUDIO API SOUND ENGINE
 *
 * File: src/animations/ending/ending-audio.js
 * Description: Pure procedural Web Audio synthesis for cinematic ending effects.
 * Zero external audio files. Off by default with localStorage persistence.
 */

// ==========================================
// TWEAKABLE CONSTANTS
// ==========================================
export const AUDIO_CONFIG = {
  MASTER_GAIN: 0.8,
  PAD_GAIN: 0.045,
  LOCAL_STORAGE_KEY: 'gwd_ending_sound_enabled',
};

class EndingAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.padOscillators = [];
    this.padGain = null;
    this.isEnabled = false;
    this.isMuted = true;

    // Read stored preference
    try {
      const stored = localStorage.getItem(AUDIO_CONFIG.LOCAL_STORAGE_KEY);
      this.isEnabled = stored === 'true';
      this.isMuted = !this.isEnabled;
    } catch {
      this.isEnabled = false;
      this.isMuted = true;
    }
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : AUDIO_CONFIG.MASTER_GAIN, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    this.isMuted = !this.isEnabled;
    try {
      localStorage.setItem(AUDIO_CONFIG.LOCAL_STORAGE_KEY, String(this.isEnabled));
    } catch {}

    if (this.isEnabled) {
      this.ensureContext();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(AUDIO_CONFIG.MASTER_GAIN, this.ctx.currentTime + 0.1);
        this.startAmbientPad();
      }
    } else {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
        this.stopAmbientPad();
      }
    }

    return this.isEnabled;
  }

  startAmbientPad() {
    if (this.isMuted || !this.ctx || this.padOscillators.length > 0) return;

    this.padGain = this.ctx.createGain();
    this.padGain.gain.setValueAtTime(AUDIO_CONFIG.PAD_GAIN, this.ctx.currentTime);
    this.padGain.connect(this.masterGain);

    // Drone sines at 55 Hz (A1), 82.4 Hz (E2), 110 Hz (A2)
    const freqs = [55, 82.4, 110];
    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.connect(this.padGain);
      osc.start();
      this.padOscillators.push(osc);
    });
  }

  stopAmbientPad() {
    if (this.padGain && this.ctx) {
      try {
        this.padGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
      } catch {}
    }
    setTimeout(() => {
      this.padOscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch {}
      });
      this.padOscillators = [];
      if (this.padGain) {
        try { this.padGain.disconnect(); } catch {}
        this.padGain = null;
      }
    }, 350);
  }

  // 0.5 → 3.2s: Recap node blip (660Hz rising 9% per node, panning left to right)
  playRecapNodeBlip(nodeIndex = 0, totalNodes = 8) {
    if (this.isMuted || !this.ctx) return;
    const baseFreq = 660 * Math.pow(1.09, nodeIndex);
    const panVal = -0.8 + (nodeIndex / (totalNodes - 1)) * 1.6;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    if (panner) {
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, panVal)), this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      osc.connect(gain);
      gain.connect(this.masterGain);
    }

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  // 3.6 → 6.1s: Rising Riser (sine sweep 180 → 1080 Hz + subtle noise)
  playLogoRiser(duration = 2.5) {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1080, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, this.ctx.currentTime + duration * 0.85);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    // Low pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2800, this.ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // 6.7s / 12.3s: Soft Whoosh sound
  playWhoosh(pitch = 800, duration = 0.5) {
    if (this.isMuted || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(pitch * 0.5, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(pitch * 1.5, this.ctx.currentTime + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(pitch * 0.3, this.ctx.currentTime + duration);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, this.ctx.currentTime + duration * 0.3);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
  }

  // 8.3s / 11.0s: Deep Thump with optional chime
  playThump(freq = 48, chimeFreq = 440) {
    if (this.isMuted || !this.ctx) return;
    // Low sub thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.8, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.46);

    // Chime
    if (chimeFreq) {
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(chimeFreq, this.ctx.currentTime);

      chimeGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.masterGain);
      chimeOsc.start();
      chimeOsc.stop(this.ctx.currentTime + 0.72);
    }
  }

  // 13.1 → 14.5s: Status typing click
  playTypeClick() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400 + Math.random() * 400, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.012, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.025);
  }

  // Hover Join button: soft chime 880 Hz
  playHoverChime() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }

  // Click Join button: click, thump (70Hz), whoosh, 3 chimes (660, 990, 1320 Hz)
  playJoinSuccessSequence() {
    if (this.isMuted || !this.ctx) return;
    // Thump
    this.playThump(70, null);
    // Whoosh
    this.playWhoosh(1100, 0.4);

    // 3 progressive chimes
    const chimes = [660, 990, 1320];
    chimes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.42);
      }, idx * 120);
    });
  }

  // Scroll to Stay Connected: whoosh + 3 blips (880, 990, 1100 Hz)
  playStayConnectedReveal() {
    if (this.isMuted || !this.ctx) return;
    this.playWhoosh(750, 0.5);
    const freqs = [880, 990, 1100];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      }, (idx + 1) * 220);
    });
  }

  destroy() {
    this.stopAmbientPad();
    if (this.ctx) {
      try { this.ctx.close(); } catch {}
      this.ctx = null;
    }
  }
}

export const endingAudio = new EndingAudioEngine();
