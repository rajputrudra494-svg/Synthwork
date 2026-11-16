/* ==========================================================
   SYNTHWORKS — fx.js
   Scroll and pointer effects layered on top of the stage.
   Only loaded when motion is allowed (GSAP present, no
   prefers-reduced-motion).
   ========================================================== */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function initFx({ gsap, ScrollTrigger, heroChars, footerChars, names, getVel, getStage, finePointer }) {
  heroExit(gsap, heroChars);
  headlineReveals(gsap);
  listReveals(gsap);
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  marquee(gsap, $('#names'), names.map(esc), getVel);
  marquee(gsap, $('#ctaLoop'), ['Get a call', 'Start with us', 'We pick up'], getVel, 1.4);
  ending(gsap, getVel, getStage, footerChars);
  paperExpand(gsap);
  telScramble(ScrollTrigger);
  velocitySkew(gsap, getVel);
  if (finePointer) {
    magnetic(gsap);
    lightTrail(gsap);
  }
}

/* ---------- hero: the letters scatter upward as you leave ---------- */
function heroExit(gsap, chars) {
  const st = { trigger: '#hero', start: 'top top', end: 'bottom 25%', scrub: 0.4 };
  gsap.to(chars, {
    y: (i) => -(90 + ((i * 53) % 170)),
    rotation: (i) => ((i * 37) % 34) - 17,
    autoAlpha: 0,
    ease: 'none',
    stagger: { each: 0.015, from: 'center' },
    scrollTrigger: st,
  });
  gsap.to('.hero-kicker, .hero-foot', { y: -80, autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '45% top' } });
}

/* ---------- headlines: words rise out of masks; register headlines wipe up ---------- */
function splitWords(el) {
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(' ').map((w) => `<span class="hw" aria-hidden="true"><span>${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></span>`).join(' ');
  return $$('.hw > span', el);
}

function headlineReveals(gsap) {
  // plain headlines
  const wide = matchMedia('(min-width: 900px) and (min-height: 560px)').matches;
  $$('.h-xl, .h-lg, .work-next-big').forEach((el) => {
    if (el.closest('.beat, .hero') || el.classList.contains('reg')) return;
    if (wide && el.closest('.process')) return; // the horizontal track handles these
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 115,
      rotation: 4,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // register headlines: the whole stack (all three channels) wipes up together
  $$('.reg').forEach((el) => {
    if (el.closest('.beat')) return;
    gsap.fromTo(el,
      { clipPath: 'inset(0% 0% 100% 0%)', y: 70 },
      { clipPath: 'inset(0% 0% -25% 0%)', y: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // ledes and supporting lines
  $$('.sec-lede, .contact-lede, .contact-sub, .clock, .scope-note').forEach((el) => {
    gsap.from(el, { y: 30, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
}

function listReveals(gsap) {
  const groups = [
    ['.svc-list', '.svc-list li'],
    ['.why', '.why-row'],
    ['.values', '.values li'],
    ['.tels', '.tel'],
    ['.mail', '.mail-addr, .chip'],
    ['.footer-cols', '.footer-cols > div'],
  ];
  groups.forEach(([trigger, items]) => {
    const t = $(trigger);
    if (!t) return;
    gsap.from($$(items), {
      y: 46, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: t, start: 'top 86%' },
    });
  });
}

/* ---------- looping rows (client names, the footer call) that react to scroll speed and direction ---------- */
function marquee(gsap, box, names, getVel, boost = 1) {
  if (!box || !names.length) return;
  const mark = '<svg aria-hidden="true"><use href="#mark"/></svg>';
  const set = names.map((n) => `<span>${n}</span>${mark}`).join('');
  box.innerHTML = [1, -1].map((dir, i) =>
    `<div class="names-row${i ? ' is-outline' : ''}" data-dir="${dir}"><div class="names-set">${set}</div><div class="names-set">${set}</div></div>`).join('');

  const rows = $$('.names-row', box).map((el) => ({ el, dir: Number(el.dataset.dir), x: 0, w: 0 }));
  const measure = () => rows.forEach((r) => { r.w = r.el.firstElementChild.getBoundingClientRect().width; });
  measure();
  addEventListener('resize', measure);
  if (document.fonts) document.fonts.ready.then(measure);

  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(box);
  let sign = 1;
  gsap.ticker.add((t, dt) => {
    if (!visible) return;
    const v = getVel();
    if (v > 0.5) sign = 1;
    else if (v < -0.5) sign = -1;
    const speed = (0.06 * boost + Math.min(Math.abs(v), 60) * 0.012) * dt;
    rows.forEach((r) => {
      if (!r.w) return;
      r.x -= speed * sign * r.dir;
      r.x = ((r.x % r.w) + r.w) % r.w - r.w;
      r.el.style.transform = `translate3d(${r.x.toFixed(1)}px,0,0) skewX(${clamp(-v * 0.25, -12, 12).toFixed(2)}deg)`;
    });
  });
}

/* ---------- the paper chapter opens like a card being laid down ---------- */
function paperExpand(gsap) {
  const p = $('#process');
  if (!p) return;
  gsap.fromTo(p,
    { clipPath: 'inset(14% 7% 0% 7% round 56px)' },
    { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'top top', scrub: true } });

  const about = $('#about');
  if (about) {
    // and folds away again as the dark contact chapter arrives
    gsap.fromTo(about,
      { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
      { clipPath: 'inset(0% 6% 10% 6% round 56px)', ease: 'none', scrollTrigger: { trigger: about, start: 'bottom bottom', end: 'bottom top', scrub: true } });
  }
}

/* ---------- phone numbers tune in like a signal ---------- */
function telScramble(ScrollTrigger) {
  $$('.tel-num').forEach((el) => {
    const final = el.textContent;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const start = performance.now();
        const DUR = 1100;
        (function step(now) {
          const p = clamp((now - start) / DUR);
          let out = '';
          for (let i = 0; i < final.length; i++) {
            const c = final[i];
            const settled = i / final.length < p * 1.15 - 0.1;
            out += /\d/.test(c) && !settled ? String(Math.floor(Math.random() * 10)) : c;
          }
          el.textContent = out;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = final;
        })(start);
      },
    });
  });
}

/* ---------- text blocks lean with scroll speed ---------- */
function velocitySkew(gsap, getVel) {
  const els = $$('.wk-info, .sec-head, .manifesto, .values, .contact-head, .why');
  const setters = els.map((el) => gsap.quickSetter(el, 'skewY', 'deg'));
  let cur = 0;
  gsap.ticker.add(() => {
    const target = clamp(getVel() * -0.06, -3.5, 3.5);
    cur += (target - cur) * 0.12;
    if (Math.abs(cur) < 0.005) cur = 0;
    setters.forEach((s) => s(cur));
  });
}

/* ---------- the ending: about, contact and footer keep moving ---------- */
function ending(gsap, getVel, getStage, footerChars) {
  // headlines split into their colour channels when you scroll fast, and lock again when you stop
  const regs = $$('.reg');
  let split = 0;
  gsap.ticker.add(() => {
    const target = Math.min(Math.abs(getVel()) * 0.0045, 0.14);
    split += (target - split) * 0.15;
    regs.forEach((el) => {
      if (!el.classList.contains('is-in')) return;
      if (el.dataset.live === undefined) {
        el.dataset.live = '';
        setTimeout(() => { el.dataset.live = '1'; el.style.transition = 'none'; }, 1400);
      }
      if (el.dataset.live === '1') el.style.setProperty('--split', `${split.toFixed(4)}em`);
    });
  });

  // about: the values slide in from the edge, one after another
  $$('.values li').forEach((li, i) => {
    gsap.fromTo(li, { xPercent: -30 - i * 12, autoAlpha: 0.2 }, {
      xPercent: 0, autoAlpha: 1, ease: 'none',
      scrollTrigger: { trigger: li, start: 'top bottom', end: 'top 65%', scrub: true },
    });
  });

  // contact: "Get a call." squeezes in and stretches to full width
  const big = $('.contact .h-xxl');
  if (big) {
    gsap.fromTo(big, { fontVariationSettings: "'wdth' 50", letterSpacing: '-0.04em' }, {
      fontVariationSettings: "'wdth' 118", letterSpacing: '-0.015em', ease: 'none',
      scrollTrigger: { trigger: big, start: 'top bottom', end: 'top 25%', scrub: true },
    });
  }

  // the phone numbers glide in from opposite sides; hovering one pulls the ringing signal onto it
  $$('.tel').forEach((tel, i) => {
    gsap.fromTo($('.tel-num', tel), { xPercent: i % 2 ? 22 : -22 }, {
      xPercent: 0, ease: 'none',
      scrollTrigger: { trigger: tel, start: 'top bottom', end: 'top 60%', scrub: true },
    });
    const on = () => { const s = getStage(); if (s) s.setRingTarget(tel); };
    const off = () => { const s = getStage(); if (s) s.setRingTarget(null); };
    tel.addEventListener('pointerenter', on);
    tel.addEventListener('pointerleave', off);
    tel.addEventListener('focus', on);
    tel.addEventListener('blur', off);
  });

  // footer: the wordmark rises letter by letter as you reach the bottom
  if (footerChars && footerChars.length) {
    gsap.fromTo(footerChars, { yPercent: 105 }, {
      yPercent: 0, ease: 'power2.out', stagger: 0.06,
      scrollTrigger: { trigger: '#footerWord', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
    });
  }
}

/* ---------- buttons lean toward the pointer ---------- */
function magnetic(gsap) {
  $$('.btn, .chip, .menu-btn, .brand').forEach((el) => {
    const toX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const toY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      toX((e.clientX - (r.left + r.width / 2)) * 0.3);
      toY((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => { toX(0); toY(0); });
  });
}

/* ---------- light trail: motes emitted per distance, so spacing is even at any speed ---------- */
function lightTrail(gsap) {
  const cv = $('#trail');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const COLS = ['255,90,54', '43,228,160', '111,75,255'];
  const motes = [];
  const MAX = 220;
  const GAP = 9;
  let W = 0, H = 0, dpr = 1;
  let last = null;
  let n = 0;
  const paper = $$('[data-theme="paper"]');

  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);

  const onPaper = (y) => paper.some((el) => { const r = el.getBoundingClientRect(); return y >= r.top && y <= r.bottom; });

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const p = { x: e.clientX, y: e.clientY };
    if (!last) { last = p; return; }
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    const dist = Math.hypot(dx, dy);
    if (dist < GAP) return;
    const steps = Math.min(30, Math.floor(dist / GAP));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      motes.push({ x: last.x + dx * t, y: last.y + dy * t, c: n++ % 3, life: 1, vx: (Math.random() - 0.5) * 0.4, vy: -0.2 - Math.random() * 0.3 });
    }
    if (motes.length > MAX) motes.splice(0, motes.length - MAX);
    last = p;
  }, { passive: true });

  let active = false;
  gsap.ticker.add((t, dt) => {
    if (!motes.length) {
      if (active) { ctx.clearRect(0, 0, W, H); active = false; }
      return;
    }
    active = true;
    ctx.clearRect(0, 0, W, H);
    const paperMode = last && onPaper(last.y);
    ctx.globalCompositeOperation = paperMode ? 'multiply' : 'lighter';
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.life -= dt / 650;
      if (m.life <= 0) { motes.splice(i, 1); continue; }
      m.x += m.vx * dt * 0.06;
      m.y += m.vy * dt * 0.06;
      const r = 1.2 + m.life * 3.2;
      ctx.fillStyle = `rgba(${COLS[m.c]},${(m.life * (paperMode ? 0.7 : 0.9)).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, r, 0, 6.283);
      ctx.fill();
    }
  });
}
