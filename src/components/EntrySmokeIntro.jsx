import React, { useEffect, useRef, useState } from 'react';
import '../styles/entrySmokeIntro.css';

/**
 * GWD CLUB — CINEMATIC PAGE ENTRY SMOKE
 * 
 * Plays ONLY when the website first opens.
 * 
 * Sequence:
 * 1. PURE BLACK (GWD opening hidden underneath)
 * 2. LARGE REALISTIC GREY/WHITE SMOKE FORMATION ENTERS from left
 * 3. SMOKE BILLOWS ACROSS SCREEN (dense, volumetric, organic)
 * 4. SMOKE LEAVES to the right (stretches, thins, dissipates, physically leaves)
 * 5. SMOKE IS 100% GONE -> GWD OPENING PAGE APPEARS with a subtle settle
 * 6. STOPPED & UNMOUNTED COMPLETELY (Zero smoke on the rest of the website)
 * 
 * Session Guard: Plays only ONCE per session.
 * Does NOT replay when scrolling up or navigating between chapters.
 */

const SESSION_STORAGE_KEY = 'gwd_entry_smoke_played_v1';

// Fullscreen Quad Vertex Shader
const VS_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Volumetric Organic Smoke Fragment Shader
const FS_SOURCE = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_progress; // 0.0 (entering left) -> 0.5 (center) -> 1.0 (exited right)

// Hash function
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// 2D Perlin gradient noise
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

// 4-Octave Fractional Brownian Motion with rotation matrix
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    v += a * (noise(p) * 0.5 + 0.5);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 aspectUV = uv;
  aspectUV.x *= u_resolution.x / u_resolution.y;

  float aspect = u_resolution.x / u_resolution.y;

  // Trajectory: Enters left (-0.5), covers center (0.5), exits completely right (1.5)
  float smokeX = -0.55 + u_progress * 2.15;
  float smokeY = 0.50 + sin(u_progress * 3.14159) * 0.05;

  vec2 center = vec2(smokeX * aspect, smokeY);
  vec2 delta = aspectUV - center;

  // Horizontal stretching as the formation moves and billows
  float stretchX = 0.65 + u_progress * 0.35;
  float stretchY = 0.60 + u_progress * 0.15;
  delta.x /= stretchX;
  delta.y /= stretchY;

  float dist = length(delta);

  // Time-driven fluid swirling turbulence
  float t = u_time * 0.75;
  vec2 p = aspectUV * 1.8;

  // Multi-tier domain warping for organic smoke physics
  vec2 q = vec2(
    fbm(p + vec2(t * 0.25, -t * 0.18)),
    fbm(p + vec2(5.2, 1.3) + vec2(-t * 0.22, t * 0.20))
  );

  vec2 r = vec2(
    fbm(p + 3.0 * q + vec2(1.7, 9.2) + vec2(t * 0.18, -t * 0.26)),
    fbm(p + 3.0 * q + vec2(8.3, 2.8) + vec2(-t * 0.20, t * 0.22))
  );

  float mainCurl = fbm(p + 2.6 * r);
  float detailWisps = fbm(p * 2.4 + r * 1.8 + vec2(-t * 0.35, t * 0.25));

  // Large volumetric envelope with soft organic falloff
  float envelope = smoothstep(1.05, 0.12, dist);

  // Raw density
  float density = envelope * (mainCurl * 0.72 + detailWisps * 0.28);

  // Dissipation as it leaves the right edge
  float exitDissipate = smoothstep(1.0, 0.85, u_progress);
  float breakup = smoothstep(0.45, 0.95, u_progress);

  // Smoke density thresholding (volumetric dense core + soft realistic edges)
  float smokeAlpha = smoothstep(0.22, 0.68, density);
  smokeAlpha *= mix(1.0, smoothstep(0.30, 0.75, detailWisps), breakup * 0.45);
  smokeAlpha *= (1.0 - exitDissipate);

  // Soft edge vignette
  vec2 edgeVignette = uv * (1.0 - uv);
  float edgeWeight = clamp(edgeVignette.x * edgeVignette.y * 30.0, 0.0, 1.0);
  smokeAlpha *= edgeWeight;

  // Realistic Grey/White Volumetric Smoke Color Shading
  // High density core catches light; edges are softer, translucent slate grey
  float shading = smoothstep(0.20, 0.75, mainCurl);
  vec3 smokeCore = vec3(0.92, 0.92, 0.94); // dense bright white-grey
  vec3 smokeMid  = vec3(0.68, 0.69, 0.72); // dimensional slate grey
  vec3 smokeDeep = vec3(0.38, 0.38, 0.42); // shaded depth

  vec3 smokeColor = mix(smokeDeep, smokeMid, shading);
  smokeColor = mix(smokeColor, smokeCore, smoothstep(0.55, 0.90, mainCurl) * 0.75);

  // Output: Pure black background (0,0,0) with grey/white smoke cloud
  vec3 finalColor = smokeColor * smokeAlpha;
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function EntrySmokeIntro({ onComplete }) {
  // Check session storage immediately
  const [shouldRun] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(SESSION_STORAGE_KEY) !== 'true';
      }
    } catch {
      // Fallback
    }
    return true;
  });

  const [phase, setPhase] = useState(() => (shouldRun ? 'active' : 'done'));
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!shouldRun) {
      if (onComplete) onComplete();
      return;
    }

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        try {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        } catch {}
        setPhase('fading');
        setTimeout(() => {
          setPhase('done');
          if (onComplete) onComplete();
        }, 300);
      }, 500);
      return () => clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
      }) || canvas.getContext('experimental-webgl');

    let animId;
    const DURATION = 3800; // 3.8 seconds total: enter -> cross -> exit completely
    let startTime = null;

    // Fallback if WebGL is unavailable
    if (!gl) {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setPhase('done');
        if (onComplete) onComplete();
        return;
      }

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const render2D = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / DURATION, 1.0);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // 2D Smoke formation travel
        const sx = -width * 0.4 + progress * (width * 1.8);
        const sy = height * 0.5;
        const radius = Math.min(width, height) * 0.55;

        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
        const a = progress < 0.85 ? 0.75 : (1.0 - progress) / 0.15 * 0.75;
        grad.addColorStop(0, `rgba(220, 220, 225, ${a})`);
        grad.addColorStop(0.5, `rgba(160, 165, 175, ${a * 0.6})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        if (progress < 1.0) {
          animId = requestAnimationFrame(render2D);
        } else {
          try {
            window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
          } catch {}
          setPhase('fading');
          setTimeout(() => {
            setPhase('done');
            if (onComplete) onComplete();
          }, 400);
        }
      };

      animId = requestAnimationFrame(render2D);
      return () => cancelAnimationFrame(animId);
    }

    // --- WebGL Shader Setup ---
    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compileShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) {
      setPhase('done');
      if (onComplete) onComplete();
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setPhase('done');
      if (onComplete) onComplete();
      return;
    }

    gl.useProgram(program);

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

    const uRes = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uProgress = gl.getUniformLocation(program, 'u_progress');

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

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / DURATION, 1.0);

      gl.useProgram(program);
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, elapsed * 0.001);
      gl.uniform1f(uProgress, progress);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (progress < 1.0) {
        animId = requestAnimationFrame(render);
      } else {
        // Step 4 & 5: Smoke has completely exited the screen
        try {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        } catch {}

        setPhase('fading');

        setTimeout(() => {
          setPhase('done');
          if (onComplete) onComplete();
        }, 400); // graceful 400ms fade transition into the existing GWD opening
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
  }, [shouldRun, onComplete]);

  // Completely unmounted once intro is finished
  if (phase === 'done' || !shouldRun) {
    return null;
  }

  return (
    <div
      className={`intro-smoke-overlay ${phase === 'fading' ? 'fade-out' : ''}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="intro-smoke-canvas" />
    </div>
  );
}
