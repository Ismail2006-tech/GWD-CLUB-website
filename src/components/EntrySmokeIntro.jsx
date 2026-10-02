import React, { useEffect, useRef, useState } from 'react';
import '../styles/entrySmokeIntro.css';

/**
 * GWD CLUB — SYSTEM 1: CINEMATIC PAGE ENTRY SMOKE
 *
 * Sequence:
 *   Phase 0 (0–0.7s)     — PURE BLACK. Nothing visible.
 *   Phase 1 (0.7–6.9s)   — LARGE GREY/WHITE SMOKE FORMATION enters from left, crosses, exits right.
 *   Phase 2 (done)        — Overlay fades out → GWD opening revealed.
 *
 * Session Guard: Plays ONLY ONCE per browser session (sessionStorage).
 * pointer-events: auto during play → none after → unmounts completely.
 */

const SESSION_KEY = 'gwd_smoke_intro_v3';

const VS = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FS = `
precision mediump float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_progress;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i),             f),
        dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
    mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
        dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.52;
  mat2  R = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += a * (noise(p) * 0.5 + 0.5);
    p  = R * p * 2.01;
    a *= 0.50;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2  aUV = vec2(uv.x * aspect, uv.y);

  float cx = mix(-0.65 * aspect, 1.65 * aspect, u_progress);
  float cy = 0.50 + sin(u_progress * 3.14159) * 0.06;

  vec2 delta = aUV - vec2(cx, cy);

  float scaleX = 0.80 + u_progress * 0.30;
  float scaleY = 0.55 + u_progress * 0.08;
  delta.x /= scaleX;
  delta.y /= scaleY;
  float dist = length(delta);

  float t = u_time * 0.55;
  vec2  p = aUV * 2.0;

  vec2 q = vec2(
    fbm(p + vec2( t * 0.18, -t * 0.13)),
    fbm(p + vec2( 4.2, 1.7) + vec2(-t * 0.15,  t * 0.17))
  );

  vec2 r = vec2(
    fbm(p + 2.8 * q + vec2( 1.7,  9.2) + vec2( t * 0.14, -t * 0.20)),
    fbm(p + 2.8 * q + vec2( 8.3,  2.8) + vec2(-t * 0.17,  t * 0.14))
  );

  float bulk   = fbm(p + 2.4 * r);
  float detail = fbm(p * 2.8 + r * 1.6 + vec2(-t * 0.28, t * 0.22));

  float env = smoothstep(1.08, 0.05, dist);
  float density = env * (bulk * 0.70 + detail * 0.30);

  float exitFrac   = smoothstep(0.72, 1.00, u_progress);
  float breakup    = smoothstep(0.55, 0.90, u_progress);
  float smokeAlpha = smoothstep(0.18, 0.62, density);
  smokeAlpha *= mix(1.0, smoothstep(0.28, 0.72, detail), breakup * 0.50);
  smokeAlpha *= (1.0 - exitFrac * exitFrac);
  smokeAlpha *= smoothstep(0.0, 0.08, u_progress);

  vec2  edgeUV = uv * (1.0 - uv);
  float edge   = clamp(edgeUV.x * edgeUV.y * 28.0, 0.0, 1.0);
  smokeAlpha  *= edge;

  float shading   = smoothstep(0.20, 0.80, bulk);
  vec3  smokeCore = vec3(0.93, 0.93, 0.95);
  vec3  smokeMid  = vec3(0.62, 0.63, 0.67);
  vec3  smokeDeep = vec3(0.30, 0.30, 0.34);

  vec3  col = mix(smokeDeep, smokeMid, shading);
  col       = mix(col, smokeCore, smoothstep(0.55, 0.92, bulk) * 0.80);

  vec3 finalRGB = col * smokeAlpha;
  gl_FragColor = vec4(finalRGB, 1.0);
}
`;

export default function EntrySmokeIntro({ onComplete }) {
  const alreadyPlayed = typeof window !== 'undefined'
    ? window.sessionStorage.getItem(SESSION_KEY) === 'true'
    : false;

  const [phase, setPhase] = useState(alreadyPlayed ? 'done' : 'active');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (alreadyPlayed) {
      onComplete?.();
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      window.sessionStorage.setItem(SESSION_KEY, 'true');
      setPhase('fading');
      setTimeout(() => { setPhase('done'); onComplete?.(); }, 400);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: 'high-performance',
    }) || canvas.getContext('experimental-webgl');

    let animId;
    const BLACK_PAUSE = 700;
    const DURATION    = 6200;

    if (!gl) {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { onComplete?.(); return; }

      let startTime = null;
      const render2D = (ts) => {
        if (!startTime) startTime = ts;
        const raw      = ts - startTime - BLACK_PAUSE;
        const progress = raw < 0 ? 0 : Math.min(raw / DURATION, 1.0);
        const w = canvas.width, h = canvas.height;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        if (raw > 0) {
          const sx = -w * 0.5 + progress * (w * 2.0);
          const ry = h * 0.5;
          const rx = Math.min(w, h) * 0.65;
          const exitA = 1.0 - Math.max(0, (progress - 0.72) / 0.28);
          const a = Math.min(progress / 0.08, 1.0) * exitA * 0.78;

          const g = ctx.createRadialGradient(sx, ry, 0, sx, ry, rx);
          g.addColorStop(0,   `rgba(230,230,235,${a})`);
          g.addColorStop(0.4, `rgba(160,162,170,${a * 0.6})`);
          g.addColorStop(0.8, `rgba(80,82,90,${a * 0.25})`);
          g.addColorStop(1,   'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(sx, ry, rx * 1.4, rx * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (progress < 1.0) {
          animId = requestAnimationFrame(render2D);
        } else {
          window.sessionStorage.setItem(SESSION_KEY, 'true');
          setPhase('fading');
          setTimeout(() => { setPhase('done'); onComplete?.(); }, 450);
        }
      };
      animId = requestAnimationFrame(render2D);
      return () => cancelAnimationFrame(animId);
    }

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s); return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VS);
    const fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { onComplete?.(); return; }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { onComplete?.(); return; }

    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes      = gl.getUniformLocation(prog, 'u_res');
    const uTime     = gl.getUniformLocation(prog, 'u_time');
    const uProgress = gl.getUniformLocation(prog, 'u_progress');

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.floor(window.innerWidth  * dpr);
      H = Math.floor(window.innerHeight * dpr);
      canvas.width  = W;
      canvas.height = H;
      gl.viewport(0, 0, W, H);
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    let startTime = null;
    const render = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed  = ts - startTime;
      const raw      = elapsed - BLACK_PAUSE;
      const progress = raw < 0 ? 0 : Math.min(raw / DURATION, 1.0);

      gl.useProgram(prog);
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uTime, elapsed * 0.001);
      gl.uniform1f(uProgress, progress);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (progress < 1.0) {
        animId = requestAnimationFrame(render);
      } else {
        window.sessionStorage.setItem(SESSION_KEY, 'true');
        setPhase('fading');
        setTimeout(() => { setPhase('done'); onComplete?.(); }, 450);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      try {
        gl.deleteBuffer(buf);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteProgram(prog);
      } catch (_) {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`gwd-entry-smoke-overlay${phase === 'fading' ? ' gwd-entry-fading' : ''}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="gwd-entry-smoke-canvas" />
    </div>
  );
}
