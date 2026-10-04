import React, { useEffect, useRef, useCallback } from 'react';
import '../styles/backgroundWorld.css';

/**
 * BackgroundWorld — The Evolving Environmental System
 *
 * PERF OPTIMIZATIONS:
 * - Pre-computed particle colors (no Math.random() in render loop)
 * - Capped MAX_PARTICLES at 40 (was 60, often using 40 anyway)
 * - Connection line distance check with early-exit squared distance
 * - canvas.getContext caching (no repeated lookups)
 * - rAF throttled to ~30fps on mobile via frame-skip
 * - Removed shadowBlur from per-particle draw (only on single-signal)
 */

const CHAPTER_ENVIRONMENTS = {
  '00': { name:'void',              pointDensity:1,  connectionDensity:0,    movementSpeed:0.08, particleSize:1.2, colorMode:'pure-red',      geometryType:'single-signal', ambientIntensity:0.04 },
  '01': { name:'archive-fragments', pointDensity:8,  connectionDensity:0,    movementSpeed:0.12, particleSize:1.5, colorMode:'warm-dust',      geometryType:'fragments',     ambientIntensity:0.08 },
  '02': { name:'structure',         pointDensity:15, connectionDensity:0.3,  movementSpeed:0.15, particleSize:1.2, colorMode:'structure',      geometryType:'grid-sparse',   ambientIntensity:0.10 },
  '03': { name:'signals',           pointDensity:20, connectionDensity:0.2,  movementSpeed:0.18, particleSize:1.4, colorMode:'signal',         geometryType:'dispersed-nodes',ambientIntensity:0.12 },
  '04': { name:'darkroom',          pointDensity:5,  connectionDensity:0,    movementSpeed:0.06, particleSize:1.8, colorMode:'darkroom-red',   geometryType:'sparse-deep',   ambientIntensity:0.07 },
  '05': { name:'editorial',         pointDensity:12, connectionDensity:0.15, movementSpeed:0.14, particleSize:1.3, colorMode:'warm-editorial', geometryType:'horizontal-drift',ambientIntensity:0.09 },
  '06': { name:'cinematic',         pointDensity:6,  connectionDensity:0,    movementSpeed:0.05, particleSize:2.0, colorMode:'cinematic',      geometryType:'cinematic-depth',ambientIntensity:0.06 },
  '07': { name:'network-forming',   pointDensity:24, connectionDensity:0.55, movementSpeed:0.20, particleSize:1.2, colorMode:'network',        geometryType:'constellation',  ambientIntensity:0.18 },
  '08': { name:'living-archive',    pointDensity:28, connectionDensity:0.40, movementSpeed:0.16, particleSize:1.1, colorMode:'archive',        geometryType:'organic-scatter',ambientIntensity:0.14 },
  '09': { name:'recovered-archive', pointDensity:18, connectionDensity:0.25, movementSpeed:0.22, particleSize:1.3, colorMode:'aged-archive',   geometryType:'trail',         ambientIntensity:0.12 },
  '10': { name:'case-files',        pointDensity:14, connectionDensity:0.2,  movementSpeed:0.18, particleSize:1.2, colorMode:'file-system',    geometryType:'structural-grid',ambientIntensity:0.10 },
  '11': { name:'photo-exhibition',  pointDensity:8,  connectionDensity:0.05, movementSpeed:0.08, particleSize:1.6, colorMode:'exhibition',     geometryType:'gallery-dust',  ambientIntensity:0.07 },
  '13': { name:'convergence',       pointDensity:30, connectionDensity:0.60, movementSpeed:0.25, particleSize:1.1, colorMode:'convergence',    geometryType:'converging',    ambientIntensity:0.20 },
  '14': { name:'minimal-unknown',   pointDensity:3,  connectionDensity:0,    movementSpeed:0.05, particleSize:1.5, colorMode:'void-future',    geometryType:'single-signal', ambientIntensity:0.04 },
};

function lerp(a, b, t) { return a + (b - a) * t; }

// Pre-compute a fixed color string per particle (called once on init, not per frame)
function makeParticleColors(colorMode, opacity, count) {
  const colors = new Array(count);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let c;
    switch (colorMode) {
      case 'pure-red':      c = `rgba(255,27,60,${(opacity * 0.9).toFixed(3)})`; break;
      case 'warm-dust':     c = `rgba(${200 + Math.floor(r * 42)},${160 + Math.floor(r * 30)},${100 + Math.floor(r * 30)},${(opacity * 0.35).toFixed(3)})`; break;
      case 'structure':     c = r > 0.7 ? `rgba(255,27,60,${(opacity*0.6).toFixed(3)})` : `rgba(0,81,46,${(opacity*0.4).toFixed(3)})`; break;
      case 'signal':        c = r > 0.85 ? `rgba(255,27,60,${(opacity*0.8).toFixed(3)})` : `rgba(242,242,242,${(opacity*0.25).toFixed(3)})`; break;
      case 'darkroom-red':  c = `rgba(255,27,60,${(opacity*0.7).toFixed(3)})`; break;
      case 'warm-editorial':c = `rgba(242,242,242,${(opacity*0.2).toFixed(3)})`; break;
      case 'cinematic':     c = `rgba(255,27,60,${(opacity*0.5).toFixed(3)})`; break;
      case 'network':       c = r > 0.6 ? `rgba(255,27,60,${(opacity*0.6).toFixed(3)})` : `rgba(0,81,46,${(opacity*0.4).toFixed(3)})`; break;
      case 'archive':       c = `rgba(242,242,242,${(opacity*0.15).toFixed(3)})`; break;
      case 'aged-archive':  c = `rgba(200,180,140,${(opacity*0.3).toFixed(3)})`; break;
      case 'file-system':   c = `rgba(242,242,242,${(opacity*0.2).toFixed(3)})`; break;
      case 'exhibition':    c = `rgba(200,190,175,${(opacity*0.25).toFixed(3)})`; break;
      case 'evidence-red':  c = `rgba(255,27,60,${(opacity*0.65).toFixed(3)})`; break;
      case 'convergence':   c = r > 0.5 ? `rgba(255,27,60,${(opacity*0.55).toFixed(3)})` : `rgba(0,81,46,${(opacity*0.35).toFixed(3)})`; break;
      case 'void-future':   c = `rgba(255,27,60,${(opacity*0.8).toFixed(3)})`; break;
      default:              c = `rgba(255,27,60,${(opacity*0.5).toFixed(3)})`; break;
    }
    colors[i] = c;
  }
  return colors;
}

export default function BackgroundWorld({ activeChapter }) {
  const canvasRef          = useRef(null);
  const animRef            = useRef(null);
  const particlesRef       = useRef([]);
  const currentEnvRef      = useRef({ ...CHAPTER_ENVIRONMENTS['00'] });
  const targetEnvRef       = useRef({ ...CHAPTER_ENVIRONMENTS['00'] });
  const timeRef            = useRef(0);
  const transitionRef      = useRef(1);
  const isMobileRef        = useRef(window.innerWidth < 768);
  const frameCountRef      = useRef(0);

  const getEnv = useCallback((id) => CHAPTER_ENVIRONMENTS[id] || CHAPTER_ENVIRONMENTS['00'], []);

  useEffect(() => {
    targetEnvRef.current = getEnv(activeChapter);
    transitionRef.current = 0;
  }, [activeChapter, getEnv]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isMobile = isMobileRef.current;
    const MAX_PARTICLES = isMobile ? 28 : 40;
    // Connection check max dist squared (avoid sqrt per pair)
    const MAX_CONN_DIST_SQ = 160 * 160;

    let width  = canvas.width  = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const initParticles = () => {
      const baseOpacity = 0.5;
      particlesRef.current = Array.from({ length: MAX_PARTICLES }, (_, i) => ({
        x:     Math.random() * width,
        y:     Math.random() * height,
        vx:    (Math.random() - 0.5) * 0.4,
        vy:    (Math.random() - 0.5) * 0.4,
        size:  Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.1,
        phase: Math.random() * Math.PI * 2,
        // Pre-computed color (refreshed on chapter change)
        color: `rgba(255,27,60,${baseOpacity})`,
        active: i < 10,
      }));
    };

    initParticles();

    const handleResize = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
      isMobileRef.current = width < 768;
      initParticles();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Connection line color cache (recreated on env change)
    let lineColorRed   = 'rgba(255,27,60,0.18)';
    let lineColorGreen = 'rgba(0,81,46,0.12)';

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Mobile: skip every other frame → ~30fps
      frameCountRef.current++;
      if (isMobileRef.current && frameCountRef.current % 2 !== 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Smooth environment interpolation
      if (transitionRef.current < 1) {
        transitionRef.current = Math.min(1, transitionRef.current + 0.006);
        const tp   = transitionRef.current;
        const curr = currentEnvRef.current;
        const targ = targetEnvRef.current;
        currentEnvRef.current = {
          ...targ,
          pointDensity:      lerp(curr.pointDensity,      targ.pointDensity,      tp),
          connectionDensity: lerp(curr.connectionDensity, targ.connectionDensity, tp),
          movementSpeed:     lerp(curr.movementSpeed,     targ.movementSpeed,     tp),
          particleSize:      lerp(curr.particleSize,      targ.particleSize,      tp),
          ambientIntensity:  lerp(curr.ambientIntensity,  targ.ambientIntensity,  tp),
          colorMode: tp > 0.5 ? targ.colorMode : curr.colorMode,
          geometryType: targ.geometryType,
        };
        // Refresh pre-computed colors when mode switches
        if (tp > 0.5 && curr.colorMode !== targ.colorMode) {
          const particles = particlesRef.current;
          const newColors = makeParticleColors(targ.colorMode, 0.5, particles.length);
          for (let i = 0; i < particles.length; i++) {
            particles[i].color = newColors[i];
          }
          const isRedMode = targ.colorMode === 'network' || targ.colorMode === 'evidence-red' || targ.colorMode === 'convergence';
          lineColorRed   = 'rgba(255,27,60,0.18)';
          lineColorGreen = isRedMode ? 'rgba(255,27,60,0.12)' : 'rgba(0,81,46,0.12)';
        }
      } else {
        currentEnvRef.current = { ...targetEnvRef.current };
      }

      const env       = currentEnvRef.current;
      const particles = particlesRef.current;

      ctx.clearRect(0, 0, width, height);

      const activeCount = Math.min(Math.floor(env.pointDensity), MAX_PARTICLES);
      const speed       = env.movementSpeed;
      const hasConns    = env.connectionDensity > 0 && !isMobileRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (i >= activeCount) {
          p.opacity = Math.max(0, p.opacity - 0.008);
        } else {
          p.opacity = Math.min(0.7, p.opacity + 0.004);
        }
        if (p.opacity <= 0.01) continue;

        // Organic drift
        p.x += Math.sin(t * speed + p.phase) * 0.4 + p.vx * speed * 2;
        p.y += Math.cos(t * speed * 0.7 + p.phase * 1.3) * 0.3 + p.vy * speed * 2;

        if (p.x < -50)         p.x = width  + 50;
        if (p.x > width  + 50) p.x = -50;
        if (p.y < -50)         p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        const size  = env.particleSize * p.size;
        const alpha = p.opacity * env.ambientIntensity * 8;

        // Connection lines — check only next 4 particles, use squared dist
        if (hasConns && i < activeCount - 1) {
          const limit = Math.min(i + 5, activeCount);
          for (let j = i + 1; j < limit; j++) {
            const p2 = particles[j];
            const dx = p2.x - p.x;
            const dy = p2.y - p.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < MAX_CONN_DIST_SQ) {
              const lineAlpha = (1 - Math.sqrt(d2) / 160) * env.connectionDensity * 0.25 * env.ambientIntensity * 6;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = lineColorRed.replace('0.18)', `${lineAlpha.toFixed(3)})`);
              ctx.lineWidth   = 0.5;
              ctx.stroke();
            }
          }
        }

        // Draw particle — no shadowBlur (expensive)
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.globalAlpha = Math.min(alpha, 0.9);
        ctx.fillStyle   = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Single red signal — kept, minimal cost
      if (env.geometryType === 'single-signal') {
        const pulse = (Math.sin(t * 1.2) + 1) / 2;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,27,60,${0.6 + pulse * 0.3})`;
        ctx.shadowColor = '#ff1b3c';
        ctx.shadowBlur  = 16;
        ctx.fill();
        ctx.shadowBlur  = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    };

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
