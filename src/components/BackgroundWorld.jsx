import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { onMouse, PARALLAX_GLOW } from '../animations/mouse';
import '../styles/backgroundWorld.css';

/**
 * BackgroundWorld — Cinematic WebGL 3D Journey Engine
 * Transferred directly from HTML Demo Source of Truth
 */

export default function BackgroundWorld({ activeChapter }) {
  const activeChapterRef = useRef(activeChapter);
  useEffect(() => {
    activeChapterRef.current = activeChapter;
  }, [activeChapter]);

  const canvasRef = useRef(null);
  const tagRef = useRef(null);
  const orbitRef = useRef(null);
  const loadRef = useRef(null);
  const lnRef = useRef(null);
  const lbfRef = useRef(null);
  const hintRef = useRef(null);
  const barRef = useRef(null);
  const labRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const sm = (t) => t * t * (3 - 2 * t);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.error('WebGL init error:', e);
      return;
    }

    renderer.setClearColor(0x090506, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 900);

    // Seeded PRNG
    let seedVal = 11;
    const rnd = () => {
      seedVal = (seedVal + 0x6D2B79F5) | 0;
      let t = Math.imul(seedVal ^ (seedVal >>> 15), 1 | seedVal);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const RED = [1, 0.1, 0.24];
    const GRN = [0.08, 0.66, 0.39];
    const pick = (c) => (c ? GRN : RED);

    /* ---------- network data ---------- */
    const N = [];
    const PT = { p: [], s: [], b: [], c: [] };
    const LN = { p: [], b: [], t: [], c: [], w: [], br: [] };

    function node(x, y, z, s, col, b) {
      const i = N.length;
      N.push({ x, y, z });
      PT.p.push(x, y, z);
      PT.s.push(s);
      PT.b.push(b);
      PT.c.push(...pick(col));
      return i;
    }

    function edge(a, b, birth, col, br, w) {
      const A = N[a];
      const B = N[b];
      const c = pick(col);
      LN.p.push(A.x, A.y, A.z, B.x, B.y, B.z);
      LN.b.push(birth, birth);
      LN.t.push(0, 1);
      LN.c.push(c[0], c[1], c[2], c[0], c[1], c[2]);
      LN.w.push(w, w);
      LN.br.push(br, br);
    }

    const root = node(0, 0, 0, 7, 0, 0);
    const HX = [-30, 34, -26, 30, 0];
    const HY = [8, -10, 12, -6, 0];
    const H = [];
    const kids = [];

    for (let k = 0; k < 5; k++) {
      const hb = 0.1 + k * 0.045;
      const hi = node(HX[k], HY[k], -45 * (k + 1), 4.5, 0, hb);
      H.push({ x: HX[k], y: HY[k], z: -45 * (k + 1), i: hi, b: hb });
      edge(k ? H[k - 1].i : root, hi, hb, 0, -1, 1.2);
      const m = 6 + Math.floor(rnd() * 3);
      const mine = [];
      for (let j = 0; j < m; j++) {
        const cb = hb + 0.05 + j * 0.02;
        const ci = node(
          HX[k] + (rnd() - 0.5) * 50,
          HY[k] + (rnd() - 0.5) * 30,
          -45 * (k + 1) + (rnd() - 0.5) * 34,
          2.2,
          rnd() > 0.35 ? 1 : 0,
          cb
        );
        edge(hi, ci, cb, PT.c[ci * 3] < 0.5 ? 1 : 0, k, 1);
        mine.push(ci);
      }
      kids.push(mine);
    }

    kids.forEach((arr, k) => {
      for (let a = 0; a < arr.length; a++) {
        for (let b = a + 1; b < arr.length; b++) {
          const A = N[arr[a]];
          const B = N[arr[b]];
          if (Math.hypot(A.x - B.x, A.y - B.y, A.z - B.z) < 17) {
            edge(arr[a], arr[b], 0.3 + k * 0.04, a % 2, k, 0.45);
          }
        }
      }
    });

    for (let d = 0; d < 420; d++) {
      node(
        (rnd() - 0.5) * 190,
        (rnd() - 0.5) * 110,
        40 - rnd() * 330,
        0.8,
        rnd() > 0.5 ? 1 : 0,
        0.05 + rnd() * 0.3
      );
    }

    const U = {
      uP: { value: 0 },
      uT: { value: 0 },
      uPx: { value: 1 },
      uF: { value: -1 },
      uNet: { value: 0 },
      uI: { value: 0 },
      uD: { value: 0 }
    };

    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(PT.p, 3));
    pg.setAttribute('aSize', new THREE.Float32BufferAttribute(PT.s, 1));
    pg.setAttribute('aBirth', new THREE.Float32BufferAttribute(PT.b, 1));
    pg.setAttribute('aColor', new THREE.Float32BufferAttribute(PT.c, 3));

    const pm = new THREE.ShaderMaterial({
      uniforms: U,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSize;
        attribute float aBirth;
        attribute vec3 aColor;
        uniform float uP, uT, uPx, uNet;
        varying vec3 vC;
        varying float vA;
        void main() {
          float a = clamp((uP - aBirth) / 0.05, 0.0, 1.0);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vA = a * exp(mv.z * 0.0042) * uNet;
          vC = aColor;
          gl_PointSize = aSize * a * uPx * (300.0 / -mv.z) * (1.0 + 0.14 * sin(uT * 2.0 + aBirth * 60.0));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vC;
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float g = smoothstep(0.5, 0.0, d);
          g = g * g * 1.1 + smoothstep(0.1, 0.0, d) * 0.9;
          gl_FragColor = vec4(vC * g * vA, g * vA);
        }
      `
    });
    scene.add(new THREE.Points(pg, pm));

    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(LN.p, 3));
    lg.setAttribute('aBirth', new THREE.Float32BufferAttribute(LN.b, 1));
    lg.setAttribute('aT', new THREE.Float32BufferAttribute(LN.t, 1));
    lg.setAttribute('aColor', new THREE.Float32BufferAttribute(LN.c, 3));
    lg.setAttribute('aW', new THREE.Float32BufferAttribute(LN.w, 1));
    lg.setAttribute('aBr', new THREE.Float32BufferAttribute(LN.br, 1));

    const lm = new THREE.ShaderMaterial({
      uniforms: U,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aBirth, aT, aW, aBr;
        attribute vec3 aColor;
        varying float vB, vT, vW, vBr, vF;
        varying vec3 vC;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vB = aBirth;
          vT = aT;
          vW = aW;
          vBr = aBr;
          vC = aColor;
          vF = exp(mv.z * 0.0042);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform float uP, uF;
        varying float vB, vT, vW, vBr, vF;
        varying vec3 vC;
        void main() {
          float g = clamp((uP - vB) / 0.08, 0.0, 1.0);
          if (vT > g) discard;
          float boost = abs(vBr - uF) < 0.5 ? 2.4 : 1.0;
          float a = min(0.95, 0.34 * vW * boost) * vF;
          gl_FragColor = vec4(vC * a, a);
        }
      `
    });
    scene.add(new THREE.LineSegments(lg, lm));

    /* ---------- opening wordmark particles ---------- */
    let wordPts = null;
    let tStart = null;
    const tagEl = tagRef.current;
    if (tagEl) {
      tagEl.innerHTML = 'EVERY STORY HAS A BEGINNING.'
        .split('')
        .map((c, i) => `<span style="transition-delay:${i * 45}ms">${c === ' ' ? '&nbsp;' : c}</span>`)
        .join('');
    }

    function fitWord() {
      if (wordPts) {
        wordPts.scale.setScalar(Math.min(1, camera.aspect * 1.55));
      }
    }

    function initWord() {
      const cv = document.createElement('canvas');
      cv.width = 1400;
      cv.height = 760;
      const g = cv.getContext('2d');
      g.fillStyle = '#fff';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '900 340px Orbitron, sans-serif';
      g.fillText('GWD', 700, 250);
      g.font = '900 150px Orbitron, sans-serif';
      if ('letterSpacing' in g) g.letterSpacing = '28px';
      g.fillText('CLUB', 714, 560);
      g.font = '600 62px Rajdhani, sans-serif';
      if ('letterSpacing' in g) g.letterSpacing = '34px';
      g.fillText('GET WORK DONE', 717, 704);

      const d = g.getImageData(0, 0, 1400, 760).data;
      const cand = [];
      for (let y = 0; y < 760; y += 2) {
        for (let x = 0; x < 1400; x += 2) {
          if ((y > 650 || (x % 4 === 0 && y % 4 === 0)) && d[(y * 1400 + x) * 4 + 3] > 140) {
            cand.push(x, y);
          }
        }
      }

      const n = Math.min(7000, Math.floor(cand.length / 2));
      const pos = new Float32Array(n * 3);
      const from = new Float32Array(n * 3);
      const seed = new Float32Array(n);
      const col = new Float32Array(n * 3);

      for (let i = 0; i < n; i++) {
        const j = Math.floor(rnd() * (cand.length / 2)) * 2;
        const px = cand[j];
        const py = cand[j + 1];
        pos[i * 3] = ((px - 700) / 700) * 17;
        pos[i * 3 + 1] = -((py - 404) / 700) * 17;
        pos[i * 3 + 2] = (rnd() - 0.5) * 0.6;

        const a = rnd() * 6.283;
        const b = Math.acos(2 * rnd() - 1);
        const r = 90 + rnd() * 160;
        from[i * 3] = r * Math.sin(b) * Math.cos(a);
        from[i * 3 + 1] = r * Math.sin(b) * Math.sin(a) * 0.7;
        from[i * 3 + 2] = r * Math.cos(b) + 20;

        seed[i] = rnd();
        const c = py > 650 ? [0.62, 0.62, 0.66] : py > 470 ? RED : rnd() < 0.18 ? RED : [1, 0.93, 0.94];
        col[i * 3] = c[0];
        col[i * 3 + 1] = c[1];
        col[i * 3 + 2] = c[2];
      }

      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      wg.setAttribute('aFrom', new THREE.BufferAttribute(from, 3));
      wg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
      wg.setAttribute('aCol', new THREE.BufferAttribute(col, 3));

      const wm = new THREE.ShaderMaterial({
        uniforms: U,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute vec3 aFrom;
          attribute float aSeed;
          attribute vec3 aCol;
          uniform float uI, uD, uT, uPx;
          varying vec3 vC;
          varying float vA;
          void main() {
            float e = clamp(uI * 1.5 - aSeed * 0.5, 0.0, 1.0);
            e = 1.0 - pow(1.0 - e, 4.0);
            vec3 m = mix(aFrom, position, e);
            float s = (1.0 - e) * (1.0 - e);
            m.x += sin(aSeed * 20.0 + e * 6.0) * s * 14.0;
            m.y += cos(aSeed * 17.0 + e * 5.0) * s * 14.0;
            m += vec3(sin(uT * 1.3 + aSeed * 40.0), cos(uT * 1.1 + aSeed * 33.0), sin(uT * 0.9 + aSeed * 21.0)) * 0.07 * e;
            vec3 dir = normalize(position + vec3((aSeed - 0.5) * 8.0, (fract(aSeed * 7.0) - 0.5) * 8.0, 3.0));
            m += dir * uD * uD * (30.0 + aSeed * 50.0);
            vec4 mv = modelViewMatrix * vec4(m, 1.0);
            gl_PointSize = (1.1 + aSeed * 1.4) * uPx * (55.0 / -mv.z) * (1.0 + (1.0 - e) * 0.6);
            vA = (0.25 + 0.75 * e) * (1.0 - smoothstep(0.3, 1.0, uD)) * clamp(uI * 20.0, 0.0, 1.0);
            vC = aCol;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying vec3 vC;
          varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float g = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vC * g * vA, g * vA);
          }
        `
      });

      wordPts = new THREE.Points(wg, wm);
      wordPts.frustumCulled = false;
      scene.add(wordPts);
      fitWord();
    }

    const t0 = performance.now();
    function begin() {
      initWord();
      tStart = Math.max(performance.now(), t0 + 1500) - (reduce ? 9000 : 0);
    }

    Promise.race([
      document.fonts && document.fonts.load
        ? Promise.all([document.fonts.load('900 100px Orbitron'), document.fonts.load('600 60px Rajdhani')])
        : Promise.resolve(),
      new Promise((r) => setTimeout(r, 1800))
    ]).then(begin, begin);

    // Fast-forward on click
    const fastForward = () => {
      if (tStart == null) {
        begin();
      }
      tStart = Math.min(tStart, performance.now() - 6200);
    };
    window.addEventListener('click', fastForward, { passive: true });
    window.addEventListener('keydown', fastForward, { passive: true });
    window.addEventListener('touchstart', fastForward, { passive: true });

    let mx = 0, my = 0, mxT = 0, myT = 0;
    const onMouseMove = (e) => {
      mxT = e.clientX / window.innerWidth - 0.5;
      myT = -(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    /* ---------- background nebula sky ---------- */
    const SU = { uT: { value: 0 }, uTint: { value: new THREE.Vector3(1, 0.1, 0.24) } };
    const tintT = [RED, GRN, RED, GRN, [0.6, 0.2, 0.3]];
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(500, 32, 16),
      new THREE.ShaderMaterial({
        uniforms: SU,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        vertexShader: `
          varying vec3 vD;
          void main() {
            vD = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vD;
          uniform float uT;
          uniform vec3 uTint;
          float h(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
          }
          float n(vec3 x) {
            vec3 i = floor(x), f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
              mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y),
              f.z
            );
          }
          float fbm(vec3 p) {
            float a = 0.5, s = 0.0;
            for (int i = 0; i < 4; i++) {
              s += a * n(p);
              p *= 2.02;
              a *= 0.5;
            }
            return s;
          }
          void main() {
            vec3 d = normalize(vD);
            float c = smoothstep(0.34, 0.86, fbm(d * 2.3 + vec3(uT * 0.012, 0.0, uT * 0.007)));
            float c2 = smoothstep(0.4, 0.9, fbm(d * 5.0 + 7.0 + uT * 0.01));
            vec3 col = vec3(0.032, 0.015, 0.019) + uTint * (c * 0.2 + c2 * 0.07);
            vec3 g = d * 650.0;
            float st = h(floor(g));
            float dd = length(fract(g) - 0.5);
            st = step(0.992, st) * smoothstep(0.38, 0.0, dd) * (0.55 + 0.45 * sin(uT * 2.0 + st * 90.0));
            col += vec3(st) * 0.7;
            gl_FragColor = vec4(col, 1.0);
          }
        `
      })
    );
    sky.renderOrder = -1;
    sky.frustumCulled = false;
    scene.add(sky);

    /* ---------- camera path ---------- */
    const kf = [
      [0, [0, 0, 26], [0, 0, 0]],
      [0.1, [0, 0, 26], [0, 0, 0]],
      [0.32, [58, 32, 62], [0, 0, -120]]
    ];
    let SH = 9;
    H.forEach((h, k) => {
      const c = 0.4175 + k * 0.115;
      const s = k % 2 ? 1 : -1;
      const cp = [h.x, h.y + 2, h.z + 36];
      const lk = [h.x, h.y, h.z];
      kf.push([c - 0.035, cp, lk, s], [c + 0.035, cp, lk, s]);
    });
    kf.push([0.95, [0, 26, 250], [0, 0, -120]], [1, [0, 26, 250], [0, 0, -120]]);

    const cpos = new THREE.Vector3();
    const clook = new THREE.Vector3();

    function path(p) {
      for (let i = 0; i < kf.length - 1; i++) {
        const A = kf[i];
        const B = kf[i + 1];
        if (p >= A[0] && p <= B[0]) {
          const t = sm((p - A[0]) / (B[0] - A[0] || 1));
          cpos.set(
            A[1][0] + (B[1][0] - A[1][0]) * t,
            A[1][1] + (B[1][1] - A[1][1]) * t,
            A[1][2] + (B[1][2] - A[1][2]) * t
          );
          clook.set(
            A[2][0] + (B[2][0] - A[2][0]) * t,
            A[2][1] + (B[2][1] - A[2][1]) * t,
            A[2][2] + (B[2][2] - A[2][2]) * t
          );
          const sx = (A[3] || 0) + ((B[3] || 0) - (A[3] || 0)) * t;
          cpos.x += sx * SH;
          clook.x += sx * SH;
          return;
        }
      }
    }

    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 1 ? 78 : 55;
      camera.updateProjectionMatrix();
      U.uPx.value = (dpr * h) / 900;
      SH = w / h < 1 ? 0 : 9;
      fitWord();
    }
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial lock for cinematic opening
    document.documentElement.classList.add('lock');

    let cur = 0;
    let igDone = false;
    let unlocked = false;
    let animId = null;
    const titles = ['03 — THE PEOPLE', '06 — THE CORE TEAM', '08 — THE EVENTS', '10 — THE MEMORIES', '13 — THE FUTURE'];

    function frame(now) {
      // Pause rendering when tab is hidden — saves GPU
      if (document.hidden) {
        animId = requestAnimationFrame(frame);
        return;
      }

      animId = requestAnimationFrame(frame);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      cur += (window.scrollY - cur) * (reduce ? 1 : 0.07);
      const p = clamp(cur / max, 0, 1);
      const t = reduce ? 0 : (now - t0) / 1000;

      const ti = tStart == null ? 0 : Math.max(0, (now - tStart) / 1000);
      U.uI.value = clamp((ti - 0.5) / 3.8, 0, 1);

      // Hero scroll dissolution: dissolves swiftly as user leaves hero so no text overlap occurs
      const heroDissolve = clamp(cur / (window.innerHeight * 0.42), 0, 1);
      U.uD.value = sm(heroDissolve);

      // Stop rendering hero particle points completely when dissolved (cull geometry)
      if (wordPts) {
        wordPts.visible = (heroDissolve < 0.98);
      }

      const ee = clamp((p - 0.955) / 0.04, 0, 1);
      U.uNet.value = clamp((p - 0.02) / 0.08, 0, 1) * (1 - 0.55 * ee);

      // Loading counter & progress bar
      const lp = clamp((now - t0) / 1500, 0, 1);
      if (lnRef.current) lnRef.current.textContent = ('00' + Math.round(lp * 100)).slice(-3);
      if (lbfRef.current) lbfRef.current.style.transform = `scaleX(${lp})`;
      if (lp >= 1 && loadRef.current) loadRef.current.classList.add('done');

      // Ignition bursts
      if (tStart != null && ti > 0.5 && !igDone) {
        igDone = true;
        document.body.classList.add('ig');
      }

      // Tagline typewriter & orbit ring shrink
      if (tagRef.current) {
        if (ti > 4.4) tagRef.current.classList.add('on');
        tagRef.current.classList.toggle('gone', heroDissolve > 0.12);
      }
      if (orbitRef.current) {
        orbitRef.current.classList.toggle('on', ti > 2.2 && heroDissolve < 0.08);
        orbitRef.current.classList.toggle('gone', heroDissolve >= 0.08);
      }

      // Unlock scroll
      if (ti > 6 && !unlocked) {
        unlocked = true;
        document.documentElement.classList.remove('lock');
        document.body.classList.add('open');
      }

      // Cursor lag — feed global mouse coords into existing mxT/myT lerp system
      if (window.__mouseClientX != null) {
        mxT = (window.__mouseClientX / window.innerWidth)  * 2 - 1;
        myT = (window.__mouseClientY / window.innerHeight) * 2 - 1;
      }
      mx += (mxT - mx) * 0.05;
      my += (myT - my) * 0.05;

      // Update camera
      path(p);
      camera.position.copy(cpos);
      if (!reduce) {
        camera.position.x += Math.sin(t * 0.4) * 0.35;
        camera.position.y += Math.cos(t * 0.33) * 0.25;
      }
      const mw = 1 - clamp(p / 0.1, 0, 1);
      camera.position.x += mx * 1.8 * mw;
      camera.position.y += my * 1.1 * mw;
      camera.lookAt(clook);

      // Uniforms
      let fb = -1;
      for (let k = 0; k < 5; k++) {
        if (Math.abs(p - (0.4175 + k * 0.115)) < 0.0575) fb = k;
      }
      U.uP.value = p;
      U.uT.value = t;
      U.uF.value = fb;

      // Sky nebula tint based on activeChapterRef
      let targetTint = RED;
      const ch = activeChapterRef.current;
      if (ch === '06' || ch === '07' || ch === 'core-team' || ch === 'members') {
        targetTint = GRN;
      } else if (ch === '10' || ch === 'memories') {
        targetTint = [0.18, 0.32, 0.68];
      } else if (ch === 'future' || ch === 'achievements') {
        targetTint = [0.90, 0.12, 0.26];
      } else if (fb >= 0) {
        targetTint = tintT[fb];
      } else {
        targetTint = RED;
      }

      const tv = SU.uTint.value;
      tv.x += (targetTint[0] - tv.x) * 0.03;
      tv.y += (targetTint[1] - tv.y) * 0.03;
      tv.z += (targetTint[2] - tv.z) * 0.03;
      SU.uT.value = t;
      sky.position.copy(camera.position);

      // HUD elements
      if (hintRef.current) {
        hintRef.current.style.opacity = `${(ti > 5.8 ? 1 : 0) * (1 - clamp(p / 0.05, 0, 1))}`;
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
      if (labRef.current) {
        labRef.current.textContent =
          p < 0.13
            ? '00 — THE VOID'
            : p < 0.36
            ? '01 — THE BEGINNING'
            : p >= 0.945
            ? 'GWD CLUB'
            : titles[Math.min(4, Math.floor((p - 0.36) / 0.115))];
      }

      renderer.render(scene, camera);
    }

    animId = requestAnimationFrame(frame);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', fastForward);
      window.removeEventListener('keydown', fastForward);
      window.removeEventListener('mousemove', onMouseMove);
      document.documentElement.classList.remove('lock');
      document.body.classList.remove('ig', 'open');
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="gl-background-canvas" aria-hidden="true" />
      <div className="vig" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="bar" ref={barRef} aria-hidden="true" />
      <div className="flash" aria-hidden="true" />
      <div className="flare" aria-hidden="true" />
      <div className="shock" aria-hidden="true" />
      <div className="dot" aria-hidden="true" />
      <div className="tag" ref={tagRef} aria-hidden="true" />
      <div className="orbit" ref={orbitRef} aria-hidden="true" />
      <div className="lbx t" aria-hidden="true" />
      <div className="lbx b" aria-hidden="true" />
      <div className="load" ref={loadRef} aria-hidden="true">
        <span className="lt">LOADING ARCHIVE</span>
        <span className="ln" ref={lnRef}>000</span>
        <div className="lp">
          <i ref={lbfRef} />
        </div>
      </div>
      <header className="hud" aria-hidden="true">
        <span>GWD // ARCHIVE</span>
        <span ref={labRef}>00 — THE VOID</span>
      </header>
      <div className="hint" ref={hintRef} aria-hidden="true">
        <div className="mouse">
          <i />
        </div>
        SCROLL TO ENTER
      </div>
    </>
  );
}
