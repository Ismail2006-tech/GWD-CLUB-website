import React, { useEffect, useState, useRef } from 'react';
import '../styles/atmosphere.css';

export default function Atmosphere() {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [soundActive, setSoundActive] = useState(false);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Cinematic deep drone sound generation using Web Audio API (Zero external assets, 100% reliable)
  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Deep Sub Drone (55Hz - A1)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);

      // Warm Atmospheric Detuned Layer (110Hz - A2)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110.4, ctx.currentTime);

      // Lowpass Filter for cinematic deep warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.3, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      osc1.start();
      osc2.start();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!soundActive) {
      gainNodeRef.current.gain.setTargetAtTime(0.12, ctx.currentTime, 1.5);
      setSoundActive(true);
    } else {
      gainNodeRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.8);
      setSoundActive(false);
    }
  };

  return (
    <div className="atmosphere-container" aria-hidden="true">
      {/* Background Cyber Grid */}
      <div className="cyber-grid" />

      {/* Film Grain Filter */}
      <div className="film-grain" />

      {/* Very Subtle Scanlines */}
      <div className="scanlines" />

      {/* Cinematic Vignette */}
      <div className="cinematic-vignette" />

      {/* The Signature Tiny Drifting Red Light */}
      <div className="drifting-red-light" />

      {/* The Signature Distant Emerald Atmosphere */}
      <div className="ambient-emerald-glow" />

      {/* Mouse Responsive Soft Glow */}
      <div
        className="cursor-light"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      {/* Audio Atmosphere Toggle (Subtle HUD element) */}
      <button 
        className="audio-atmosphere-hud" 
        onClick={toggleAudio}
        title={soundActive ? "Mute Cinematic Drone" : "Enable Cinematic Atmosphere"}
        aria-label="Toggle Cinematic Atmosphere Audio"
      >
        <span className={`audio-pulse-dot ${soundActive ? 'active' : ''}`} />
        <span className="audio-label">
          {soundActive ? "AUDIO // 55Hz ACTIVE" : "AUDIO // OFF"}
        </span>
      </button>
    </div>
  );
}
