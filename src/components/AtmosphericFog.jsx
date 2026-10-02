import React, { useEffect, useRef } from 'react';
import '../styles/atmosphericFog.css';

/**
 * GWD CLUB — GLOBAL CINEMATIC ATMOSPHERIC SMOKE SYSTEM
 * 
 * Hardware-Accelerated Procedural Smoke & Fog Engine (WebGL + Canvas 2D Fallback)
 * 
 * Sits permanently behind all website content across Chapters 00 through 15.
 * Visual Target:
 * - 75–85% Pure Void Black
 * - 15–25% Visible, Translucent, Flowing Smoke & Fog
 * - Subtle light-red illumination cutting through the smoke curls
 * - Irregular, multi-layered organic domain-warped vapor (NOT circular radial blobs)
 * - Continuous slow movement even when idle + smooth inertia on scroll
 * - Ultra-gradual chapter transitions (no resets, no unmounting)
 */

// Chapter atmospheric DNA — subtle modulation, continuous world
const CHAPTER_ATMOSPHERE = {
  // 00 — THE VOID: darker, mysterious, moderate visible fog around central monolith
  '00': { intensity: 0.38, fogOpacity: 0.38, lightPos: [0.45, 0.52] },
  // 01 — THE BEGINNING: slightly more visible red illumination
  '01': { intensity: 0.52, fogOpacity: 0.44, lightPos: [0.35, 0.48] },
  // 02 — WHY GWD EXISTS: balanced atmosphere, clearer flowing fog
  '02': { intensity: 0.58, fogOpacity: 0.48, lightPos: [0.52, 0.42] },
  // 03 — THE PEOPLE: soft atmospheric movement, human-focused
  '03': { intensity: 0.52, fogOpacity: 0.42, lightPos: [0.65, 0.50] },
  // 04 — THE LEADERS: subtle red atmosphere behind identities, black dominant
  '04': { intensity: 0.62, fogOpacity: 0.48, lightPos: [0.40, 0.56] },
  // 05 — VOICES OF GWD: softer, calmer fog, slightly reduced intensity
  '05': { intensity: 0.46, fogOpacity: 0.36, lightPos: [0.32, 0.45] },
  // 06 — THE CORE TEAM: atmospheric depth behind team photograph
  '06': { intensity: 0.54, fogOpacity: 0.44, lightPos: [0.55, 0.50] },
  // 07 — LIVING SYSTEM / STRUCTURE: slightly stronger atmosphere around active network
  '07': { intensity: 0.60, fogOpacity: 0.48, lightPos: [0.48, 0.50] },
  // 08 — THE MEMBERS: atmospheric archive feeling, soft drifting fog
  '08': { intensity: 0.50, fogOpacity: 0.38, lightPos: [0.38, 0.60] },
  // 09 — THE JOURNEY: gradual movement, travelling through time
  '09': { intensity: 0.56, fogOpacity: 0.44, lightPos: [0.52, 0.46] },
  // 10 — EVENTS: slightly more movement, still subtle
  '10': { intensity: 0.60, fogOpacity: 0.46, lightPos: [0.58, 0.48] },
  // 11 — PROJECTS / WORK: cleaner atmosphere, less fog behind important info
  '11': { intensity: 0.48, fogOpacity: 0.36, lightPos: [0.44, 0.54] },
  // 12 — MEMORIES: softer, dreamier haze, slightly more diffuse
  '12': { intensity: 0.44, fogOpacity: 0.34, lightPos: [0.50, 0.50] },
  // 13 — ACHIEVEMENTS: cleaner atmosphere, sharper red highlights
  '13': { intensity: 0.52, fogOpacity: 0.40, lightPos: [0.46, 0.52] },
  // 14 — GWD TODAY: clearer, more confident atmosphere
  '14': { intensity: 0.58, fogOpacity: 0.44, lightPos: [0.50, 0.55] },
  // 15 — THE FUTURE: gradually fade toward deeper black
  '15': { intensity: 0.24, fogOpacity: 0.20, lightPos: [0.50, 0.50] },
};

const KEY_ALIASES = {
  void: '00',
  beginning: '01',
  why: '02',
  people: '03',
  leaders: '04',
  voices: '05',
  'core-team': '06',
  core: '06',
  'living-system': '07',
  structure: '07',
  members: '08',
  journey: '09',
  events: '10',
  projects: '11',
  memories: '12',
  achievements: '13',
  today: '14',
  future: '15',
};

function normalizeChapter(key) {
  if (!key) return '00';
  const str = String(key).toLowerCase().trim();
  if (KEY_ALIASES[str]) return KEY_ALIASES[str];
  const pad = str.padStart(2, '0');
  if (CHAPTER_ATMOSPHERE[pad]) return pad;
  return '00';
}

// GLSL Vertex Shader — Simple Fullscreen Quad
const VS_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// GLSL Fragment Shader — Multi-Octave Domain-Warped Smoke & Fog
const FS_SOURCE = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform float u_intensity;
uniform float u_fog_opacity;
uniform vec2 u_light_pos;

// Hash function for pseudo-random gradient noise
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// 2D Perlin-style gradient noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// 3-Octave Fractal Brownian Motion (was 4 — saves ~25% shader cost)
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 3; i++) {
    v += a * (noise(p) * 0.5 + 0.5);
    p = rot * p * 2.04;
    a *= 0.50;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 aspectUV = uv;
  aspectUV.x *= u_resolution.x / u_resolution.y;

  // Organic time speeds
  float t = u_time * 0.032;
  float scrollY = u_scroll * 0.00018;

  // -------------------------------------------------------------
  // 1. LEFT VOLUMETRIC FOG PLUME — Billowing in from left boundary
  // -------------------------------------------------------------
  vec2 pLeft = aspectUV * 1.5;
  pLeft.x -= t * 0.28;
  pLeft.y += scrollY + sin(t * 0.35) * 0.12;

  vec2 qLeft = vec2(
    fbm(pLeft + vec2(t * 0.20, -t * 0.14)),
    fbm(pLeft + vec2(3.1, 7.4) + vec2(-t * 0.16, t * 0.18))
  );
  vec2 rLeft = vec2(
    fbm(pLeft + 3.0 * qLeft + vec2(1.7, 9.2) + vec2(t * 0.15, -t * 0.20)),
    fbm(pLeft + 3.0 * qLeft + vec2(8.3, 2.8) + vec2(-t * 0.18, t * 0.15))
  );
  float leftCurl = fbm(pLeft + 2.6 * rLeft);
  float leftFalloff = smoothstep(0.68, 0.02, uv.x);
  float leftFog = leftCurl * leftFalloff * 1.75;

  // -------------------------------------------------------------
  // 2. RIGHT VOLUMETRIC FOG PLUME — Billowing in from right boundary
  // -------------------------------------------------------------
  vec2 pRight = aspectUV * 1.5;
  pRight.x += t * 0.28;
  pRight.y += scrollY - cos(t * 0.32) * 0.12;

  vec2 qRight = vec2(
    fbm(pRight + vec2(-t * 0.18, t * 0.15)),
    fbm(pRight + vec2(8.5, 2.3) + vec2(t * 0.14, -t * 0.20))
  );
  vec2 rRight = vec2(
    fbm(pRight + 3.0 * qRight + vec2(2.5, 4.8) + vec2(-t * 0.16, t * 0.18)),
    fbm(pRight + 3.0 * qRight + vec2(6.1, 3.7) + vec2(t * 0.18, -t * 0.14))
  );
  float rightCurl = fbm(pRight + 2.6 * rRight);
  float rightFalloff = smoothstep(0.32, 0.98, uv.x);
  float rightFog = rightCurl * rightFalloff * 1.75;

  // -------------------------------------------------------------
  // 3. AMBIENT DOMAIN-WARPED MIST (Central drift and swirling wisps)
  // -------------------------------------------------------------
  vec2 pMid = aspectUV * 1.6;
  pMid.y += scrollY;
  vec2 qMid = vec2(
    fbm(pMid + vec2(t * 0.35, t * 0.15)),
    fbm(pMid + vec2(5.2, 1.3) + vec2(-t * 0.28, t * 0.12))
  );
  vec2 rMid = vec2(
    fbm(pMid + 2.8 * qMid + vec2(1.7, 9.2) + vec2(t * 0.22, -t * 0.30)),
    fbm(pMid + 2.8 * qMid + vec2(8.3, 2.8) + vec2(-t * 0.18, t * 0.25))
  );
  float midSmoke = fbm(pMid + 2.4 * rMid);
  float midVapor = smoothstep(0.24, 0.68, midSmoke) * 0.55;

  // Combine plumes
  float totalVapor = clamp(leftFog + rightFog + midVapor, 0.0, 1.8);
  float fogDensity = smoothstep(0.12, 0.65, totalVapor);

  // Soft edge vignette so smoke naturally lives within the frame
  vec2 borderFade = uv * (1.0 - uv);
  float edgeWeight = clamp(borderFade.x * borderFade.y * 24.0, 0.0, 1.0);
  fogDensity *= edgeWeight;

  // Center relief around main reading area to keep content legible
  vec2 centerPos = vec2(0.5 * u_resolution.x / u_resolution.y, 0.5);
  float distToCenter = length(aspectUV - centerPos);
  fogDensity *= mix(0.70, 1.0, smoothstep(0.16, 0.50, distToCenter));

  // Volumetric Lighting & Crimson Glow
  vec2 lightPos = u_light_pos;
  lightPos.x *= u_resolution.x / u_resolution.y;
  float distToLight = length(aspectUV - lightPos);
  float lightCone = exp(-distToLight * 1.8);

  // Center crimson scatter (matches the central crimson halo in the screenshot)
  float redScatter = exp(-distToCenter * 2.2);

  // Smoke color grading: EXACT MATCH to the screenshot
  // Zero cold grey/white smoke; pure deep velvet-black and crimson-wine vapor
  vec3 darkAbyss = vec3(0.035, 0.012, 0.018);
  vec3 wineSmoke = vec3(0.18, 0.028, 0.048);
  vec3 crimsonVapor = vec3(0.55, 0.060, 0.11);
  vec3 hotCrimson = vec3(1.0, 0.10, 0.22);

  vec3 smokeBody = mix(darkAbyss, wineSmoke, smoothstep(0.15, 0.55, totalVapor));
  smokeBody = mix(smokeBody, crimsonVapor, smoothstep(0.50, 0.88, totalVapor) * 0.70);

  // Red illumination cutting through the smoke curls
  float redFactor = clamp((lightCone * 0.75 + redScatter * 0.45) * u_intensity, 0.0, 1.0);
  vec3 finalColor = mix(smokeBody, hotCrimson, redFactor * 0.82);

  // Net visible smoke alpha (subtle, translucent, seamlessly melting into void)
  float alpha = clamp(fogDensity * u_fog_opacity * 1.30, 0.0, 0.78);

  // Output with premultiplied alpha for clean additive/translucent blending over black
  gl_FragColor = vec4(finalColor * alpha, alpha);
}
`;

export default function AtmosphericFog({ activeChapter }) {
  const canvasRef = useRef(null);

  // Scroll tracking with smooth inertia
  const scrollYRef = useRef(0);
  const targetScrollYRef = useRef(0);
  const smoothedScrollRef = useRef(0);

  // Lerping animation state
  const targetAtmoRef = useRef(CHAPTER_ATMOSPHERE['00']);
  const currentIntensity = useRef(0.38);
  const currentFogOpacity = useRef(0.38);
  const currentLightX = useRef(0.45);
  const currentLightY = useRef(0.52);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      targetScrollYRef.current = window.scrollY || window.pageYOffset;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Chapter target updates (continuous smooth transition)
  useEffect(() => {
    const id = normalizeChapter(activeChapter);
    targetAtmoRef.current = CHAPTER_ATMOSPHERE[id] || CHAPTER_ATMOSPHERE['00'];
  }, [activeChapter]);

  // WebGL Atmospheric Smoke Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl =
      canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        powerPreference: 'high-performance',
      }) || canvas.getContext('experimental-webgl');

    let animId;

    // If WebGL is not available, run Canvas 2D fallback
    if (!gl) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const onResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', onResize);

      // Procedural 2D smoke puffs fallback
      const puffs = Array.from({ length: 18 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 250 + 150,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        alpha: Math.random() * 0.15 + 0.1,
        phase: Math.random() * Math.PI * 2,
      }));

      const render2D = (time) => {
        ctx.clearRect(0, 0, width, height);
        const t = targetAtmoRef.current;
        currentIntensity.current += (t.intensity - currentIntensity.current) * 0.015;
        currentFogOpacity.current += (t.fogOpacity - currentFogOpacity.current) * 0.015;

        for (let i = 0; i < puffs.length; i++) {
          const p = puffs[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -p.radius) p.x = width + p.radius;
          if (p.x > width + p.radius) p.x = -p.radius;
          if (p.y < -p.radius) p.y = height + p.radius;
          if (p.y > height + p.radius) p.y = -p.radius;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          const a = p.alpha * currentFogOpacity.current;
          grad.addColorStop(0, `rgba(255, 35, 60, ${a * currentIntensity.current * 0.8})`);
          grad.addColorStop(0.5, `rgba(40, 20, 25, ${a * 0.5})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        if (!prefersReducedMotion) {
          animId = requestAnimationFrame(render2D);
        }
      };

      animId = requestAnimationFrame(render2D);
      return () => {
        window.removeEventListener('resize', onResize);
        if (animId) cancelAnimationFrame(animId);
      };
    }

    // --- WebGL Shader Setup ---
    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compileShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uScroll = gl.getUniformLocation(program, 'u_scroll');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');
    const uFogOpacity = gl.getUniformLocation(program, 'u_fog_opacity');
    const uLightPos = gl.getUniformLocation(program, 'u_light_pos');

    // Handle canvas dimensions with Retina DPR capping
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.floor(window.innerWidth * dpr);
      height = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Enable premultiplied alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let startTime   = performance.now();
    let lastRender   = 0;
    const TARGET_FPS = 20;            // Subtle background fog — 20fps is imperceptible
    const FRAME_MS   = 1000 / TARGET_FPS;
    const isMobile   = window.innerWidth < 768;

    const render = (now) => {
      // Throttle: skip frame if not enough time has passed
      if (now - lastRender < FRAME_MS) {
        animId = requestAnimationFrame(render);
        return;
      }
      lastRender = now;

      const elapsedTime = (now - startTime) * 0.001;

      // Smooth inertia on scroll
      smoothedScrollRef.current += (targetScrollYRef.current - smoothedScrollRef.current) * 0.06;

      // Smooth chapter interpolation (takes ~3.5s per transition)
      const t = targetAtmoRef.current;
      const LERP_RATE = 0.015;

      currentIntensity.current += (t.intensity - currentIntensity.current) * LERP_RATE;
      currentFogOpacity.current += (t.fogOpacity - currentFogOpacity.current) * LERP_RATE;
      currentLightX.current += (t.lightPos[0] - currentLightX.current) * LERP_RATE;
      currentLightY.current += (t.lightPos[1] - currentLightY.current) * LERP_RATE;

      gl.useProgram(program);
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, prefersReducedMotion ? 12.0 : elapsedTime);
      gl.uniform1f(uScroll, smoothedScrollRef.current);
      gl.uniform1f(uIntensity, currentIntensity.current);
      gl.uniform1f(uFogOpacity, currentFogOpacity.current);
      gl.uniform2f(uLightPos, currentLightX.current, currentLightY.current);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animId) cancelAnimationFrame(animId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div className="atmospheric-fog-env" aria-hidden="true" role="presentation">
      {/* High-Performance WebGL Atmospheric Smoke Canvas */}
      <canvas ref={canvasRef} className="global-atmospheric-canvas" />

      {/* Atmospheric Central Crimson Glow (matches the hero screenshot) */}
      <div className="atmo-central-aura" />

      {/* Primary Volumetric Billow Banks (Left & Right rolling fog) */}
      <div className="fog-billow-bank left-bank" />
      <div className="fog-billow-bank right-bank" />

      {/* Secondary Rolling Vapor Streams */}
      <div className="fog-stream-wisp left-wisp" />
      <div className="fog-stream-wisp right-wisp" />

      {/* Cinematic Embers & Atmospheric Motes Drifting in the Fog */}
      <div className="fog-cinematic-motes">
        <span className="mote mote-1" />
        <span className="mote mote-2" />
        <span className="mote mote-3" />
        <span className="mote mote-4" />
        <span className="mote mote-5" />
        <span className="mote mote-6" />
      </div>

      {/* Deep Velvet Cinematic Vignette */}
      <div className="atmo-vignette" />

      {/* Atmospheric 35mm Fine Film Grain */}
      <div className="atmo-grain-overlay" />
    </div>
  );
}
