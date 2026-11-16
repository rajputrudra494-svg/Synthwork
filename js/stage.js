/* ==========================================================
   SYNTHWORKS — stage.js
   One fixed WebGL canvas behind the whole page.

   Layers (drawn in this order):
   1. Atmosphere — folds of coloured light (flare, volt, iris), drawn
                   small and upscaled with grain. Dims and greys
                   chapter by chapter.
   2. Rings      — the contact chapter: a ringing signal.
   3. Motes      — specks of light drifting in depth.
   4. Mark       — the S as three glowing tubes, one per channel.
   5. Sea        — the problem chapter: hundreds of identical grey
                   template pages; one of them becomes the mark.
   6. Proof      — the 13 project screenshots as DOM-synced planes
                   whose colour channels snap into register.
   ========================================================== */
import * as THREE from 'three';

const C_FLARE = new THREE.Vector3(1.0, 0.353, 0.212);
const C_VOLT = new THREE.Vector3(0.169, 0.894, 0.627);
const C_IRIS = new THREE.Vector3(0.435, 0.294, 1.0);

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

/* ---------------- shaders ---------------- */

const ATMOS_FRAG = /* glsl */ `
  // flowing folds of coloured light: domain-warped noise, rendered small and upscaled
  uniform vec2 uRes, uMouse;
  uniform float uTime, uBright, uGrey, uMouseOn, uVel, uWarm;
  uniform vec3 uC0, uC1, uC2;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < OCTAVES; i++) { v += a * noise(p); p = r * p * 2.03 + 11.7; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.045;

    // the pointer stirs the light
    vec2 m = uMouse * 0.5 * vec2(aspect, 1.0);
    vec2 dm = p - m;
    p += dm * exp(-dot(dm, dm) * 6.0) * 0.35 * uMouseOn;

    vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, -t)));
    vec2 r = vec2(fbm(p * 1.5 + 2.2 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p * 1.5 + 2.2 * q + vec2(8.3, 2.8) - t * 1.1));
    float f = fbm(p * 1.1 + 2.6 * r + uVel * 0.3);

    // thin bright ridges where the field folds over itself
    float folds = pow(1.0 - abs(sin(f * 9.0 + t * 3.0)), 7.0);
    float sheet = smoothstep(0.22, 0.88, f);

    vec3 col = mix(uC2, uC0, smoothstep(0.25, 0.75, q.x + uWarm * 0.25));
    col = mix(col, uC1, smoothstep(0.45, 0.9, r.y) * 0.65);
    vec3 c = col * (sheet * sheet * 0.95 + folds * 1.25 * sheet + 0.05);

    // keep it deep: vignette, and a darker floor where body copy sits
    float vig = smoothstep(1.6, 0.1, length(p * vec2(0.7, 1.0)));
    c *= vig * mix(0.55, 1.0, smoothstep(0.0, 0.45, uv.y));
    c = mix(c, vec3(dot(c, vec3(0.3, 0.45, 0.25))), uGrey);
    gl_FragColor = vec4(c * uBright, 1.0);
  }
`;

const COMPOSE_FRAG = /* glsl */ `
  // upscale the soft field and add fine moving grain at full resolution
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform float uTime;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    vec3 c = texture2D(uTex, uv).rgb;
    float g = hash(gl_FragCoord.xy + fract(uTime * 7.0) * 97.0) - 0.5;
    c += g * 0.035;
    gl_FragColor = vec4(max(c, 0.0), 1.0);
  }
`;

const MOTES_VERT = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aCol;
  uniform float uTime, uDpr, uScroll;
  varying vec3 vCol;
  varying float vTw;
  void main() {
    vec3 p = position;
    p.y += mod(uTime * (0.05 + aSeed * 0.12) + aSeed * 40.0 + uScroll * (0.4 + aSeed), 16.0) - 8.0;
    p.x += sin(uTime * 0.3 + aSeed * 30.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float near = smoothstep(0.5, 3.0, -mv.z);
    gl_PointSize = (3.5 + aSeed * 12.0) * uDpr * (10.0 / -mv.z) * near;
    vCol = aCol;
    vTw = 0.55 + 0.45 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 50.0);
  }
`;

const MOTES_FRAG = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vCol;
  varying float vTw;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vCol * a * vTw * uAlpha, 1.0);
  }
`;

const QUAD_VERT = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const RINGS_FRAG = /* glsl */ `
  uniform vec2 uRes, uCenter;
  uniform float uTime, uRing;
  uniform vec3 uC0, uC1, uC2;
  float ring(float d) {
    return pow(max(0.0, sin(d * 30.0 - uTime * 2.2)), 90.0) * exp(-d * 1.5);
  }
  void main() {
    float d = distance(gl_FragCoord.xy, uCenter) / uRes.y;
    vec3 col = uC0 * ring(d + 0.004) + uC1 * ring(d) + uC2 * ring(d - 0.004);
    gl_FragColor = vec4(col * 0.64 * uRing, 1.0);
  }
`;

const SEA_VERT = /* glsl */ `
  attribute vec3 aPos;
  attribute float aSeed;
  attribute float aScale;
  uniform float uTime;
  uniform vec2 uHeroOff;
  varying vec2 vUv;
  varying float vDepth, vSeed;
  void main() {
    vUv = uv;
    float r = aSeed < 0.0 ? 0.0 : (aSeed - 0.5) * 0.5;
    vec2 p = position.xy * aScale;
    p = mat2(cos(r), -sin(r), sin(r), cos(r)) * p;
    vec3 w = aPos + vec3(p, 0.0);
    if (aSeed < 0.0) w.xy += uHeroOff;
    if (aSeed >= 0.0) w.y += sin(uTime * 0.4 + aSeed * 20.0) * 0.08;
    vec4 mv = viewMatrix * vec4(w, 1.0);
    vDepth = -mv.z;
    vSeed = aSeed;
    gl_Position = projectionMatrix * mv;
    // pages right at the lens (huge overdraw) or lost in the fog are skipped entirely
    if (aSeed >= 0.0) {
      vec4 c = viewMatrix * vec4(aPos, 1.0);
      if (-c.z < 1.4 || -c.z > 62.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    }
  }
`;

const SEA_FRAG = /* glsl */ `
  uniform float uAlpha, uLight, uLock, uTime;
  uniform vec3 uC0, uC1, uC2;
  varying vec2 vUv;
  varying float vDepth, vSeed;

  float box(vec2 p, vec2 c, vec2 h) {
    vec2 d = abs(p - c) - h;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }
  float fillB(float d, float fw) { return 1.0 - smoothstep(0.0, fw, d); }
  float lineB(float d, float w, float fw) { return 1.0 - smoothstep(w, w + fw, abs(d)); }

  // the same template everybody uses: nav, headline, button, image, three cards
  float templatePage(vec2 P, float fw, float withHeadline) {
    float v = lineB(box(P, vec2(8.0, 10.0), vec2(7.8, 9.8)), 0.06, fw);
    v = max(v, fillB(box(P, vec2(8.0, 1.6), vec2(7.2, 0.04)), fw));
    v = max(v, fillB(box(P, vec2(1.8, 0.9), vec2(0.6, 0.3)), fw));
    v = max(v, withHeadline * fillB(box(P, vec2(6.0, 4.2), vec2(5.0, 0.55)), fw) * 0.8);
    v = max(v, withHeadline * fillB(box(P, vec2(5.0, 5.7), vec2(4.0, 0.55)), fw) * 0.8);
    v = max(v, withHeadline * lineB(box(P, vec2(3.2, 7.4), vec2(1.6, 0.45)), 0.05, fw));
    v = max(v, lineB(box(P, vec2(8.0, 11.4), vec2(7.2, 2.2)), 0.05, fw) * 0.7);
    v = max(v, lineB(box(P, vec2(2.9, 16.4), vec2(2.1, 2.0)), 0.05, fw));
    v = max(v, lineB(box(P, vec2(8.0, 16.4), vec2(2.1, 2.0)), 0.05, fw));
    v = max(v, lineB(box(P, vec2(13.1, 16.4), vec2(2.1, 2.0)), 0.05, fw));
    return v;
  }

  // the Synthworks mark: two three-quarter arcs (viewBox 64, stroke 10)
  float mark(vec2 m, float fw) {
    vec2 a = m - vec2(32.0, 20.0);
    float ra = abs(length(a) - 12.0) - 5.0;
    if (a.x > 0.0 && a.y > 0.0) ra = 1e3;
    vec2 b = m - vec2(32.0, 44.0);
    float rb = abs(length(b) - 12.0) - 5.0;
    if (b.x < 0.0 && b.y < 0.0) rb = 1e3;
    return 1.0 - smoothstep(0.0, fw, min(ra, rb));
  }

  void main() {
    vec2 P = vec2(vUv.x * 16.0, (1.0 - vUv.y) * 20.0);
    float fw = fwidth(P.x) * 1.2;
    float fog = exp(-vDepth * 0.032) * smoothstep(0.6, 3.0, vDepth);

    if (vSeed < 0.0) {
      // the one page that is not a template
      float frame = templatePage(P, fw, 0.0);
      vec2 M = (P - vec2(2.0, 3.6)) * (64.0 / 12.0);
      float mfw = fw * (64.0 / 12.0);
      vec2 off = vec2(1.0, 0.35) * (1.0 - uLock) * 9.0;
      vec3 col = uC0 * mark(M + off, mfw) + uC1 * mark(M, mfw) + uC2 * mark(M - off, mfw);
      vec3 c = vec3(0.22) * frame * (1.0 - uLight * 0.4) + col * 0.7 * uLight;
      gl_FragColor = vec4(c * uAlpha * smoothstep(0.6, 3.0, vDepth), 1.0);
      return;
    }

    float flick = 0.75 + 0.25 * sin(uTime * (1.0 + vSeed * 3.0) + vSeed * 40.0);
    float v = templatePage(P, fw, 1.0);
    vec3 c = vec3(0.26) * v * fog * flick * (1.0 - uLight * 0.82);
    gl_FragColor = vec4(c * uAlpha, 1.0);
  }
`;

const MARK_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const MARK_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha, uTime;
  varying vec3 vN;
  varying vec3 vV;
  varying vec2 vUv;
  void main() {
    float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.6);
    // pulses of signal travel along the stroke
    float pulse = pow(max(0.0, sin(vUv.x * 38.0 - uTime * 3.2)), 18.0);
    float body = 0.16 + 0.95 * fres + 0.55 * pulse;
    gl_FragColor = vec4(uColor * body * uAlpha, 1.0);
  }
`;

const PLANE_VERT = /* glsl */ `
  uniform float uVel, uTilt, uReveal;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    // cards roll over a drum: the edge further from the screen centre narrows
    float down = max(uTilt, 0.0);
    float up = max(-uTilt, 0.0);
    float squeeze = down * 0.22 * uv.y + up * 0.22 * (1.0 - uv.y);
    p.x *= 1.0 - squeeze;
    p.y *= 1.0 - abs(uTilt) * 0.08;
    p.xy *= mix(0.82, 1.0, uReveal);
    p.y += sin(uv.x * 3.14159) * uVel * 0.035;
    vShade = 1.0 - abs(uTilt) * 0.55;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const PLANE_FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uReveal, uHover, uVel;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vec2 uv = vUv;
    vec2 dm = (uv - uMouse) * vec2(1.6, 1.0);
    float lens = exp(-dot(dm, dm) * 16.0) * uHover;
    uv -= (uv - uMouse) * lens * 0.14;

    float sp = (1.0 - uReveal) * 0.08 + min(abs(uVel), 1.5) * 0.012 + lens * 0.018;
    vec2 dir = vec2(1.0, 0.25);
    float thr = vUv.y * 0.7;
    float aR = smoothstep(thr, thr + 0.25, uReveal * 1.18);
    float aG = smoothstep(thr, thr + 0.25, uReveal * 1.18 - 0.06);
    float aB = smoothstep(thr, thr + 0.25, uReveal * 1.18 - 0.12);
    float r = texture2D(uTex, clamp(uv + dir * sp, 0.0, 1.0)).r;
    float g = texture2D(uTex, clamp(uv, 0.0, 1.0)).g;
    float b = texture2D(uTex, clamp(uv - dir * sp, 0.0, 1.0)).b;
    gl_FragColor = vec4(vec3(r * aR, g * aG, b * aB) * vShade, 1.0);
  }
`;

/* ---------------- the stage ---------------- */

export function createStage(canvas, { tier = 'high', reduce = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 1);
  renderer.autoClear = false;
  const dprCap = tier === 'high' ? 1.75 : tier === 'mid' ? 1.4 : 1;
  // pixel budget: big screens on integrated GPUs are fill-rate bound, so cap the buffer size
  const budget = tier === 'high' ? 1.7e6 : tier === 'mid' ? 1.0e6 : 0.6e6;
  let quality = 1; // dynamic resolution, lowered if frames run slow
  let ema = 16;
  let lastAdapt = 0;

  const size = { w: innerWidth, h: innerHeight, dpr: 1 };
  const pointer = { x: 0, y: 0, on: 0, onT: 0 };
  const S = { amp: 1, bright: 1, grey: 0, flat: 0, ring: 0, split: 1.6, lockT: 1.6, sea: 0, light: 0, lock: 0 };
  const mk = { rx: 0, ry: 0 };
  const rc = { x: -1, y: -1 };   // ring centre (css px), eased
  let ringEl = null;            // a hovered phone number pulls the rings to itself
  let ringBoost = 0;
  let ringTime = 0;
  let time = 0;
  let vel = 0;
  let dirty = true;

  const colours = { uC0: { value: C_FLARE }, uC1: { value: C_VOLT }, uC2: { value: C_IRIS } };
  const additive = { transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false };
  const quadGeo = new THREE.PlaneGeometry(2, 2);

  /* ---- 1. atmosphere: drawn into a small target, then upscaled with grain ---- */
  const atmosScale = tier === 'high' ? 0.5 : tier === 'mid' ? 0.4 : 0.3;
  const atmosRT = new THREE.WebGLRenderTarget(16, 16, { depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const atmosMat = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: ATMOS_FRAG,
    defines: { OCTAVES: tier === 'low' ? 3 : tier === 'mid' ? 4 : 5 },
    uniforms: {
      ...colours,
      uRes: { value: new THREE.Vector2() }, uMouse: { value: new THREE.Vector2() },
      uTime: { value: 0 }, uBright: { value: 1 }, uGrey: { value: 0 }, uMouseOn: { value: 0 }, uVel: { value: 0 }, uWarm: { value: 0 },
    },
    depthTest: false,
    depthWrite: false,
  });
  const atmosMesh = new THREE.Mesh(quadGeo, atmosMat);
  atmosMesh.frustumCulled = false;
  const atmosScene = new THREE.Scene();
  atmosScene.add(atmosMesh);

  const composeMat = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: COMPOSE_FRAG,
    uniforms: { uTex: { value: atmosRT.texture }, uRes: { value: new THREE.Vector2() }, uTime: { value: 0 } },
    depthTest: false,
    depthWrite: false,
  });
  const composeMesh = new THREE.Mesh(quadGeo, composeMat);
  composeMesh.frustumCulled = false;

  /* ---- 2. rings ---- */
  const ringMat = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: RINGS_FRAG,
    uniforms: { ...colours, uRes: { value: new THREE.Vector2() }, uCenter: { value: new THREE.Vector2() }, uTime: { value: 0 }, uRing: { value: 0 } },
    ...additive,
  });
  const ringMesh = new THREE.Mesh(quadGeo, ringMat);
  ringMesh.frustumCulled = false;

  const flatScene = new THREE.Scene();
  flatScene.add(composeMesh, ringMesh);
  const flatCam = new THREE.Camera();

  /* ---- 2b. the mark in 3D: two arcs as glowing tubes, one copy per channel ---- */
  const markPts = [];
  const toV = (px, py) => new THREE.Vector3((px - 32) / 12, -(py - 32) / 12, 0);
  const ARC_N = 48;
  for (let i = 0; i <= ARC_N; i++) { const t = -(i / ARC_N) * 1.5 * Math.PI; markPts.push(toV(32 + 12 * Math.cos(t), 20 + 12 * Math.sin(t))); }
  for (let i = 1; i <= ARC_N; i++) { const t = -Math.PI / 2 + (i / ARC_N) * 1.5 * Math.PI; markPts.push(toV(32 + 12 * Math.cos(t), 44 + 12 * Math.sin(t))); }
  const markCurve = new THREE.CatmullRomCurve3(markPts, false, 'centripetal');
  const markGeo = new THREE.TubeGeometry(markCurve, tier === 'low' ? 140 : 260, 0.36, tier === 'low' ? 10 : 18, false);
  const markScene = new THREE.Scene();
  const markGroup = new THREE.Group();
  markScene.add(markGroup);
  const markCopies = [C_FLARE, C_VOLT, C_IRIS].map((c, i) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: MARK_VERT,
      fragmentShader: MARK_FRAG,
      uniforms: { uColor: { value: c.clone().multiplyScalar(0.64) }, uAlpha: { value: 1 }, uTime: { value: 0 } },
      ...additive,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(markGeo, mat);
    m.userData.dir = [new THREE.Vector3(-0.9, 0.25, 0.3), new THREE.Vector3(0.8, 0.35, -0.2), new THREE.Vector3(0.1, -0.85, 0.4)][i];
    markGroup.add(m);
    return m;
  });
  const markCam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  markCam.position.set(0, 0, 10);
  const markLayout = { x: 2.4, y: -0.2, s: 0.9 };

  /* ---- 2c. motes: specks of light drifting in depth through every dark chapter ---- */
  const MOTES = tier === 'high' ? 1400 : tier === 'mid' ? 800 : 400;
  const mPos = new Float32Array(MOTES * 3);
  const mSeed = new Float32Array(MOTES);
  const mCol = new Float32Array(MOTES * 3);
  const PAL = [C_FLARE, C_VOLT, C_IRIS, new THREE.Vector3(1, 1, 1)];
  let ms = 11;
  const mr = () => ((ms = (ms * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < MOTES; i++) {
    mPos.set([(mr() - 0.5) * 22, (mr() - 0.5) * 16, -mr() * 26 + 6], i * 3);
    mSeed[i] = mr();
    const c = PAL[i % 7 === 0 ? 3 : i % 3];
    const k = i % 7 === 0 ? 0.8 : 1.0;
    mCol.set([c.x * k, c.y * k, c.z * k], i * 3);
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  moteGeo.setAttribute('aSeed', new THREE.BufferAttribute(mSeed, 1));
  moteGeo.setAttribute('aCol', new THREE.BufferAttribute(mCol, 3));
  const moteMat = new THREE.ShaderMaterial({
    vertexShader: MOTES_VERT,
    fragmentShader: MOTES_FRAG,
    uniforms: { uTime: { value: 0 }, uDpr: { value: 1 }, uScroll: { value: 0 }, uAlpha: { value: 1 } },
    ...additive,
  });
  const motes = new THREE.Points(moteGeo, moteMat);
  motes.frustumCulled = false;
  const moteScene = new THREE.Scene();
  moteScene.add(motes);
  const mo = { x: 0, y: 0 };

  /* ---- 3. the sea of identical pages ---- */
  const PAGES = tier === 'high' ? 420 : tier === 'mid' ? 280 : 150;
  const pageGeo = new THREE.PlaneGeometry(1.6, 2.0);
  const sea = new THREE.InstancedBufferGeometry();
  sea.index = pageGeo.index;
  sea.setAttribute('position', pageGeo.getAttribute('position'));
  sea.setAttribute('uv', pageGeo.getAttribute('uv'));
  const aPos = new Float32Array(PAGES * 3);
  const aSeed = new Float32Array(PAGES);
  const aScale = new Float32Array(PAGES);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < PAGES; i++) {
    if (i === 0) {
      aPos.set([0, 0, -46], 0);
      aSeed[0] = -1;
      aScale[0] = 3.2;
      continue;
    }
    const a = rnd() * Math.PI * 2;
    const r = 2.6 + Math.pow(rnd(), 0.8) * 15;
    aPos.set([Math.cos(a) * r * 1.5, Math.sin(a) * r * 0.85, -72 + rnd() * 80], i * 3);
    aSeed[i] = rnd();
    aScale[i] = 0.75 + rnd() * 0.5;
  }
  sea.setAttribute('aPos', new THREE.InstancedBufferAttribute(aPos, 3));
  sea.setAttribute('aSeed', new THREE.InstancedBufferAttribute(aSeed, 1));
  sea.setAttribute('aScale', new THREE.InstancedBufferAttribute(aScale, 1));
  sea.instanceCount = PAGES;

  const seaMat = new THREE.ShaderMaterial({
    vertexShader: SEA_VERT,
    fragmentShader: SEA_FRAG,
    uniforms: { ...colours, uTime: { value: 0 }, uAlpha: { value: 0 }, uLight: { value: 0 }, uLock: { value: 0 }, uHeroOff: { value: new THREE.Vector2() } },
    ...additive,
  });
  const seaMesh = new THREE.Mesh(sea, seaMat);
  seaMesh.frustumCulled = false;
  const seaScene = new THREE.Scene();
  seaScene.add(seaMesh);
  const seaCam = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

  /* ---- 4. proof planes ---- */
  const planeScene = new THREE.Scene();
  const planeCam = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10);
  const planeGeo = new THREE.PlaneGeometry(1, 1, 24, 14);
  const planes = [];
  const loader = new THREE.TextureLoader();

  function addPlanes(nodes) {
    nodes.forEach(({ el, src, card }) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: PLANE_VERT,
        fragmentShader: PLANE_FRAG,
        uniforms: { uTex: { value: null }, uReveal: { value: 0 }, uHover: { value: 0 }, uVel: { value: 0 }, uTilt: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) } },
        depthTest: false,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.visible = false;
      planeScene.add(mesh);
      const p = { el, src, card, mesh, mat, loaded: false, loading: false, seen: false, hover: 0, hoverT: 0, reveal: 0 };
      if (!reduce) {
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          mat.uniforms.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
          p.hoverT = 1;
        });
        el.addEventListener('pointerleave', () => { p.hoverT = 0; });
      }
      planes.push(p);
    });
  }

  function loadPlane(p) {
    p.loading = true;
    loader.load(p.src, (tex) => {
      tex.colorSpace = THREE.NoColorSpace;
      tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      p.mat.uniforms.uTex.value = tex;
      p.loaded = true;
      p.card.classList.add('gl-on');
      if (reduce) p.reveal = 1;
      dirty = true;
    });
  }

  /* ---- sections that steer the stage ---- */
  const sec = {
    hero: document.getElementById('hero'),
    problem: document.getElementById('problem'),
    services: document.getElementById('services'),
    work: document.getElementById('work'),
    contact: document.getElementById('contact'),
    tels: document.getElementById('tels'),
    paper: [...document.querySelectorAll('[data-theme="paper"]')],
  };

  const LOOKS = {
    hero: { amp: 1, bright: 1, grey: 0, flat: 0, ring: 0, warm: 0 },
    problem: { amp: 0.25, bright: 0.22, grey: 1, flat: 0.92, ring: 0, warm: 0 },
    services: { amp: 0.75, bright: 0.95, grey: 0, flat: 0, ring: 0, warm: -0.8 },
    work: { amp: 0.4, bright: 0.62, grey: 0, flat: 0, ring: 0, warm: 0.4 },
    contact: { amp: 0.85, bright: 1.0, grey: 0, flat: 0, ring: 1, warm: 0.9 },
    footer: { amp: 0.6, bright: 0.7, grey: 0, flat: 0, ring: 0.35, warm: 0.2 },
  };

  function resize() {
    size.w = innerWidth;
    size.h = innerHeight;
    size.dpr = Math.min(devicePixelRatio || 1, dprCap, Math.sqrt(budget / (size.w * size.h))) * quality;
    size.dpr = Math.max(0.5, size.dpr);
    renderer.setPixelRatio(size.dpr);
    renderer.setSize(size.w, size.h, false);
    const bw = size.w * size.dpr;
    const bh = size.h * size.dpr;
    const aw = Math.max(16, Math.round(bw * atmosScale));
    const ah = Math.max(16, Math.round(bh * atmosScale));
    atmosRT.setSize(aw, ah);
    atmosMat.uniforms.uRes.value.set(aw, ah);
    composeMat.uniforms.uRes.value.set(bw, bh);
    moteMat.uniforms.uDpr.value = size.dpr;
    ringMat.uniforms.uRes.value.set(bw, bh);
    seaCam.aspect = size.w / size.h;
    seaCam.fov = size.w < size.h ? 68 : 50;
    seaCam.updateProjectionMatrix();
    // keep the signal page clear of the headline: to the right on wide screens, up on tall ones
    const aspect = size.w / size.h;
    markCam.aspect = aspect;
    markCam.updateProjectionMatrix();
    if (aspect > 1.15) Object.assign(markLayout, { x: Math.min(3.6, 1.55 * aspect), y: -0.35, s: 0.95 });
    else Object.assign(markLayout, { x: 0, y: -0.25, s: 0.56 });
    seaMat.uniforms.uHeroOff.value.set(aspect > 1.15 ? Math.min(3.4, 2.2 * aspect) : 0, aspect > 1.15 ? 0 : 1.9);
    planeCam.right = size.w;
    planeCam.bottom = -size.h;
    planeCam.updateProjectionMatrix();
    dirty = true;
  }

  function setPointer(x, y) {
    pointer.x = (x / size.w) * 2 - 1;
    pointer.y = -((y / size.h) * 2 - 1);
    pointer.onT = 1;
  }

  function lockIn() { S.lockT = 0; }
  function setRingTarget(el) { ringEl = el; }

  function render(nowMs, dtMs, scrollVel) {
    const dt = Math.min(0.05, dtMs / 1000);
    if (!reduce) time += dt;

    // dynamic resolution: ignore throttled frames (hidden tab), react to sustained slowness
    if (!reduce && dtMs < 100) {
      ema = ema * 0.94 + dtMs * 0.06;
      if (nowMs - lastAdapt > 1200) {
        if (ema > 21 && quality > 0.55) { quality = Math.max(0.55, quality * 0.85); lastAdapt = nowMs; resize(); }
        else if (ema < 14 && quality < 1) { quality = Math.min(1, quality * 1.08); lastAdapt = nowMs; resize(); }
      }
    }
    vel = damp(vel, clamp(Math.abs(scrollVel) / 40, 0, 1.5), 6, dt);
    const vh = size.h;

    // the paper chapters cover the canvas completely: nothing to draw
    for (const el of sec.paper) {
      const r = el.getBoundingClientRect();
      if (r.top <= 0 && r.bottom >= vh) return;
    }

    // which chapter owns the middle of the screen
    let key = 'footer';
    const mid = vh * 0.5;
    for (const k of ['hero', 'problem', 'services', 'work', 'contact']) {
      const r = sec[k].getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { key = k; break; }
      if (k === 'hero' && r.bottom > mid) { key = 'hero'; break; }
    }
    const look = LOOKS[key];
    const k = reduce ? 60 : 2.6;
    S.amp = damp(S.amp, look.amp, k, dt);
    S.bright = damp(S.bright, look.bright, k, dt);
    S.grey = damp(S.grey, look.grey, k, dt);
    S.flat = damp(S.flat, look.flat, k, dt);
    S.ring = damp(S.ring, look.ring, k, dt);
    S.warm = damp(S.warm || 0, look.warm, k * 0.6, dt);
    S.split = damp(S.split, S.lockT + Math.min(vel * 0.5, 0.6), reduce ? 60 : 1.8, dt);

    pointer.on = damp(pointer.on, pointer.onT * (key === 'hero' || key === 'contact' ? 1 : 0.4), 4, dt);

    // problem chapter: fly through the sea of pages
    const pr = sec.problem.getBoundingClientRect();
    const p = clamp(-pr.top / Math.max(1, pr.height - vh));
    const seaVis = smooth(vh, vh * 0.2, pr.top) * smooth(0, vh * 0.7, pr.bottom);
    S.sea = reduce ? 0 : seaVis;
    S.light = damp(S.light, p > 0.64 ? 1 : 0, 3, dt);
    S.lock = damp(S.lock, p > 0.72 ? 1 : 0, 2.2, dt);

    const u = atmosMat.uniforms;
    u.uTime.value = time + S.split * 6.0; // the field also surges while the mark locks in
    u.uVel.value = vel;
    u.uGrey.value = Math.max(S.grey, S.sea);
    u.uBright.value = S.bright * (1 - S.sea * 0.7);
    u.uWarm.value = S.warm;
    u.uMouseOn.value = reduce ? 0 : pointer.on;
    u.uMouse.value.set(pointer.x, pointer.y);
    composeMat.uniforms.uTime.value = time;

    // rings: centred on the phone numbers, or on the one under the pointer
    ringBoost = damp(ringBoost, ringEl ? 1 : 0, 4, dt);
    ringTime += dt * (1 + ringBoost * 1.6);
    ringMat.uniforms.uTime.value = ringTime;
    ringMat.uniforms.uRing.value = S.ring * (1 + ringBoost * 0.6);
    if (sec.tels) {
      const r = (ringEl || sec.tels).getBoundingClientRect();
      const tx = r.left + r.width * (size.w > size.h ? 0.8 : 0.72);
      const ty = ringEl ? r.top + r.height / 2 : r.top + Math.min(r.height, vh) * 0.4;
      if (rc.x < 0) { rc.x = tx; rc.y = ty; }
      rc.x = damp(rc.x, tx, 5, dt);
      rc.y = ty + (rc.y - ty) * Math.exp(-5 * dt);
      ringMat.uniforms.uCenter.value.set(rc.x * size.dpr, (vh - rc.y) * size.dpr);
    }

    renderer.setRenderTarget(atmosRT);
    renderer.render(atmosScene, flatCam);
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(flatScene, flatCam);

    // motes drift in depth; the camera leans with the pointer and they rise as you scroll
    mo.x = damp(mo.x, pointer.x * pointer.on, 2, dt);
    mo.y = damp(mo.y, pointer.y * pointer.on, 2, dt);
    markCam.position.set(mo.x * 0.6, mo.y * 0.4, 10);
    markCam.lookAt(0, 0, 0);
    moteMat.uniforms.uTime.value = time;
    moteMat.uniforms.uScroll.value = scrollY / vh;
    moteMat.uniforms.uAlpha.value = (0.35 + 0.65 * S.bright) * (1 - S.sea * 0.8);
    renderer.render(moteScene, markCam);

    // the mark: floats in the hero, follows the pointer, flies at the camera as you leave
    const hr = sec.hero.getBoundingClientRect();
    if (hr.bottom > 0) {
      const hp = clamp(-hr.top / Math.max(1, hr.height));
      const ease = hp * hp;
      mk.rx = damp(mk.rx, pointer.y * 0.35 * pointer.on, 3, dt);
      mk.ry = damp(mk.ry, pointer.x * 0.6 * pointer.on, 3, dt);
      markGroup.position.set(markLayout.x * (1 - ease * 0.8), markLayout.y + Math.sin(time * 0.6) * 0.08, ease * 7.5);
      markGroup.scale.setScalar(markLayout.s);
      markGroup.rotation.set(-mk.rx + Math.sin(time * 0.4) * 0.08 + ease * 0.6, mk.ry + Math.sin(time * 0.25) * 0.35 + ease * 2.4, Math.sin(time * 0.3) * 0.05);
      // a hair of permanent spread keeps colour fringes on the edges once it locks
      const spread = S.split * 0.55 + 0.06 + ease * 1.6;
      const alpha = 1 - smooth(0.55, 0.95, hp);
      markCopies.forEach((m) => {
        m.position.copy(m.userData.dir).multiplyScalar(spread);
        m.material.uniforms.uTime.value = time;
        m.material.uniforms.uAlpha.value = alpha;
      });
      if (alpha > 0.01) renderer.render(markScene, markCam);
    } else {
      // the ending: the mark reassembles at the centre of the ringing signal
      const cr = sec.contact.getBoundingClientRect();
      if (cr.top < vh && cr.bottom > 0 && rc.x >= 0) {
        const cp = reduce ? 1 : smooth(vh, vh * 0.05, cr.top);
        const halfH = Math.tan(THREE.MathUtils.degToRad(markCam.fov / 2)) * 10;
        const wx = (rc.x / size.w * 2 - 1) * halfH * markCam.aspect;
        const wy = -(rc.y / vh * 2 - 1) * halfH;
        const wide = size.w > size.h;
        mk.rx = damp(mk.rx, pointer.y * 0.35 * pointer.on, 3, dt);
        mk.ry = damp(mk.ry, pointer.x * 0.6 * pointer.on, 3, dt);
        markGroup.position.set(wx, wy, -3 + cp * 3);
        markGroup.scale.setScalar((wide ? 0.6 : 0.36) * (0.7 + 0.3 * cp));
        markGroup.rotation.set(-mk.rx + Math.sin(time * 0.5) * 0.15, time * 0.6 + mk.ry + (1 - cp) * 3, Math.sin(time * 0.35) * 0.08);
        // channels fly in from far apart and lock as you arrive; they pulse with the rings
        const pulse = Math.pow(Math.max(0, Math.sin(ringTime * 2.2)), 8) * 0.12;
        const spread = (1 - cp) * 3.2 + 0.06 + pulse + ringBoost * 0.25;
        const alpha = cp * (wide ? 0.95 : 0.55);
        markCopies.forEach((m) => {
          m.position.copy(m.userData.dir).multiplyScalar(spread);
          m.material.uniforms.uTime.value = time;
          m.material.uniforms.uAlpha.value = alpha;
        });
        if (alpha > 0.01) renderer.render(markScene, markCam);
      }
    }

    if (S.sea > 0.002) {
      seaMat.uniforms.uTime.value = time;
      seaMat.uniforms.uAlpha.value = S.sea;
      seaMat.uniforms.uLight.value = S.light;
      seaMat.uniforms.uLock.value = S.lock;
      const e = 1 - Math.pow(1 - p, 1.6);
      seaCam.position.set(pointer.x * 0.8 * pointer.on, pointer.y * 0.5 * pointer.on, 14 - e * 52);
      seaCam.rotation.z = Math.sin(time * 0.15) * 0.03 + (1 - e) * 0.12;
      seaCam.lookAt(0, 0, seaCam.position.z - 10);
      seaCam.rotation.z += (1 - e) * 0.1;
      renderer.render(seaScene, seaCam);
    }

    // proof planes, synced to their <img> boxes
    let anyPlane = false;
    for (const pl of planes) {
      const r = pl.el.getBoundingClientRect();
      const near = r.bottom > -vh * 0.5 && r.top < vh * 1.8;
      if (near && !pl.loading) loadPlane(pl);
      const inView = r.bottom > 0 && r.top < vh && r.width > 0;
      pl.mesh.visible = pl.loaded && inView;
      if (!pl.mesh.visible) continue;
      anyPlane = true;
      if (!pl.seen && r.top < vh * 0.88) pl.seen = true;
      pl.reveal = reduce ? 1 : damp(pl.reveal, pl.seen ? 1 : 0, 1.6, dt);
      pl.hover = damp(pl.hover, pl.hoverT, 6, dt);
      pl.mesh.position.set(r.left + r.width / 2, -(r.top + r.height / 2), 0);
      pl.mesh.scale.set(r.width, r.height, 1);
      const pu = pl.mat.uniforms;
      pu.uReveal.value = pl.reveal;
      pu.uHover.value = pl.hover;
      pu.uVel.value = reduce ? 0 : vel * Math.sign(scrollVel || 1);
      pu.uTilt.value = reduce ? 0 : clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
    }
    if (anyPlane) renderer.render(planeScene, planeCam);
    dirty = false;
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    planes.forEach((p) => p.card.classList.remove('gl-on'));
    document.documentElement.classList.replace('gl', 'no-gl');
  });

  resize();
  addEventListener('resize', resize);

  return { render, resize, setPointer, addPlanes, lockIn, setRingTarget, renderer, get dirty() { return dirty; } };
}
