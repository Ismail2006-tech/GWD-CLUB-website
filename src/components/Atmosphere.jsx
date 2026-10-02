import React, { useEffect, useRef } from 'react';
import '../styles/atmosphere.css';

export default function Atmosphere() {
  // PERF FIX: Use ref + direct DOM style update instead of setState on every mousemove.
  // setState triggers React re-render every pixel — this is a major scroll jank source.
  const cursorLightRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: -500, y: -500 });
  const currentRef = useRef({ x: -500, y: -500 });

  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const soundActiveRef = useRef(false);
  const dotRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Store target position — do NOT call setState
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Animate cursor light with smooth lerp using rAF — no React re-renders
    const LERP = 0.12;
    const animate = () => {
      const { x: tx, y: ty } = mouseRef.current;
      const cx = currentRef.current.x + (tx - currentRef.current.x) * LERP;
      const cy = currentRef.current.y + (ty - currentRef.current.y) * LERP;
      currentRef.current = { x: cx, y: cy };

      if (cursorLightRef.current) {
        cursorLightRef.current.style.transform = `translate(${cx - 160}px, ${cy - 160}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110.4, ctx.currentTime);

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
    if (ctx.state === 'suspended') ctx.resume();

    const nowActive = !soundActiveRef.current;
    soundActiveRef.current = nowActive;

    if (nowActive) {
      gainNodeRef.current.gain.setTargetAtTime(0.12, ctx.currentTime, 1.5);
    } else {
      gainNodeRef.current.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.8);
    }

    // Update DOM directly — no setState needed for a toggle button
    if (dotRef.current) {
      dotRef.current.className = `audio-pulse-dot${nowActive ? ' active' : ''}`;
    }
    if (labelRef.current) {
      labelRef.current.textContent = nowActive ? 'AUDIO // 55Hz ACTIVE' : 'AUDIO // OFF';
    }
  };

  return (
    <div className="atmosphere-container" aria-hidden="true">
      {/* Background Cyber Grid */}
      <div className="cyber-grid" />

      {/* Film Grain Filter */}
      <div className="film-grain" />

      {/* Scanlines (hidden in CSS) */}
      <div className="scanlines" />

      {/* Cinematic Vignette */}
      <div className="cinematic-vignette" />

      {/* The Signature Tiny Drifting Red Light */}
      <div className="drifting-red-light" />

      {/* The Signature Distant Emerald Atmosphere */}
      <div className="ambient-emerald-glow" />

      {/* Mouse Responsive Soft Glow — positioned via ref, not state */}
      <div
        ref={cursorLightRef}
        className="cursor-light"
        style={{ left: 0, top: 0, transform: 'translate(-500px, -500px)' }}
      />

      {/* Audio Atmosphere Toggle */}
      <button
        className="audio-atmosphere-hud"
        onClick={toggleAudio}
        title="Toggle Cinematic Atmosphere Audio"
        aria-label="Toggle Cinematic Atmosphere Audio"
      >
        <span ref={dotRef} className="audio-pulse-dot" />
        <span ref={labelRef} className="audio-label">AUDIO // OFF</span>
      </button>
    </div>
  );
}
