import React, { useEffect, useRef } from 'react';
import '../styles/bottomSmoke.css';

/**
 * GWD CLUB — SYSTEM 2: CONTINUOUS BOTTOM ATMOSPHERE SMOKE
 *
 * A subtle organic grey smoke that drifts LEFT → RIGHT along the
 * bottom 15–25% of the viewport across ALL chapters.
 *
 * Properties:
 * - Positioned fixed at the bottom of the viewport
 * - Multiple internal layers moving at different speeds (organic feel)
 * - No obvious loop or visible restart
 * - Never covers headings, faces, buttons, or important content
 * - pointer-events: none (zero interaction interference)
 * - Respects prefers-reduced-motion
 */

// ─── Vertex Shader ───────────────────────────────────────────────────────────
const VS = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// ─── Fragment Shader ─────────────────────────────────────────────────────────
// Bottom smoke: organic grey drifting LEFT → RIGHT.
// Multiple warp layers at different speeds → no perceptible loop.
// Fades to fully transparent at the top so it merges into the page naturally.
const FS = `
precision mediump float;

uniform vec2  u_res;
uniform float u_time;

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
  float v = 0.0, a = 0.55;
  mat2  R = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    v += a * (noise(p) * 0.5 + 0.5);
    p  = R * p * 2.03;
    a *= 0.48;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;

  // ── Vertical fade: smoke only visible in bottom 25% of this canvas ─────────
  // uv.y = 0 is bottom in WebGL, 1 is top.
  // We want smoke at the bottom (low uv.y), fading to nothing near the top.
  float vertMask = smoothstep(1.0, 0.0, uv.y);      // full at y=0, zero at y=1
  vertMask = vertMask * vertMask;                     // quadratic → more concentrated bottom

  // ── Left/right edge natural fade ──────────────────────────────────────────
  float hEdge = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x);

  // ── Aspect-corrected UV for smoke sampling ─────────────────────────────────
  vec2 aUV = vec2(uv.x * aspect, uv.y);

  // ── Layer A: slow primary drift (main body) ────────────────────────────────
  float tA  = u_time * 0.038;
  vec2  pA  = aUV * 1.8;
  pA.x     -= tA;                                    // drift left → right

  vec2 qA = vec2(
    fbm(pA + vec2( tA * 0.22, -tA * 0.12)),
    fbm(pA + vec2( 3.3, 6.1) + vec2(-tA * 0.14,  tA * 0.18))
  );
  vec2 rA = vec2(
    fbm(pA + 2.6 * qA + vec2(1.7, 9.2) + vec2( tA * 0.10, -tA * 0.16)),
    fbm(pA + 2.6 * qA + vec2(8.3, 2.8) + vec2(-tA * 0.14,  tA * 0.11))
  );
  float layerA = fbm(pA + 2.2 * rA);

  // ── Layer B: medium drift (mid wisps — slightly faster) ────────────────────
  float tB  = u_time * 0.055;
  vec2  pB  = aUV * 2.4 + vec2(5.7, 2.3);
  pB.x     -= tB * 1.35;

  vec2 qB = vec2(
    fbm(pB + vec2( tB * 0.18,  tB * 0.08)),
    fbm(pB + vec2( 7.1, 1.4) + vec2( tB * 0.12, -tB * 0.20))
  );
  float layerB = fbm(pB + 1.8 * qB);

  // ── Layer C: fine fast tendrils (trailing wisps — fastest layer) ───────────
  float tC  = u_time * 0.078;
  vec2  pC  = aUV * 3.2 + vec2(11.2, 4.8);
  pC.x     -= tC * 1.65;

  float layerC = fbm(pC + vec2(-tC * 0.25, tC * 0.14));

  // ── Combine layers (different weights for organic feel) ────────────────────
  float combined = layerA * 0.55 + layerB * 0.30 + layerC * 0.15;

  // ── Threshold into smoke density ──────────────────────────────────────────
  float density = smoothstep(0.34, 0.72, combined);

  // ── Final smoke alpha: density × vertical mask × horizontal edge ──────────
  float alpha = density * vertMask * hEdge;
  alpha = clamp(alpha * 0.62, 0.0, 0.55);           // cap so it stays subtle

  // ── Smoke colour: dark-to-mid grey, naturally blending into black ──────────
  float shade   = smoothstep(0.30, 0.78, combined);
  vec3  darkGrey = vec3(0.12, 0.12, 0.14);          // shadowed deep grey
  vec3  midGrey  = vec3(0.38, 0.38, 0.42);          // dimensional mid grey
  vec3  col      = mix(darkGrey, midGrey, shade);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

export default function BottomSmoke() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas  = canvasRef.current;
    if (!canvas) return;

    // ── Try WebGL ────────────────────────────────────────────────────────────
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
    }) || canvas.getContext('experimental-webgl');

    let animId;

    // ── Canvas 2D Fallback ────────────────────────────────────────────────────
    if (!gl) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let W = (canvas.width  = window.innerWidth);
      let H = (canvas.height = window.innerHeight);

      // Simple multi-layer 2D fallback puffs along the bottom
      const puffs = Array.from({ length: 12 }, (_, i) => ({
        x:  (i / 12) * W * 1.4 - W * 0.2,
        y:  H,
        vx: 0.22 + (i % 3) * 0.08,
        radius: 80 + (i % 4) * 40,
        alpha: 0.10 + (i % 3) * 0.04,
      }));

      const onResize = () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        puffs.forEach((p, i) => { p.y = H; });
      };
      window.addEventListener('resize', onResize, { passive: true });

      const render2D = () => {
        ctx.clearRect(0, 0, W, H);
        puffs.forEach(p => {
          p.x += p.vx;
          if (p.x > W + p.radius) p.x = -p.radius * 1.5;

          const gy = p.y - p.radius * 0.2;
          const g  = ctx.createRadialGradient(p.x, gy, 0, p.x, gy, p.radius);
          g.addColorStop(0,   `rgba(90,90,98,${p.alpha})`);
          g.addColorStop(0.5, `rgba(50,50,56,${p.alpha * 0.5})`);
          g.addColorStop(1,   'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, gy, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        if (!reduced) animId = requestAnimationFrame(render2D);
      };
      animId = requestAnimationFrame(render2D);

      return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animId);
      };
    }

    // ── WebGL Setup ───────────────────────────────────────────────────────────
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('BottomSmoke shader error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s); return null;
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER,   VS);
    const fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

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

    const startTime = performance.now();
    const render = (now) => {
      const elapsed = (now - startTime) * 0.001;
      gl.useProgram(prog);
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uTime, reduced ? 8.0 : elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!reduced) animId = requestAnimationFrame(render);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="gwd-bottom-smoke-canvas"
      aria-hidden="true"
    />
  );
}
