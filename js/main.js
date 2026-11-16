/* ==========================================================
   SYNTHWORKS — main.js
   Front-end only. No backend, no forms, no tracking.
   Loads: GSAP + ScrollTrigger + Lenis (classic scripts, CDN)
          and the WebGL stage (./stage.js, Three.js via import map).
   ========================================================== */

/* ----------------------------------------------------------
   CONTACT DETAILS
   (the phone numbers and email also appear in index.html —
   search for "tel:" and "mailto:" if you ever change them)
   ---------------------------------------------------------- */
const CONTACT = {
  email: 'synthworks1303@gmail.com',
  phones: ['+91 94267 33661', '+91 98980 62917'],
};

/* ----------------------------------------------------------
   PORTFOLIO — add / remove projects here.
   img: file name (without .webp) inside assets/work/ (16:10 screenshot)
   ---------------------------------------------------------- */
const WORK = [
  { tag: 'Cafe', title: 'Engine Cafe', img: 'engine-cafe',
    desc: 'A pure-veg garden cafe on VIP Road, Vesu — cold coffee, sizzlers and a lawn full of fairy lights, open till late.',
    live: 'https://engine-cafe.vercel.app/' },
  { tag: 'Product', title: 'Cup2Eat', img: 'cup2eat',
    desc: 'Crisp, baked edible cups in chocolate, vanilla and elaichi. Drink the chai, then eat the cup.',
    live: 'https://cup2eat-self.vercel.app/' },
  { tag: 'Desserts', title: 'Dumb', img: 'dumb-cafe',
    desc: 'Desserts and coffee in Surat — your local cookie dealer and home of the viral molten cookie.',
    live: 'https://dumb-cafe.vercel.app/' },
  { tag: 'Cafe', title: 'Maybac', img: 'maybac-cafe',
    desc: 'A luxury cafe and patisserie at International Wealth Centre, Vesu. Home of the Sleeping Teddy.',
    live: 'https://maybac-cafe.vercel.app/' },
  { tag: 'Pizzeria', title: 'Oscar Pizza', img: 'oscar-pizza',
    desc: 'Pure-veg pizzeria and the 101-dish Rajbhog unlimited buffet at Aagam Vivianna Mall, Vesu.',
    live: 'https://oscar-pizza.vercel.app/' },
  { tag: 'Bakery', title: 'The Cakesmith', img: 'the-cakesmith',
    desc: 'Designer, fully eggless custom cakes, hand-built in a small studio on VIP Road, Vesu.',
    live: 'https://the-cakesmith-surat.vercel.app/' },
  { tag: 'Cafe', title: 'Sukoon', img: 'sukoon-cafe',
    desc: 'An all-day vegetarian cafe, studio and turf in Vesu. A site built to make you slow down.',
    live: 'https://sukoon-cafe-eight.vercel.app/' },
  { tag: 'Pizzeria', title: "P'S Delicacies", img: 'cafe-restaurant',
    desc: 'Italian-style veg pizza in Bardoli and Surat — pizzas that talk to your taste buds.',
    live: 'https://cafe-restaurant-umber.vercel.app/' },
  { tag: 'Restaurant', title: "Nini's Kitchen", img: 'ninis-kitchen',
    desc: 'Pure-vegetarian North Indian, Italian and Lebanese on the third floor of The One, Vesu.',
    live: 'https://ninis-kitchen.vercel.app/' },
  { tag: 'Landscape', title: 'GreenLands', img: 'greenlands',
    desc: 'Landscape design, gardening and horticulture services in Mumbai, growing since 1940.',
    live: 'https://greenlands-lac.vercel.app/' },
  { tag: 'Restaurant', title: "K's Antarvan", img: 'ks-antarvan',
    desc: 'A glasshouse restaurant on Vesu Canal Road — hot stone bowls, dim sum, sushi and tandoor under a glass roof.',
    live: 'https://ks-antarvan.vercel.app/' },
  { tag: 'Cafe', title: '3 Story', img: '3-story-cafe',
    desc: 'A family-run, open-air cafe resto on Bhimrad Road with stone-oven pizza and hand-brewed coffee.',
    live: 'https://3-story-cafe.vercel.app/' },
  { tag: 'Cafe', title: 'Café Beats Arena', img: 'cafe-beats-arena',
    desc: 'An open-air garden cafe in Piplod with rooftop seating, DJ nights, sizzlers and thick shakes.',
    live: 'https://cafe-beats-arena.vercel.app/' },
];

/* ---------------------------------------------------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ARROW = '<svg class="i" aria-hidden="true"><use href="#arrow"/></svg>';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const { gsap, ScrollTrigger, Lenis } = window;
const motion = !reduce && !!gsap && !!ScrollTrigger;
if (motion) root.classList.add('motion');

function pickTier() {
  const forced = new URLSearchParams(location.search).get('tier');
  if (forced) return forced;
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 4;
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (cores <= 2 || (coarse && (mem <= 4 || cores <= 4))) return 'low';
  if (coarse || mem <= 4) return 'mid';
  return 'high';
}
const tier = pickTier();

const pointer = { x: innerWidth / 2, y: innerHeight / 2, moved: 0 };
const tickers = []; // fn(timeMs, dtMs, scrollVelocity)
let lenis = null;
let stage = null;

/* ==========================================================
   WORK LIST
   ========================================================== */
function renderWork() {
  const list = $('#workList');
  if (!list) return [];
  list.innerHTML = WORK.map((p) => `
    <article class="wk">
      <a class="wk-media" href="${esc(p.live)}" target="_blank" rel="noopener" data-cursor="Open" aria-label="Open the ${esc(p.title)} website (new tab)">
        <img src="assets/work/${esc(p.img)}.webp" alt="${esc(p.title)} — website screenshot" loading="lazy" decoding="async" width="1120" height="700">
      </a>
      <div class="wk-info">
        <h3 class="wk-title">${esc(p.title)}</h3>
        <span class="wk-tag">${esc(p.tag)}</span>
        <p class="wk-desc">${esc(p.desc)}</p>
        <a class="tlink" href="${esc(p.live)}" target="_blank" rel="noopener">Visit live site ${ARROW}</a>
      </div>
    </article>`).join('');
  return $$('.wk', list).map((card, i) => ({ card, el: $('.wk-media', card), src: `assets/work/${WORK[i].img}.webp` }));
}

/* ==========================================================
   CONTACT
   ========================================================== */
function initContact() {
  const subject = 'Call me back — new project';
  const body = ['Hi Synthworks,', '', 'Please call me about a project.', '', 'Name: ', 'Phone number: ', 'Best time to call: ', 'What I need: ', ''].join('\n');
  const callBack = $('#callBack');
  if (callBack) callBack.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const copyBtn = $('#copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = copyBtn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) { /* ignore */ }
        ta.remove();
      }
      copyBtn.textContent = 'Copied';
      setTimeout(() => { copyBtn.textContent = 'Copy address'; }, 1600);
    });
  }

  // the studio's local time, so "we pick up" means something
  const ist = $('#ist');
  if (ist) {
    const fmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
    const tick = () => { ist.textContent = fmt.format(new Date()).toLowerCase(); };
    tick();
    setInterval(tick, 20000);
  }
}

/* ==========================================================
   KINETIC TYPE — the width axis behaves like amplitude.
   Each line is fitted to the column, then letters swell near
   the pointer (and breathe on their own) while the line keeps
   its total width.
   ========================================================== */
function splitChars(el) {
  const text = el.textContent.trim();
  el.textContent = '';
  const chars = [];
  [...text].forEach((c) => {
    const s = document.createElement('span');
    if (c === ' ') { s.className = 'ch-sp'; el.appendChild(s); return; }
    s.className = 'ch';
    s.textContent = c;
    el.appendChild(s);
    chars.push(s);
  });
  return chars;
}

function makeKinetic(lines, { base = 100, swell = 0.9, breathe = 0.12 } = {}) {
  const rows = lines.map((el) => ({ el, chars: splitChars(el), cx: [], last: [] }));

  function fit() {
    rows.forEach((r) => {
      r.chars.forEach((c) => { c.style.fontVariationSettings = `'wdth' ${base}`; });
      r.last = r.chars.map(() => base);
      r.el.style.fontSize = '100px';
      const a = r.chars[0].getBoundingClientRect();
      const b = r.chars[r.chars.length - 1].getBoundingClientRect();
      const w = b.right - a.left;
      // the line is a block, so its own width is the column (padding excluded)
      const cs = getComputedStyle(r.el);
      const box = r.el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      // wide letters gain more than narrow ones lose when they swell, so leave headroom
      r.el.style.fontSize = `${Math.max(20, (100 * box * 0.93) / Math.max(1, w)).toFixed(2)}px`;
      r.cx = r.chars.map((c) => { const q = c.getBoundingClientRect(); return q.left + q.width / 2; });
    });
  }

  function tick(t, active) {
    const R = innerWidth * 0.16;
    rows.forEach((r) => {
      const n = r.chars.length;
      const ws = new Array(n);
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const d = (r.cx[i] - pointer.x) / R;
        ws[i] = 1 + swell * active * Math.exp(-d * d) + breathe * Math.sin(t * 0.0013 + i * 0.75);
        sum += ws[i];
      }
      for (let i = 0; i < n; i++) {
        const v = clamp((base * ws[i] * n) / sum, 68, 136);
        if (Math.abs(v - r.last[i]) > 0.4) {
          r.chars[i].style.fontVariationSettings = `'wdth' ${v.toFixed(1)}`;
          r.last[i] = v;
        }
      }
    });
  }

  return { rows, fit, tick, chars: rows.flatMap((r) => r.chars) };
}

/* ==========================================================
   SERVICES — six partials summing into one signal
   ========================================================== */
function initServices() {
  const list = $('#svcList');
  const scope = $('#scope');
  const items = $$('.svc', list);
  let active = -1;

  const setActive = (i) => {
    active = i;
    items.forEach((b, k) => {
      b.classList.toggle('is-active', k === i);
      b.setAttribute('aria-pressed', String(k === i));
    });
    list.classList.toggle('has-active', i >= 0);
  };

  items.forEach((b, i) => {
    // the description sits in a span so it can collapse smoothly
    const d = $('.svc-desc', b);
    if (d && motion) d.innerHTML = `<span>${d.innerHTML}</span>`;
    b.addEventListener('click', () => setActive(active === i ? -1 : i));
    if (finePointer) {
      b.addEventListener('pointerenter', () => setActive(i));
    }
    b.addEventListener('focus', () => setActive(i));
  });
  list.addEventListener('pointerleave', () => { if (finePointer) setActive(-1); });

  if (!scope || root.classList.contains('no-gl')) return;
  const cv = document.createElement('canvas');
  scope.appendChild(cv);
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, visible = false;
  const PART = [{ f: 1, a: 1 }, { f: 2, a: 0.62 }, { f: 3, a: 0.46 }, { f: 5, a: 0.34 }, { f: 7, a: 0.26 }, { f: 9, a: 0.2 }];
  const COLS = ['#ff5a36', '#2be4a0', '#6f4bff', '#ff5a36', '#2be4a0', '#6f4bff'];
  const amp = PART.map(() => 0);

  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = scope.clientWidth;
    H = scope.clientHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.style.width = `${W}px`;
    cv.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  new ResizeObserver(size).observe(scope);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(scope);

  const draw = (t) => {
    if (!visible || !W) return;
    const vh = innerHeight;
    // partials join as their service scrolls into view
    const joined = items.map((b) => b.getBoundingClientRect().top < vh * 0.8);
    PART.forEach((p, k) => {
      const target = joined[k] ? (active < 0 || active === k ? 1 : 0.25) : 0;
      amp[k] = reduce ? target : lerp(amp[k], target, 0.08);
    });
    const time = reduce ? 0 : t * 0.0011;
    const total = PART.reduce((s, p) => s + p.a, 0);
    const A = (H * 0.36) / total;
    const mid = H / 2;
    const step = 3;
    ctx.clearRect(0, 0, W, H);

    // each partial, faint, in its own colour
    PART.forEach((p, k) => {
      if (amp[k] < 0.01) return;
      ctx.beginPath();
      for (let x = 0; x <= W; x += step) {
        const y = mid + Math.sin((x / W) * Math.PI * 2 * p.f - time * (1 + k * 0.4)) * p.a * A * 1.7;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = COLS[k];
      ctx.globalAlpha = 0.25 + (active === k ? 0.75 : 0.25) * amp[k];
      ctx.lineWidth = active === k ? 2.5 : 1.2;
      ctx.stroke();
    });

    // the sum: one signal
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += step) {
      let y = mid;
      PART.forEach((p, k) => { y += Math.sin((x / W) * Math.PI * 2 * p.f - time * (1 + k * 0.4)) * p.a * A * amp[k]; });
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(244,245,247,.18)';
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.strokeStyle = '#f4f5f7';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };
  tickers.push(draw);
}

/* ==========================================================
   PROCESS — three channels travel through four steps and
   lock into one line by the end
   ========================================================== */
function drawProcessLine(p) {
  const svg = $('#pline');
  if (!svg || !svg.getBoundingClientRect().height) return;
  const W = innerWidth;
  const H = svg.getBoundingClientRect().height;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W);
  $$('.pline-c', svg).forEach((path, c) => {
    const off = (c - 1) * (1 - p);
    let d = '';
    for (let x = 0; x <= W; x += 10) {
      const y = H / 2 + Math.sin((x / W) * Math.PI * 5 + off * 2.4 + p * 3) * H * 0.34 * (0.55 + 0.45 * p) + off * H * 0.12;
      d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
    }
    path.setAttribute('d', d);
    path.setAttribute('pathLength', '1');
    path.style.strokeDasharray = '1';
    path.style.strokeDashoffset = String(1 - clamp(p * 1.05));
  });
}

/* ==========================================================
   SCROLL CHOREOGRAPHY (GSAP)
   ========================================================== */
function initScroll(hero, footerK) {
  gsap.registerPlugin(ScrollTrigger);

  if (Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.stop();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // problem: one beat at a time over the sea of pages
  const problem = $('#problem');
  const beats = $$('.beat', problem);
  if (beats.length === 3) {
    gsap.set(beats, { autoAlpha: 0, y: 50 });
    gsap.set(beats[0], { autoAlpha: 1, y: 0 });
    const lock = $('.reg', beats[2]);
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: problem, start: 'top top', end: 'bottom bottom', scrub: 0.6,
        onUpdate: (self) => { if (lock) lock.classList.toggle('is-in', self.progress > 0.74); },
      },
    })
      .to(beats[0], { autoAlpha: 0, y: -50, duration: 0.1 }, 0.22)
      .to(beats[1], { autoAlpha: 1, y: 0, duration: 0.1 }, 0.33)
      .to(beats[1], { autoAlpha: 0, y: -50, duration: 0.1 }, 0.55)
      .to(beats[2], { autoAlpha: 1, y: 0, duration: 0.1 }, 0.68)
      .to({}, { duration: 0.22 }, 0.78);
  }

  // process: horizontal on wide screens
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (min-height: 560px)', () => {
    const process = $('#process');
    const track = $('#processTrack');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const setH = () => { process.style.height = `${innerHeight + dist()}px`; };
    setH();
    ScrollTrigger.addEventListener('refreshInit', setH);
    const slide = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: process, start: 'top top', end: () => `+=${dist()}`, scrub: 0.5, invalidateOnRefresh: true,
        onUpdate: (self) => drawProcessLine(self.progress),
        onRefresh: (self) => drawProcessLine(self.progress),
      },
    });
    // inside the sliding track: numbers travel slower than the copy, headings rise as each step arrives
    $$('.pstep', track).forEach((step) => {
      const num = $('.pnum', step);
      const head = $('.h-lg, .h-xl', step);
      const st = { trigger: step, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true };
      if (num) gsap.fromTo(num, { xPercent: 70, rotation: -8 }, { xPercent: -50, rotation: 6, ease: 'none', scrollTrigger: st });
      if (head) {
        gsap.from(head, {
          yPercent: 60, autoAlpha: 0, ease: 'power2.out',
          scrollTrigger: { trigger: step, containerAnimation: slide, start: 'left 85%', end: 'left 45%', scrub: true },
        });
      }
    });
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', setH);
      process.style.height = '';
    };
  });

  // process numbers: stamp in as each step arrives (narrow screens)
  mm.add('(max-width: 899px), (max-height: 559px)', () => {
    $$('.pnum').forEach((n) => {
      gsap.from(n, { yPercent: 40, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 85%' } });
    });
  });

  // about: the manifesto lights word by word
  const man = $('#manifesto');
  if (man) {
    const words = man.textContent.trim().split(/\s+/);
    man.setAttribute('aria-label', man.textContent.trim().replace(/\s+/g, ' '));
    man.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${esc(w)}</span>`).join(' ');
    const spans = $$('.w', man);
    ScrollTrigger.create({
      trigger: man, start: 'top 82%', end: 'bottom 50%', scrub: true,
      onUpdate: (self) => {
        const lit = Math.round(self.progress * spans.length);
        spans.forEach((s, i) => s.classList.toggle('is-lit', i < lit));
      },
    });
  }

  // the about title squeezes in from very wide to normal
  const at = $('.about-title');
  if (at) {
    gsap.fromTo(at, { fontVariationSettings: "'wdth' 150" }, {
      fontVariationSettings: "'wdth' 92", ease: 'none',
      scrollTrigger: { trigger: at, start: 'top 95%', end: 'top 40%', scrub: true },
    });
  }

  // the giant phone numbers widen as they arrive
  $$('.tel-num').forEach((n) => {
    gsap.fromTo(n, { fontVariationSettings: "'wdth' 52" }, {
      fontVariationSettings: "'wdth' 76", ease: 'none',
      scrollTrigger: { trigger: n, start: 'top 100%', end: 'top 55%', scrub: true },
    });
  });

  // work: titles rise as each card arrives
  $$('.wk-info').forEach((el) => {
    gsap.from(el.children, {
      y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { hero.fit(); footerK && footerK.fit(); ScrollTrigger.refresh(); });
}

/* ==========================================================
   REGISTER — headlines whose colour channels snap together
   ========================================================== */
function initRegister() {
  if (!motion) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  $$('.reg').forEach((el) => { if (!el.closest('.beat')) io.observe(el); });
}

/* ==========================================================
   NAV, MENU, ANCHORS, CALL BAR, CURSOR
   ========================================================== */
function initMenu() {
  const btn = $('#menuBtn');
  const menu = $('#menu');
  if (!btn || !menu) return () => {};
  const label = $('.menu-btn-label', btn);
  const set = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (label) label.textContent = open ? 'Close' : 'Menu';
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) { const first = $('a', menu); if (first) first.focus(); }
  };
  btn.addEventListener('click', () => set(!menu.classList.contains('is-open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { set(false); btn.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 1000) set(false); });
  return () => set(false);
}

function initAnchors(closeMenu) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    closeMenu();
    if (!lenis) return; // native smooth scrolling handles it
    e.preventDefault();
    lenis.scrollTo(id === '#top' ? 0 : target, { duration: 1.4 });
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });
}

function initChrome() {
  const bar = $('#callbar');
  const hero = $('#hero');
  const contact = $('#contact');
  let lastY = scrollY;
  const update = () => {
    const y = scrollY;
    const vh = innerHeight;
    if (bar) {
      const nearContact = contact.getBoundingClientRect().top < vh * 0.75;
      bar.classList.toggle('is-on', y > hero.offsetHeight * 0.7 && !nearContact);
    }
    if (y > 500 && y - lastY > 6) document.body.classList.add('nav-hidden');
    else if (y - lastY < -6 || y <= 500) document.body.classList.remove('nav-hidden');
    lastY = y;
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

function initCursor() {
  const cursor = $('#cursor');
  if (!cursor || !finePointer || !motion) return;
  const label = $('b', cursor);
  let x = -100, y = -100;
  addEventListener('pointermove', () => cursor.classList.add('is-live'), { once: true });
  document.addEventListener('pointerover', (e) => {
    const lab = e.target.closest('[data-cursor]');
    cursor.classList.toggle('is-label', !!lab);
    if (lab && label) label.textContent = lab.dataset.cursor;
    cursor.classList.toggle('is-hover', !lab && !!e.target.closest('a, button'));
  });
  tickers.push(() => {
    x = lerp(x, pointer.x, 0.25);
    y = lerp(y, pointer.y, 0.25);
    cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  });
}

/* ==========================================================
   LOADER — the three channels of the mark lock together
   ========================================================== */
function runLoader(ready, onDone) {
  const mark = $('.loader-mark');
  const pct = $('#loaderPct');
  const word = $('#loaderWord');
  const WORDS = ['Tuning in', 'Finding the signal', 'Locking phase', 'Live'];
  let isReady = false;
  ready.then(() => { isReady = true; });
  setTimeout(() => { isReady = true; }, 4000); // never wait forever

  if (!motion) {
    ready.then(onDone);
    setTimeout(onDone, 4000);
    return;
  }
  const start = performance.now();
  const DURATION = 1500;
  let finished = false;
  (function tick(now) {
    const t = clamp((now - start) / DURATION);
    const eased = 1 - Math.pow(1 - t, 3);
    const shown = Math.min(isReady ? 100 : 90, Math.round(eased * 100));
    pct.textContent = shown;
    word.textContent = WORDS[Math.min(WORDS.length - 1, Math.floor(shown / 30))];
    mark.style.setProperty('--o', (1 - shown / 100).toFixed(3));
    if (shown >= 100 && !finished) { finished = true; setTimeout(onDone, 260); return; }
    requestAnimationFrame(tick);
  })(start);
}

/* ==========================================================
   BOOT
   ========================================================== */
async function boot() {
  // a reload starts at the top, behind the loader, unless the link points somewhere
  if ('scrollRestoration' in history && !location.hash) {
    history.scrollRestoration = 'manual';
    scrollTo(0, 0);
  }
  const safe = (fn) => { try { return fn(); } catch (err) { console.error(err); return undefined; } };

  const planes = safe(renderWork) || [];
  safe(initContact);

  // kinetic hero title + footer word
  const hero = makeKinetic($$('.hero-title .ht-line'), { base: 100 });
  const footerWord = $('#footerWord');
  const footerK = footerWord ? makeKinetic([footerWord], { base: 100, swell: 1.2, breathe: 0.06 }) : null;
  hero.fit();
  footerK && footerK.fit();
  let fitTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(() => { hero.fit(); footerK && footerK.fit(); if (motion) ScrollTrigger.refresh(); }, 120);
  });

  // the WebGL stage (falls back to plain images if WebGL or Three.js is unavailable)
  const stageReady = (async () => {
    try {
      const { createStage } = await import('./stage.js?v=16');
      stage = createStage($('#stage'), { tier, reduce: !motion });
      stage.addPlanes(planes);
      root.classList.add('gl');
      if (new URLSearchParams(location.search).has('debug')) window.__sw = { stage, tier, get lenis() { return lenis; } };
    } catch (err) {
      console.warn('WebGL stage unavailable:', err);
      root.classList.add('no-gl');
    }
  })();

  safe(initServices);
  safe(initRegister);
  const closeMenu = safe(initMenu) || (() => {});
  safe(() => initAnchors(closeMenu));
  safe(initChrome);
  safe(initCursor);
  if (motion) safe(() => initScroll(hero, footerK));

  // the effects layer (reveals, marquee, trail, magnetic buttons...)
  const fxReady = motion
    ? import('./fx.js?v=16').then(({ initFx }) => initFx({
      gsap, ScrollTrigger,
      heroChars: hero.chars,
      footerChars: footerK ? footerK.chars : [],
      names: WORK.map((p) => p.title),
      getStage: () => stage,
      getVel: () => (lenis ? lenis.velocity : 0),
      finePointer,
    })).catch((err) => console.warn('Effects unavailable:', err))
    : Promise.resolve();

  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.moved = performance.now();
    // touch "pointers" jump around, so only a real mouse bends the lines
    if (stage && e.pointerType === 'mouse') stage.setPointer(e.clientX, e.clientY);
  }, { passive: true });

  // hide the hero before it enters
  if (motion) gsap.set(hero.chars, { yPercent: 115 });

  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const ready = Promise.all([fonts, stageReady, fxReady]);

  runLoader(ready, () => {
    if (!document.body.classList.contains('is-loading')) return;
    document.body.classList.remove('is-loading');
    safe(() => { hero.fit(); footerK && footerK.fit(); });
    if (stage) stage.lockIn();
    if (motion) {
      gsap.to(hero.chars, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035, delay: 0.1 });
      gsap.from('.hero-kicker, .hero-foot > *', { y: 24, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.5 });
      if (lenis) lenis.start();
      ScrollTrigger.refresh();
    }
  });

  // one loop drives everything
  let heroVisible = true;
  let footVisible = false;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe($('#hero'));
  if (footerWord) new IntersectionObserver(([e]) => { footVisible = e.isIntersecting; }).observe(footerWord);

  let lastY = scrollY;
  let vel = 0;
  let lastT = performance.now();
  const frame = (now) => {
    const dt = Math.min(50, now - lastT);
    lastT = now;
    const y = scrollY;
    const dy = y - lastY;
    vel = lerp(vel, lenis ? lenis.velocity : dy, 0.2);
    lastY = y;

    if (motion) {
      const active = finePointer && now - pointer.moved < 2500 ? 1 : 0;
      if (heroVisible) hero.tick(now, active);
      if (footVisible && footerK) footerK.tick(now, active);
    }
    tickers.forEach((fn) => safe(() => fn(now, dt, vel)));
    if (stage && (motion || dy !== 0 || stage.dirty)) safe(() => stage.render(now, dt, vel));
  };

  if (motion) gsap.ticker.add(() => frame(performance.now()));
  else {
    (function raf(now) { frame(now); requestAnimationFrame(raf); })(performance.now());
  }
}

boot();
