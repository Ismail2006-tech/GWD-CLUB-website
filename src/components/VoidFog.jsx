import React, { useEffect, useRef } from 'react';
import '../styles/voidFog.css';

/**
 * VoidFog — Cinematic Dual-Side Volumetric Atmospheric Fog System
 * Chapter 00 (Hero / First Page)
 * 
 * Delivers visible, dramatic, cinematic rolling smoke and fog
 * billowing in from BOTH the LEFT and RIGHT sides of the screen.
 * 
 * Features:
 * - High-density Left Fog Plume: curling inward toward center
 * - High-density Right Fog Plume: counter-rolling inward toward center
 * - Central volumetric crimson lighting scatter
 * - Floating atmospheric embers / dust particles
 * - Dual-layer rendering: WebGL GPU shader + hardware-accelerated CSS clouds
 * - 100% non-blocking (pointer-events: none)
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

// Fast pseudo-random hash
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

// 4-octave Fractional Brownian Motion (FBM) with rotation
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    v += a * (noise(p) * 0.5 + 0.5);
    p = rot * p * 2.04;
    a *= 0.50;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 aspectUV = uv;
  aspectUV.x *= u_res.x / u_res.y;

  float t = u_time * 0.16;

  // -------------------------------------------------------------
  // 1. LEFT VOLUMETRIC FOG BANK — Billowing in from left boundary
  // -------------------------------------------------------------
  vec2 pLeft = aspectUV * 1.5;
  pLeft.x -= t * 0.28; // flows inward to right
  pLeft.y += sin(t * 0.35) * 0.12;

  vec2 qLeft = vec2(
    fbm(pLeft + vec2(t * 0.20, -t * 0.14)),
    fbm(pLeft + vec2(3.1, 7.4) + vec2(-t * 0.16, t * 0.18))
  );
  vec2 rLeft = vec2(
    fbm(pLeft + 3.0 * qLeft + vec2(1.7, 9.2) + vec2(t * 0.15, -t * 0.20)),
    fbm(pLeft + 3.0 * qLeft + vec2(8.3, 2.8) + vec2(-t * 0.18, t * 0.15))
  );
  float leftCurl = fbm(pLeft + 2.6 * rLeft);
  
  // Left bank reach: dense at edge (x=0.0), rolling in past x=0.55
  float leftFalloff = smoothstep(0.68, 0.02, uv.x);
  float leftFog = leftCurl * leftFalloff * 1.75;

  // -------------------------------------------------------------
  // 2. RIGHT VOLUMETRIC FOG BANK — Billowing in from right boundary
  // -------------------------------------------------------------
  vec2 pRight = aspectUV * 1.5;
  pRight.x += t * 0.28; // flows inward to left
  pRight.y -= cos(t * 0.32) * 0.12;

  vec2 qRight = vec2(
    fbm(pRight + vec2(-t * 0.18, t * 0.15)),
    fbm(pRight + vec2(8.5, 2.3) + vec2(t * 0.14, -t * 0.20))
  );
  vec2 rRight = vec2(
    fbm(pRight + 3.0 * qRight + vec2(2.5, 4.8) + vec2(-t * 0.16, t * 0.18)),
    fbm(pRight + 3.0 * qRight + vec2(6.1, 3.7) + vec2(t * 0.18, -t * 0.14))
  );
  float rightCurl = fbm(pRight + 2.6 * rRight);

  // Right bank reach: dense at edge (x=1.0), rolling in past x=0.45
  float rightFalloff = smoothstep(0.32, 0.98, uv.x);
  float rightFog = rightCurl * rightFalloff * 1.75;

  // -------------------------------------------------------------
  // 3. LOW AMBIENT FLOATING MIST
  // -------------------------------------------------------------
  vec2 pGround = aspectUV * 2.0 + vec2(t * 0.10, 0.0);
  float groundCurl = fbm(pGround + vec2(t * 0.08, -t * 0.06));
  float groundFalloff = smoothstep(0.75, 0.08, uv.y) * 0.65;
  float groundMist = groundCurl * groundFalloff;

  // Combine plumes
  float totalFog = clamp(leftFog + rightFog + groundMist, 0.0, 1.4);

  // Volumetric density threshold: strong presence, defined organic plumes
  float fogDensity = smoothstep(0.12, 0.65, totalFog);

  // Center relief around the monolith text ("GWD CLUB")
  vec2 center = vec2(0.5, 0.52);
  float distToCenter = length(uv - center);
  float textRelief = smoothstep(0.16, 0.46, distToCenter);
  // Keep atmospheric haze across the monolith without blocking letterforms
  fogDensity *= mix(0.42, 1.0, textRelief);

  // -------------------------------------------------------------
  // VOLUMETRIC COLOR & CINEMATIC LIGHTING
  // -------------------------------------------------------------
  // Core smoke colors: rich cinema slate-white
  vec3 smokeBright = vec3(0.92, 0.93, 0.96);
  vec3 smokeMid    = vec3(0.55, 0.57, 0.62);
  vec3 smokeShadow = vec3(0.18, 0.19, 0.22);

  float lightFactor = smoothstep(0.25, 0.75, totalFog);
  vec3 smokeBody = mix(smokeShadow, smokeMid, lightFactor);
  smokeBody = mix(smokeBody, smokeBright, smoothstep(0.60, 0.95, totalFog) * 0.85);

  // Crimson ambient glow scattering from central GWD monolith
  float redLightScattering = exp(-distToCenter * 2.4);
  vec3 crimsonGlow = vec3(1.0, 0.12, 0.22);
  vec3 finalColor = mix(smokeBody, crimsonGlow, redLightScattering * 0.65);

  // Highlight rim on smoke edges
  float rim = smoothstep(0.40, 0.65, totalFog) * (1.0 - smoothstep(0.65, 0.90, totalFog));
  finalColor += crimsonGlow * rim * 0.25;

  // Clean alpha
  float alpha = clamp(fogDensity * 0.88, 0.0, 0.92);

  gl_FragColor = vec4(finalColor, alpha);
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
        premultipliedAlpha: false,
        antialias: false,
        depth: false,
        powerPreference: 'high-performance',
      }) ||
      canvas.getContext('experimental-webgl', {
        alpha: true,
        premultipliedAlpha: false,
      });

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
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

        // Left rolling smoke plume
        const leftGrad = ctx.createRadialGradient(
          0, h * 0.5 + Math.sin(t * 0.6) * 60, 40,
          w * 0.22, h * 0.5, w * 0.60
        );
        leftGrad.addColorStop(0, 'rgba(215, 220, 230, 0.65)');
        leftGrad.addColorStop(0.4, 'rgba(160, 168, 180, 0.38)');
        leftGrad.addColorStop(0.75, 'rgba(255, 30, 60, 0.18)');
        leftGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, w * 0.65, h);

        // Right rolling smoke plume
        const rightGrad = ctx.createRadialGradient(
          w, h * 0.5 + Math.cos(t * 0.5) * 60, 40,
          w * 0.78, h * 0.5, w * 0.60
        );
        rightGrad.addColorStop(0, 'rgba(215, 220, 230, 0.65)');
        rightGrad.addColorStop(0.4, 'rgba(160, 168, 180, 0.38)');
        rightGrad.addColorStop(0.75, 'rgba(255, 30, 60, 0.18)');
        rightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = rightGrad;
        ctx.fillRect(w * 0.35, 0, w * 0.65, h);

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
      {/* 1. Hardware-Accelerated Dynamic WebGL Smoke Plumes (Left & Right) */}
      <canvas ref={canvasRef} className="void-fog-canvas" />

      {/* 2. Deep Volumetric Organic Billow Clouds (Left Bank & Right Bank) */}
      <div className="fog-billow-bank left-bank" />
      <div className="fog-billow-bank right-bank" />

      {/* 3. Secondary Rolling Vapor Streams */}
      <div className="fog-stream-wisp left-wisp" />
      <div className="fog-stream-wisp right-wisp" />

      {/* 4. Cinematic Embers & Atmospheric Motes Drifting */}
      <div className="fog-cinematic-motes">
        <span className="mote mote-1" />
        <span className="mote mote-2" />
        <span className="mote mote-3" />
        <span className="mote mote-4" />
        <span className="mote mote-5" />
        <span className="mote mote-6" />
      </div>
    </div>
  );
}
