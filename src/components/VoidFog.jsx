import React, { useEffect, useRef } from 'react';
import '../styles/voidFog.css';

/**
 * VoidFog — Cinematic Left & Right Rolling Atmospheric Fog System
 * 
 * Specifically renders dense, organic, volumetric fog billowing and curling
 * inward from BOTH the LEFT and RIGHT sides of the screen on Chapter 00 (The First Page).
 * 
 * Features:
 * - Left smoke bank: Flows from the left edge toward center with multi-octave curl turbulence
 * - Right smoke bank: Flows from the right edge toward center with opposing fluid vortex
 * - Center atmospheric mist: Soft, mysterious haze that catches the red GWD illumination
 * - 60 FPS WebGL shader with automatic Canvas 2D fallback
 * - Fully transparent to pointer events (zero interference with clicks or scrolling)
 */

const VS_CODE = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FS_CODE = `
precision mediump float;

uniform vec2 u_res;
uniform float u_time;

// Pseudo-random hash
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

// 4-octave Fractional Brownian Motion with rotation
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
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 aspectUV = uv;
  aspectUV.x *= u_res.x / u_res.y;

  float t = u_time * 0.12;

  // -------------------------------------------------------------
  // 1. LEFT FOG BANK — Billowing in from the left edge
  // -------------------------------------------------------------
  vec2 pLeft = aspectUV * 1.8;
  pLeft.x -= t * 0.22; // drift inward to the right
  pLeft.y += sin(t * 0.3) * 0.08;

  vec2 qLeft = vec2(
    fbm(pLeft + vec2(t * 0.15, -t * 0.10)),
    fbm(pLeft + vec2(3.1, 7.4) + vec2(-t * 0.12, t * 0.14))
  );
  float leftCurl = fbm(pLeft + 2.5 * qLeft);
  
  // Left distance mask: thickest at x=0, tapering off as it reaches center (x=0.55)
  float leftFalloff = smoothstep(0.62, 0.0, uv.x);
  float leftFog = leftCurl * leftFalloff * 1.35;

  // -------------------------------------------------------------
  // 2. RIGHT FOG BANK — Billowing in from the right edge
  // -------------------------------------------------------------
  vec2 pRight = aspectUV * 1.8;
  pRight.x += t * 0.22; // drift inward to the left
  pRight.y -= cos(t * 0.28) * 0.08;

  vec2 qRight = vec2(
    fbm(pRight + vec2(-t * 0.14, t * 0.12)),
    fbm(pRight + vec2(8.5, 2.3) + vec2(t * 0.10, -t * 0.16))
  );
  float rightCurl = fbm(pRight + 2.5 * qRight);

  // Right distance mask: thickest at x=1.0, tapering off as it reaches center (x=0.45)
  float rightFalloff = smoothstep(0.38, 1.0, uv.x);
  float rightFog = rightCurl * rightFalloff * 1.35;

  // -------------------------------------------------------------
  // 3. LOW AMBIENT GROUND MIST
  // -------------------------------------------------------------
  vec2 pGround = aspectUV * 2.2 + vec2(t * 0.08, 0.0);
  float groundCurl = fbm(pGround + vec2(t * 0.05, -t * 0.05));
  float groundFalloff = smoothstep(0.70, 0.05, uv.y) * 0.45;
  float groundMist = groundCurl * groundFalloff;

  // Combine fog sources
  float totalFog = clamp(leftFog + rightFog + groundMist, 0.0, 1.0);

  // Volumetric density shaping: dense organic body + soft drifting edges
  float fogDensity = smoothstep(0.18, 0.72, totalFog);

  // Center relief so central text ("GWD CLUB") remains crystal clear
  vec2 center = vec2(0.5, 0.52);
  float distToCenter = length(uv - center);
  float centerSoftness = smoothstep(0.15, 0.48, distToCenter);
  // Keep some ambient haze in center but avoid obscuring text
  fogDensity *= mix(0.38, 1.0, centerSoftness);

  // -------------------------------------------------------------
  // COLOR GRADING & LIGHT SCATTERING
  // -------------------------------------------------------------
  // Theatrical volumetric colors:
  // Base smoke is visible neutral cool-grey / white vapor
  vec3 smokeWhite = vec3(0.82, 0.84, 0.88);
  vec3 smokeSlate = vec3(0.40, 0.42, 0.46);
  vec3 baseSmoke = mix(smokeSlate, smokeWhite, smoothstep(0.30, 0.70, totalFog));

  // Red glow illumination from central GWD monolith
  float redLightCone = exp(-distToCenter * 2.2);
  vec3 redGlow = vec3(1.0, 0.15, 0.25);

  vec3 finalColor = mix(baseSmoke, redGlow, redLightCone * 0.55);

  // Alpha output (high visibility, rich depth)
  float alpha = clamp(fogDensity * 0.72, 0.0, 0.85);

  gl_FragColor = vec4(finalColor * alpha, alpha);
}
`;

export default function VoidFog() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId;
    let startTime = null;

    const gl =
      canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
      }) || canvas.getContext('experimental-webgl');

    // WebGL Implementation
    if (gl) {
      function compileShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          gl.deleteShader(s);
          return null;
        }
        return s;
      }

      const vs = compileShader(gl.VERTEX_SHADER, VS_CODE);
      const fs = compileShader(gl.FRAGMENT_SHADER, FS_CODE);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

      gl.useProgram(program);

      // Fullscreen quad buffer
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );

      const aPos = gl.getAttribLocation(program, 'a_pos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(program, 'u_res');
      const uTime = gl.getUniformLocation(program, 'u_time');

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      let w = 0;
      let h = 0;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = Math.floor(window.innerWidth * dpr);
        h = Math.floor(window.innerHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      };

      window.addEventListener('resize', resize, { passive: true });
      resize();

      const render = (time) => {
        if (!startTime) startTime = time;
        const elapsed = (time - startTime) * 0.001;

        gl.useProgram(program);
        gl.uniform2f(uRes, w, h);
        gl.uniform1f(uTime, elapsed);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', resize);
        if (animId) cancelAnimationFrame(animId);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(buf);
      };
    } else {
      // 2D Canvas Fallback
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let w = (canvas.width = window.innerWidth);
      let h = (canvas.height = window.innerHeight);

      const resize2D = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resize2D, { passive: true });

      const render2D = (time) => {
        const t = time * 0.001;
        ctx.clearRect(0, 0, w, h);

        // Left fog gradient
        const leftGrad = ctx.createRadialGradient(
          0, h * 0.5 + Math.sin(t * 0.5) * 40, 20,
          w * 0.15, h * 0.5, w * 0.55
        );
        leftGrad.addColorStop(0, 'rgba(190, 195, 205, 0.45)');
        leftGrad.addColorStop(0.5, 'rgba(255, 30, 60, 0.15)');
        leftGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, w * 0.6, h);

        // Right fog gradient
        const rightGrad = ctx.createRadialGradient(
          w, h * 0.5 + Math.cos(t * 0.5) * 40, 20,
          w * 0.85, h * 0.5, w * 0.55
        );
        rightGrad.addColorStop(0, 'rgba(190, 195, 205, 0.45)');
        rightGrad.addColorStop(0.5, 'rgba(255, 30, 60, 0.15)');
        rightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = rightGrad;
        ctx.fillRect(w * 0.4, 0, w * 0.6, h);

        animId = requestAnimationFrame(render2D);
      };

      animId = requestAnimationFrame(render2D);

      return () => {
        window.removeEventListener('resize', resize2D);
        if (animId) cancelAnimationFrame(animId);
      };
    }
  }, []);

  return (
    <div className="void-fog-container" aria-hidden="true">
      {/* Dynamic WebGL / Canvas fog billow */}
      <canvas ref={canvasRef} className="void-fog-canvas" />

      {/* Atmospheric Left & Right CSS Billow Accents (Smooth layered depth) */}
      <div className="fog-billow-bank left-bank" />
      <div className="fog-billow-bank right-bank" />
    </div>
  );
}
