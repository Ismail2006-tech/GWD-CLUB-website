import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/backgroundWorld.css';

/**
 * BackgroundWorld — The Evolving Environmental System
 * 
 * The background is NOT decoration. It IS the story.
 * Each chapter has its own visual language:
 * geometry + density + texture + movement + interaction behavior
 * 
 * Chapters 00-14 each have a unique environment that transforms
 * as the visitor scrolls through the story.
 */

// Chapter environment definitions — the visual DNA of each chapter
const CHAPTER_ENVIRONMENTS = {
  '00': { 
    name: 'void', 
    pointDensity: 1, 
    connectionDensity: 0, 
    movementSpeed: 0.08,
    particleSize: 1.2,
    colorMode: 'pure-red',
    geometryType: 'single-signal',
    ambientIntensity: 0.04,
  },
  '01': { 
    name: 'archive-fragments', 
    pointDensity: 8, 
    connectionDensity: 0,
    movementSpeed: 0.12,
    particleSize: 1.5,
    colorMode: 'warm-dust',
    geometryType: 'fragments',
    ambientIntensity: 0.08,
  },
  '02': { 
    name: 'structure', 
    pointDensity: 15, 
    connectionDensity: 0.3,
    movementSpeed: 0.15,
    particleSize: 1.2,
    colorMode: 'structure',
    geometryType: 'grid-sparse',
    ambientIntensity: 0.10,
  },
  '03': { 
    name: 'signals', 
    pointDensity: 22, 
    connectionDensity: 0.2,
    movementSpeed: 0.18,
    particleSize: 1.4,
    colorMode: 'signal',
    geometryType: 'dispersed-nodes',
    ambientIntensity: 0.12,
  },
  '04': { 
    name: 'darkroom', 
    pointDensity: 5, 
    connectionDensity: 0,
    movementSpeed: 0.06,
    particleSize: 1.8,
    colorMode: 'darkroom-red',
    geometryType: 'sparse-deep',
    ambientIntensity: 0.07,
  },
  '05': { 
    name: 'editorial', 
    pointDensity: 12, 
    connectionDensity: 0.15,
    movementSpeed: 0.14,
    particleSize: 1.3,
    colorMode: 'warm-editorial',
    geometryType: 'horizontal-drift',
    ambientIntensity: 0.09,
  },
  '06': { 
    name: 'cinematic', 
    pointDensity: 6, 
    connectionDensity: 0,
    movementSpeed: 0.05,
    particleSize: 2.0,
    colorMode: 'cinematic',
    geometryType: 'cinematic-depth',
    ambientIntensity: 0.06,
  },
  '07': { 
    name: 'network-forming', 
    pointDensity: 28, 
    connectionDensity: 0.55,
    movementSpeed: 0.20,
    particleSize: 1.2,
    colorMode: 'network',
    geometryType: 'constellation',
    ambientIntensity: 0.18,
  },
  '08': { 
    name: 'living-archive', 
    pointDensity: 35, 
    connectionDensity: 0.40,
    movementSpeed: 0.16,
    particleSize: 1.1,
    colorMode: 'archive',
    geometryType: 'organic-scatter',
    ambientIntensity: 0.14,
  },
  '09': { 
    name: 'recovered-archive', 
    pointDensity: 18, 
    connectionDensity: 0.25,
    movementSpeed: 0.22,
    particleSize: 1.3,
    colorMode: 'aged-archive',
    geometryType: 'trail',
    ambientIntensity: 0.12,
  },
  '10': { 
    name: 'case-files', 
    pointDensity: 14, 
    connectionDensity: 0.2,
    movementSpeed: 0.18,
    particleSize: 1.2,
    colorMode: 'file-system',
    geometryType: 'structural-grid',
    ambientIntensity: 0.10,
  },
  '11': { 
    name: 'photo-exhibition', 
    pointDensity: 8, 
    connectionDensity: 0.05,
    movementSpeed: 0.08,
    particleSize: 1.6,
    colorMode: 'exhibition',
    geometryType: 'gallery-dust',
    ambientIntensity: 0.07,
  },
  '12': { 
    name: 'evidence', 
    pointDensity: 20, 
    connectionDensity: 0.35,
    movementSpeed: 0.20,
    particleSize: 1.2,
    colorMode: 'evidence-red',
    geometryType: 'evidence-nodes',
    ambientIntensity: 0.16,
  },
  '13': { 
    name: 'convergence', 
    pointDensity: 40, 
    connectionDensity: 0.65,
    movementSpeed: 0.25,
    particleSize: 1.1,
    colorMode: 'convergence',
    geometryType: 'converging',
    ambientIntensity: 0.22,
  },
  '14': { 
    name: 'minimal-unknown', 
    pointDensity: 3, 
    connectionDensity: 0,
    movementSpeed: 0.05,
    particleSize: 1.5,
    colorMode: 'void-future',
    geometryType: 'single-signal',
    ambientIntensity: 0.04,
  },
};

function lerp(a, b, t) { return a + (b - a) * t; }

export default function BackgroundWorld({ activeChapter }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const currentEnvRef = useRef({ ...CHAPTER_ENVIRONMENTS['00'] });
  const targetEnvRef = useRef({ ...CHAPTER_ENVIRONMENTS['00'] });
  const timeRef = useRef(0);
  const transitionProgressRef = useRef(1);

  const getEnv = useCallback((chapterId) => {
    return CHAPTER_ENVIRONMENTS[chapterId] || CHAPTER_ENVIRONMENTS['00'];
  }, []);

  // Trigger environment transition when chapter changes
  useEffect(() => {
    const target = getEnv(activeChapter);
    targetEnvRef.current = target;
    transitionProgressRef.current = 0;
  }, [activeChapter, getEnv]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const MAX_PARTICLES = 60;

    const initParticles = () => {
      particlesRef.current = Array.from({ length: MAX_PARTICLES }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.3,
        active: i < 10, // Initially sparse
      }));
    };

    initParticles();

    const getParticleColor = (colorMode, opacity) => {
      switch (colorMode) {
        case 'pure-red':
          return `rgba(255, 27, 60, ${opacity * 0.9})`;
        case 'warm-dust':
          return `rgba(${200 + Math.floor(Math.random() * 42)}, ${160 + Math.floor(Math.random() * 30)}, ${100 + Math.floor(Math.random() * 30)}, ${opacity * 0.35})`;
        case 'structure':
          return Math.random() > 0.7 
            ? `rgba(255, 27, 60, ${opacity * 0.6})`
            : `rgba(0, 81, 46, ${opacity * 0.4})`;
        case 'signal':
          return Math.random() > 0.85 
            ? `rgba(255, 27, 60, ${opacity * 0.8})`
            : `rgba(242, 242, 242, ${opacity * 0.25})`;
        case 'darkroom-red':
          return `rgba(255, 27, 60, ${opacity * 0.7})`;
        case 'warm-editorial':
          return `rgba(242, 242, 242, ${opacity * 0.2})`;
        case 'cinematic':
          return `rgba(255, 27, 60, ${opacity * 0.5})`;
        case 'network':
          return Math.random() > 0.6
            ? `rgba(255, 27, 60, ${opacity * 0.6})`
            : `rgba(0, 81, 46, ${opacity * 0.4})`;
        case 'archive':
          return `rgba(242, 242, 242, ${opacity * 0.15})`;
        case 'aged-archive':
          return `rgba(200, 180, 140, ${opacity * 0.3})`;
        case 'file-system':
          return `rgba(242, 242, 242, ${opacity * 0.2})`;
        case 'exhibition':
          return `rgba(200, 190, 175, ${opacity * 0.25})`;
        case 'evidence-red':
          return `rgba(255, 27, 60, ${opacity * 0.65})`;
        case 'convergence':
          return Math.random() > 0.5
            ? `rgba(255, 27, 60, ${opacity * 0.55})`
            : `rgba(0, 81, 46, ${opacity * 0.35})`;
        case 'void-future':
          return `rgba(255, 27, 60, ${opacity * 0.8})`;
        default:
          return `rgba(255, 27, 60, ${opacity * 0.5})`;
      }
    };

    const draw = (timestamp) => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Smoothly interpolate environment
      if (transitionProgressRef.current < 1) {
        transitionProgressRef.current = Math.min(1, transitionProgressRef.current + 0.008);
        const tp = transitionProgressRef.current;
        const curr = currentEnvRef.current;
        const targ = targetEnvRef.current;
        currentEnvRef.current = {
          ...targ,
          pointDensity: lerp(curr.pointDensity, targ.pointDensity, tp),
          connectionDensity: lerp(curr.connectionDensity, targ.connectionDensity, tp),
          movementSpeed: lerp(curr.movementSpeed, targ.movementSpeed, tp),
          particleSize: lerp(curr.particleSize, targ.particleSize, tp),
          ambientIntensity: lerp(curr.ambientIntensity, targ.ambientIntensity, tp),
          colorMode: tp > 0.5 ? targ.colorMode : curr.colorMode,
        };
      } else {
        currentEnvRef.current = { ...targetEnvRef.current };
      }

      const env = currentEnvRef.current;

      ctx.clearRect(0, 0, width, height);

      const activeCount = Math.floor(env.pointDensity);
      const speed = env.movementSpeed;
      const particles = particlesRef.current;

      // Update and draw particles
      particles.forEach((p, i) => {
        if (i >= activeCount) {
          p.opacity = Math.max(0, p.opacity - 0.01);
        } else {
          p.opacity = Math.min(0.7, p.opacity + 0.005);
        }

        if (p.opacity <= 0) return;

        // Organic drift
        p.x += Math.sin(t * speed + p.phase) * 0.4 + p.vx * speed * 2;
        p.y += Math.cos(t * speed * 0.7 + p.phase * 1.3) * 0.3 + p.vy * speed * 2;

        // Wrap around edges gently
        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        const size = env.particleSize * p.size;
        const alpha = p.opacity * env.ambientIntensity * 8;

        // Draw connection lines
        if (env.connectionDensity > 0) {
          particles.slice(i + 1, i + 6).forEach((p2, j2) => {
            if (j2 + i + 1 >= activeCount) return;
            const dx = p2.x - p.x;
            const dy = p2.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 150 * env.connectionDensity + 60;
            if (dist < maxDist) {
              const lineAlpha = (1 - dist / maxDist) * env.connectionDensity * 0.3 * env.ambientIntensity * 6;
              const isRed = env.colorMode === 'network' || env.colorMode === 'evidence-red' || env.colorMode === 'convergence';
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = isRed 
                ? `rgba(255, 27, 60, ${lineAlpha})`
                : `rgba(0, 81, 46, ${lineAlpha * 0.7})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(env.colorMode, alpha);
        ctx.fill();
      });

      // Special: single red signal for void/future
      if (env.geometryType === 'single-signal') {
        const pulse = (Math.sin(t * 1.2) + 1) / 2;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 27, 60, ${0.6 + pulse * 0.3})`;
        ctx.shadowColor = '#ff1b3c';
        ctx.shadowBlur = 20 + pulse * 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="background-world" aria-hidden="true">
      <canvas ref={canvasRef} className="world-canvas" />
    </div>
  );
}
