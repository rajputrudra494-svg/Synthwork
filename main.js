/* ==========================================================
   SYNTHWORKS — main.js
   Front-end only. No backend, no forms, no tracking.
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
   cat: 'web' (the only category shown right now)
   img: file name (without .webp) inside assets/work/
   ---------------------------------------------------------- */
const WORK = [
  { cat: 'web', tag: 'Cafe', kind: 'Website', title: 'Engine Cafe', img: 'engine-cafe',
    desc: 'A pure-veg garden cafe on VIP Road, Vesu — cold coffee, sizzlers and a lawn full of fairy lights, open till late.',
    live: 'https://engine-cafe.vercel.app/' },
  { cat: 'web', tag: 'Product', kind: 'Website', title: 'Cup2Eat', img: 'cup2eat',
    desc: 'Crisp, baked edible cups in chocolate, vanilla and elaichi. Drink the chai, then eat the cup.',
    live: 'https://cup2eat-self.vercel.app/' },
  { cat: 'web', tag: 'Desserts', kind: 'Website', title: 'Dumb', img: 'dumb-cafe',
    desc: 'Desserts and coffee in Surat — your local cookie dealer and home of the viral molten cookie.',
    live: 'https://dumb-cafe.vercel.app/' },
  { cat: 'web', tag: 'Cafe', kind: 'Website', title: 'Maybac', img: 'maybac-cafe',
    desc: 'A luxury cafe and patisserie at International Wealth Centre, Vesu. Home of the Sleeping Teddy.',
    live: 'https://maybac-cafe.vercel.app/' },
  { cat: 'web', tag: 'Pizzeria', kind: 'Website', title: 'Oscar Pizza', img: 'oscar-pizza',
    desc: 'Pure-veg pizzeria and the 101-dish Rajbhog unlimited buffet at Aagam Vivianna Mall, Vesu.',
    live: 'https://oscar-pizza.vercel.app/' },
  { cat: 'web', tag: 'Bakery', kind: 'Website', title: 'The Cakesmith', img: 'the-cakesmith',
    desc: 'Designer, fully eggless custom cakes, hand-built in a small studio on VIP Road, Vesu.',
    live: 'https://the-cakesmith-surat.vercel.app/' },
  { cat: 'web', tag: 'Cafe', kind: 'Website', title: 'Sukoon', img: 'sukoon-cafe',
    desc: 'An all-day vegetarian cafe, studio and turf in Vesu. A site built to make you slow down.',
    live: 'https://sukoon-cafe-eight.vercel.app/' },
  { cat: 'web', tag: 'Pizzeria', kind: 'Website', title: "P'S Delicacies", img: 'cafe-restaurant',
    desc: 'Italian-style veg pizza in Bardoli and Surat — pizzas that talk to your taste buds.',
    live: 'https://cafe-restaurant-umber.vercel.app/' },
  { cat: 'web', tag: 'Restaurant', kind: 'Website', title: "Nini's Kitchen", img: 'ninis-kitchen',
    desc: 'Pure-vegetarian North Indian, Italian and Lebanese on the third floor of The One, Vesu.',
    live: 'https://ninis-kitchen.vercel.app/' },
  { cat: 'web', tag: 'Landscape', kind: 'Website', title: 'GreenLands', img: 'greenlands',
    desc: 'Landscape design, gardening and horticulture services in Mumbai, growing since 1940.',
    live: 'https://greenlands-lac.vercel.app/' },
  { cat: 'web', tag: 'Restaurant', kind: 'Website', title: "K's Antarvan", img: 'ks-antarvan',
    desc: 'A glasshouse restaurant on Vesu Canal Road — hot stone bowls, dim sum, sushi and tandoor under a glass roof.',
    live: 'https://ks-antarvan.vercel.app/' },
  { cat: 'web', tag: 'Cafe', kind: 'Website', title: '3 Story', img: '3-story-cafe',
    desc: 'A family-run, open-air cafe resto on Bhimrad Road with stone-oven pizza and hand-brewed coffee.',
    live: 'https://3-story-cafe.vercel.app/' },
  { cat: 'web', tag: 'Cafe', kind: 'Website', title: 'Café Beats Arena', img: 'cafe-beats-arena',
    desc: 'An open-air garden cafe in Piplod with rooftop seating, DJ nights, sizzlers and thick shakes.',
    live: 'https://cafe-beats-arena.vercel.app/' },

];

/* ---------------------------------------------------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ARROW = '<svg class="i" aria-hidden="true"><use href="#arrow"/></svg>';

const pointer = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
let lenis = null;
const tickers = []; // functions run every animation frame: fn(time, dt, velocity)
const onScroll = []; // functions run whenever the scroll position changes

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
      const old = copyBtn.textContent;
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => { copyBtn.textContent = old; }, 1600);
    });
  }
}

/* ==========================================================
   SPLIT TEXT — wraps every character so headlines can
   animate in letter by letter
   ========================================================== */
function splitText(el) {
  let c = 0;
  const walk = (node, out) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { out.appendChild(document.createTextNode(' ')); return; }
          const wd = document.createElement('span');
          wd.className = 'wd';
          [...part].forEach((chr) => {
            const ch = document.createElement('span');
            ch.className = 'ch';
            ch.style.setProperty('--c', c++);
            ch.textContent = chr;
            wd.appendChild(ch);
          });
          out.appendChild(wd);
        });
      } else if (child.nodeType === 1) {
        if (child.tagName === 'BR') { out.appendChild(child.cloneNode()); return; }
        const clone = child.cloneNode(false);
        walk(child, clone);
        out.appendChild(clone);
      }
    });
  };
  const frag = document.createDocumentFragment();
  walk(el, frag);
  el.textContent = '';
  el.appendChild(frag);
}

/* ==========================================================
   WORK GRID + FILTERS
   ========================================================== */
function coverHTML(p) {
  if (p.img) return `<img src="assets/work/${p.img}.webp" alt="${esc(p.title)} — website screenshot" loading="lazy" width="1120" height="700">`;
  if (p.cat === 'video') {
    const bars = [38, 62, 84, 50, 96, 70, 44, 80, 58, 90, 36, 66, 78, 48, 88, 60, 40, 72].map((h) => `<i style="--h:${h}"></i>`).join('');
    return `<span class="cv cv-video${p.alt ? ' alt' : ''}"><span class="play"></span><span class="bars">${bars}</span></span>`;
  }
  if (p.cat === 'design') return `<span class="cv cv-design${p.alt ? ' alt' : ''}"><i class="sw"></i><i class="sw"></i><i class="sw"></i></span>`;
  const f = p.flow || ['In', 'AI', 'Out'];
  return `<span class="cv cv-ai"><b>${esc(f[0])}</b><u></u><b>${esc(f[1])}</b><u></u><b>${esc(f[2])}</b></span>`;
}

let layoutWorkColumns = () => {};

function initWork() {
  const grid = $('#workGrid');
  if (!grid) return;

  grid.innerHTML = WORK.map((p) => `
    <article class="w-card" data-cat="${p.cat}">
      <a class="w-cover" href="${esc(p.live)}" target="_blank" rel="noopener" aria-label="Open ${esc(p.title)}" data-cursor="Open" data-tilt>
        <span class="w-tag">${esc(p.tag)}</span>
        ${coverHTML(p)}
      </a>
      <div class="w-body">
        <div class="w-row"><h3 class="w-title">${esc(p.title)}</h3><span class="w-kind">${esc(p.kind)}</span></div>
        <p class="w-desc">${esc(p.desc)}</p>
        <div class="w-links">
          <a class="tlink" href="${esc(p.live)}" target="_blank" rel="noopener">${esc(p.liveLabel || 'Visit live site')} ${ARROW}</a>
        </div>
      </div>
    </article>`).join('') + `
    <a class="w-cta" href="#contact" data-cursor="Call">
      <span class="w-kind">Next up</span>
      <span class="w-cta-big">Your site<br>goes <em>here</em></span>
      <span class="tlink">Get a call ${ARROW}</span>
    </a>`;

  const cards = $$('.w-card', grid);
  const filters = $$('.filter');

  filters.forEach((btn) => {
    const f = btn.dataset.filter;
    const n = f === 'all' ? WORK.length : WORK.filter((p) => p.cat === f).length;
    const sup = $('sup', btn);
    if (sup) sup.textContent = String(n).padStart(2, '0');
  });

  // each column drifts at its own speed while scrolling
  layoutWorkColumns = () => {
    const cols = innerWidth > 1080 ? 3 : innerWidth > 760 ? 2 : 1;
    const speeds = cols === 3 ? [0, 0.07, -0.045] : cols === 2 ? [0, 0.06] : [0];
    let i = 0;
    cards.forEach((c) => {
      if (c.classList.contains('is-out')) return;
      const col = i % cols;
      c.style.setProperty('--col', col);
      c.dataset.speed = reduceMotion ? 0 : speeds[col];
      if (!speeds[col]) c.style.translate = '';
      i++;
    });
  };

  function apply(f) {
    filters.forEach((b) => {
      const on = b.dataset.filter === f;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on);
    });
    let n = 0;
    cards.forEach((c) => {
      const show = f === 'all' || c.dataset.cat === f;
      c.classList.toggle('is-out', !show);
      c.classList.remove('is-enter');
      if (show) {
        c.style.setProperty('--n', n++);
        void c.offsetWidth; // restart the entrance animation
        c.classList.add('is-enter', 'is-seen');
      }
    });
    layoutWorkColumns();
    if (lenis) lenis.resize();
    dispatchEvent(new Event('sw:layout'));
  }

  filters.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
  $$('a[data-filter]').forEach((a) => a.addEventListener('click', () => apply(a.dataset.filter)));

  // covers unveil when they scroll into view
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    cards.forEach((c) => io.observe(c));
  } else {
    cards.forEach((c) => c.classList.add('is-seen'));
  }

  // 3D tilt following the pointer
  if (finePointer && !reduceMotion) {
    $$('[data-tilt]', grid).forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', `${(px * 12).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-py * 10).toFixed(2)}deg`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
  }

  layoutWorkColumns();
}

/* ==========================================================
   HERO — floating 3D cards
   ========================================================== */
function initHeroCloud() {
  const cloud = $('#heroCloud');
  if (!cloud) return;

  // x%, y%, z(px), rotateY, rotateZ, width(vw), screenshot
  const CARDS = [
    [50, 71, 160, -6, -2, 20, 'engine-cafe'],
    [28, 76, 60, 24, 3, 16, 'cup2eat'],
    [72, 75, 80, -26, 4, 16, 'dumb-cafe'],
    [11, 63, -170, 38, -6, 12, 'maybac-cafe'],
    [89, 61, -150, -40, 5, 13, 'oscar-pizza'],
    [39, 97, 250, 14, -5, 13, 'the-cakesmith'],
    [63, 98, 280, -12, 6, 14, 'sukoon-cafe'],
    [6, 91, 140, 48, 8, 13, 'cafe-restaurant'],
    [94, 93, 180, -50, -6, 12, 'ninis-kitchen'],
    [19, 45, -420, 30, 4, 10, 'greenlands'],
    [82, 42, -460, -28, -4, 10, 'ks-antarvan'],
    [3, 34, -540, 44, 5, 9, '3-story-cafe'],
    [97, 31, -520, -46, -5, 9, 'cafe-beats-arena'],
  ];

  cloud.innerHTML = CARDS.map(([x, y, z, ry, rz, w, img], i) => {
    const bright = clamp(1 + z / 720, 0.26, 1).toFixed(2);
    const style = `--x:${x}%;--y:${y}%;--z:${z}px;--ry:${ry}deg;--rz:${rz}deg;--w:${w};--b:${bright};--i:${i};--dur:${7 + (i % 5) * 1.3}s;--delay:${-(i * 1.1).toFixed(1)}s`;
    return `<div class="fc" style="${style}"><img src="assets/work/${img}.webp" alt="" width="1120" height="700"></div>`;
  }).join('');
}

/* ==========================================================
   MARQUEES — speed and direction react to scrolling
   ========================================================== */
function initMarquees() {
  const rows = $$('.mq').map((el) => {
    const inner = $('.mq-inner', el);
    const dir = Number(el.dataset.mq) || 1;
    let width = inner.getBoundingClientRect().width;
    const copies = Math.max(2, Math.ceil((innerWidth * 2) / Math.max(1, width)) + 1);
    for (let i = 0; i < copies; i++) el.appendChild(inner.cloneNode(true));
    return { el, inner, dir, x: 0, get w() { return width; }, remeasure() { width = inner.getBoundingClientRect().width; } };
  });
  addEventListener('resize', () => rows.forEach((r) => r.remeasure()));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => rows.forEach((r) => r.remeasure()));

  tickers.push((t, dt, v) => {
    if (reduceMotion) return;
    rows.forEach((r) => {
      if (!r.w) return;
      const speed = (0.055 + Math.min(Math.abs(v), 90) * 0.02) * dt;
      const sign = v < -0.5 ? -r.dir : r.dir;
      r.x -= speed * sign;
      r.x = ((r.x % r.w) + r.w) % r.w - r.w;
      r.el.style.transform = `translate3d(${r.x.toFixed(1)}px, 0, 0) skewX(${clamp(v * -0.14, -9, 9).toFixed(2)}deg)`;
    });
  });
}

/* ==========================================================
   PROBLEM — split headline into words
   ========================================================== */
function splitWords(el) {
  const words = [];
  $$('.row', el).forEach((row) => {
    const parts = row.textContent.trim().split(/\s+/);
    row.innerHTML = parts.map((w) => `<span class="w">${esc(w)}</span>`).join(' ') + ' ';
    words.push(...$$('.w', row));
  });
  return words;
}

/* ==========================================================
   ORBIT — drifting low-poly shards + stars on canvas
   ========================================================== */
function initOrbitCanvas() {
  const canvas = $('#orbitCanvas');
  if (!canvas || reduceMotion) return () => {};
  const ctx = canvas.getContext('2d');
  const section = canvas.parentElement;
  let W = 0, H = 0, shards = [], stars = [], visible = false;
  const m = { x: 0, y: 0 };

  const PALETTE = [['#1c1640', '#2c2266'], ['#1c1640', '#2c2266'], ['#3a2aa0', '#6f4bff'], ['#9c84ff', '#cbb6ff'], ['#d9cdfb', '#f4f1ea']];

  function makeShard() {
    const sides = 4 + Math.floor(Math.random() * 3);
    const depth = Math.random();
    const pts = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const r = 0.5 + Math.random() * 0.5;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    const pi = Math.floor(Math.random() * PALETTE.length);
    return {
      x: Math.random(), y: Math.random(), depth, pts, col: PALETTE[pi],
      size: (pi > 2 ? 5 + Math.random() * 9 : 12 + Math.random() * 34) * (0.5 + depth),
      rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.012,
      vx: (Math.random() - 0.5) * 0.0003, vy: -0.00012 - Math.random() * 0.0004,
    };
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = section.clientWidth;
    H = section.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    shards = Array.from({ length: Math.round(clamp(W / 34, 16, 46)) }, makeShard).sort((a, b) => a.depth - b.depth);
    stars = Array.from({ length: Math.round(clamp(W / 12, 40, 130)) }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.3, p: Math.random() * 6.28 }));
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(section);

  tickers.push((t, dt, v) => {
    if (!visible) return;
    m.x = lerp(m.x, pointer.nx, 0.05);
    m.y = lerp(m.y, pointer.ny, 0.05);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#f4f1ea';
    for (const s of stars) {
      ctx.globalAlpha = 0.25 + 0.45 * Math.abs(Math.sin(t * 0.0012 + s.p));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, 6.28);
      ctx.fill();
    }
    const boost = 1 + Math.min(Math.abs(v), 60) * 0.12;
    for (const s of shards) {
      s.x += s.vx * boost; s.y += s.vy * boost - v * 0.00002 * s.depth; s.rot += s.vr * boost;
      if (s.y < -0.1) s.y = 1.1;
      if (s.y > 1.1) s.y = -0.1;
      if (s.x < -0.1) s.x = 1.1;
      if (s.x > 1.1) s.x = -0.1;
      ctx.save();
      ctx.translate(s.x * W + m.x * 60 * s.depth, s.y * H + m.y * 60 * s.depth);
      ctx.rotate(s.rot);
      ctx.globalAlpha = 0.35 + s.depth * 0.6;
      ctx.beginPath();
      s.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * s.size, y * s.size) : ctx.moveTo(x * s.size, y * s.size)));
      ctx.closePath();
      ctx.fillStyle = s.col[0];
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let i = 0; i < 3; i++) ctx.lineTo(s.pts[i][0] * s.size, s.pts[i][1] * s.size);
      ctx.closePath();
      ctx.fillStyle = s.col[1];
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });

  resize();
  return resize;
}

/* ==========================================================
   SCROLL ENGINE
   ========================================================== */
function initScroll() {
  const hero = $('#hero');
  const cloud = $('#heroCloud');
  const title = $('.hero-title');
  const heroBits = $$('.hero-tag, .hero-actions, .hero-meta, .badge');
  const badge = $('.badge svg');
  const problem = $('#problem');
  const problemTitle = $('#problemTitle');
  const words = problemTitle ? splitWords(problemTitle) : [];
  const driftRows = $$('[data-drift]');
  const orbit = $('#services');
  const orbitSystem = $('#orbitSystem');
  const process = $('#process');
  const track = $('#processTrack');
  const bar = $('#processBar');
  const stepNums = $$('.step-num');
  const pill = $('#pill');
  const contact = $('#contact');
  const glow = $('#contactGlow');
  const progress = $('#progress');
  const themed = $$('[data-theme]');
  const navLinks = $$('.nav-links a');
  const anchors = navLinks.map((a) => $(a.getAttribute('href')));
  const resizeCanvas = initOrbitCanvas();

  // elements that drift at their own speed
  [['.work-title', 0.07], ['.about-title', 0.09], ['.orbit-title', 0.05], ['.contact-lede', -0.04], ['.services-lede', 0.04],
    ['.sticker.s1', 0.16], ['.sticker.s2', -0.12], ['.sticker.s3', 0.22], ['.sticker.s4', -0.18]]
    .forEach(([sel, sp]) => { const el = $(sel); if (el && !reduceMotion) el.dataset.speed = sp; });

  let processDist = 0;
  let horizontal = false;
  let heroP = 0;
  const m = { x: 0, y: 0 };
  const g = { x: innerWidth / 2, y: innerHeight * 0.8 };

  function measure() {
    horizontal = !reduceMotion && innerWidth > 900 && innerHeight > 560;
    if (process && track) {
      if (horizontal) {
        processDist = Math.max(0, track.scrollWidth - innerWidth);
        process.style.height = `${innerHeight + processDist}px`;
      } else {
        processDist = 0;
        process.style.height = '';
        track.style.transform = '';
      }
    }
    layoutWorkColumns();
    resizeCanvas && resizeCanvas();
    if (lenis) lenis.resize();
    update();
  }

  function update() {
    const vh = innerHeight;
    const y = scrollY;
    const max = document.documentElement.scrollHeight - vh;
    if (progress) progress.style.setProperty('--p', clamp(y / Math.max(1, max)).toFixed(4));

    // hero fly-through
    if (hero && !reduceMotion) {
      const r = hero.getBoundingClientRect();
      heroP = clamp(-r.top / Math.max(1, r.height - vh));
      if (title) {
        title.style.transform = `translate3d(0, ${(-heroP * 18).toFixed(2)}vh, 0) scale(${(1 - heroP * 0.14).toFixed(3)})`;
        title.style.opacity = clamp(1 - heroP * 1.5).toFixed(3);
      }
      heroBits.forEach((el) => { el.style.opacity = clamp(1 - heroP * 2.6).toFixed(3); });
    }
    if (badge) badge.style.rotate = `${(y * 0.25).toFixed(1)}deg`;

    // word-by-word headline + rows sliding against each other
    if (words.length) {
      const r = problemTitle.getBoundingClientRect();
      const p = clamp((vh * 0.86 - r.top) / (r.height + vh * 0.3));
      const lit = Math.round(p * (words.length + 1));
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
      if (!reduceMotion && innerWidth > 760) {
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        driftRows.forEach((row) => { row.style.transform = `translate3d(${(c * Number(row.dataset.drift) * 9).toFixed(2)}vw, 0, 0)`; });
      }
    }

    // orbit: starts tilted like a planet system, flattens as it centres
    if (orbitSystem && !reduceMotion) {
      const r = orbitSystem.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.9));
      orbitSystem.style.setProperty('--tilt', (62 * (1 - p)).toFixed(2));
      orbitSystem.style.setProperty('--sc', (0.72 + 0.28 * p).toFixed(3));
    }

    // horizontal process
    if (horizontal && process && processDist > 0) {
      const r = process.getBoundingClientRect();
      const p = clamp(-r.top / processDist);
      track.style.transform = `translate3d(${(-p * processDist).toFixed(1)}px, 0, 0)`;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      stepNums.forEach((n) => {
        const nr = n.parentElement.getBoundingClientRect();
        n.style.setProperty('--px', (((nr.left + nr.width / 2) - innerWidth / 2) * 0.22).toFixed(1));
      });
    }

    // generic parallax
    if (!reduceMotion) {
      $$('[data-speed]').forEach((el) => {
        const sp = Number(el.dataset.speed);
        if (!sp) return;
        const r = el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) return;
        const cur = parseFloat(el.style.translate.split(' ')[1]) || 0;
        const center = r.top - cur + r.height / 2;
        el.style.translate = `0 ${((center - vh / 2) * sp).toFixed(1)}px`;
      });
    }

    // nav colour follows whatever section sits under it
    let theme = 'dark';
    for (const el of themed) {
      const r = el.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40) theme = el.dataset.theme;
    }
    if (document.body.dataset.nav !== theme) document.body.dataset.nav = theme;

    let current = -1;
    anchors.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= vh * 0.45) current = i; });
    navLinks.forEach((a, i) => a.classList.toggle('is-current', i === current));

    if (pill) {
      const nearContact = contact && contact.getBoundingClientRect().top < vh * 0.7;
      pill.classList.toggle('is-on', y > vh * 0.9 && !nearContact);
    }
  }

  onScroll.push(update);
  addEventListener('resize', measure);
  addEventListener('load', measure);
  addEventListener('sw:layout', () => requestAnimationFrame(update));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  // per-frame: hero cloud sways on its own + follows the pointer, contact glow chases the pointer
  tickers.push((t, dt, v) => {
    if (reduceMotion) return;
    if (cloud && heroP < 1) {
      m.x = lerp(m.x, pointer.nx, 0.05);
      m.y = lerp(m.y, pointer.ny, 0.05);
      const swayX = Math.sin(t / 2300) * 3.2;
      const swayY = Math.cos(t / 3100) * 2.2;
      cloud.style.transform =
        `translate3d(0, ${(-heroP * 10).toFixed(2)}%, ${(heroP * 1000).toFixed(1)}px) rotateX(${(-m.y * 6 + swayY).toFixed(2)}deg) rotateY(${(m.x * 9 + swayX).toFixed(2)}deg)`;
    }
    if (glow && contact) {
      const r = contact.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        g.x = lerp(g.x, pointer.x - r.left, 0.06);
        g.y = lerp(g.y, pointer.y - r.top, 0.06);
        glow.style.setProperty('--gx', `${g.x.toFixed(1)}px`);
        glow.style.setProperty('--gy', `${g.y.toFixed(1)}px`);
      }
    }
    // hide the nav while scrolling down, bring it back on the way up
    if (scrollY > 400 && v > 4) document.body.classList.add('nav-hidden');
    else if (v < -2 || scrollY <= 400) document.body.classList.remove('nav-hidden');
  });

  measure();
}

/* ==========================================================
   REVEALS + SPLIT HEADLINES + SCRAMBLE LABELS
   ========================================================== */
const GLYPHS = '!<>-_\\/[]{}=+*^?#';

function scramble(el) {
  if (el._scrambling || reduceMotion) return;
  const text = el.dataset.text || (el.dataset.text = el.textContent);
  el._scrambling = true;
  const start = performance.now();
  const DUR = 620;
  (function step(now) {
    const p = clamp((now - start) / DUR);
    const shown = Math.floor(p * text.length);
    let out = text.slice(0, shown);
    for (let i = shown; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(step);
    else { el.textContent = text; el._scrambling = false; }
  })(start);
}

function initReveals() {
  $$('[data-split]').forEach(splitText);
  const els = $$('.reveal, [data-split]:not(.hero-title), [data-scramble-in]');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if (e.target.hasAttribute('data-scramble-in')) scramble(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
  $$('.chapter-bar span, .filter').forEach((el) => {
    if (el.children.length) return;
    el.addEventListener('pointerenter', () => scramble(el));
  });
}

/* ==========================================================
   MENU, CURSOR, MAGNETIC, STICKERS, CLICK SPARKS, GHOST TRAIL
   ========================================================== */
function initMenu() {
  const btn = $('#menuBtn');
  const menu = $('#menu');
  if (!btn || !menu) return () => {};
  const label = $('.menu-btn-label', btn);
  const set = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', !open);
    btn.setAttribute('aria-expanded', open);
    document.body.classList.toggle('menu-open', open);
    if (label) label.textContent = open ? 'Close' : 'Menu';
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  btn.addEventListener('click', () => set(!menu.classList.contains('is-open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (innerWidth > 1080) set(false); });
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
    lenis.scrollTo(id === '#top' ? 0 : target, { duration: 1.5 });
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });
}

function initCursor() {
  const cursor = $('#cursor');
  if (!cursor || !finePointer || reduceMotion) return;
  const label = $('b', cursor);
  let x = -100, y = -100;
  addEventListener('pointermove', () => cursor.classList.add('is-live'), { once: true });
  addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.addEventListener('pointerover', (e) => {
    const lab = e.target.closest('[data-cursor]');
    cursor.classList.toggle('is-label', !!lab);
    if (lab && label) label.textContent = lab.dataset.cursor;
    cursor.classList.toggle('is-hover', !lab && !!e.target.closest('a, button, [data-drag]'));
  });
  tickers.push(() => {
    x = lerp(x, pointer.x, 0.2);
    y = lerp(y, pointer.y, 0.2);
    cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  });
}

function initMagnetic() {
  if (!finePointer || reduceMotion) return;
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(dx * 0.28).toFixed(1)}px, ${(dy * 0.36).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  // service rows: the dark fill slides in from whichever edge the pointer entered
  $$('.svc a').forEach((a) => {
    const set = (e) => {
      const r = a.getBoundingClientRect();
      a.classList.toggle('from-top', e.clientY < r.top + r.height / 2);
    };
    a.addEventListener('pointerenter', set);
    a.addEventListener('pointerleave', set);
  });
}

function initStickers() {
  $$('[data-drag]').forEach((el) => {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    el.addEventListener('pointerdown', (e) => {
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-drag');
      e.preventDefault();
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      el.style.setProperty('--dx', `${ox + e.clientX - sx}px`);
      el.style.setProperty('--dy', `${oy + e.clientY - sy}px`);
    });
    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      ox += e.clientX - sx; oy += e.clientY - sy;
      el.classList.remove('is-drag');
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  });
}

function initFx() {
  const fx = $('#fx');
  if (!fx || reduceMotion) return;

  // little burst of sparks on every click / tap
  addEventListener('pointerdown', (e) => {
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('span');
      const a = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
      const d = 34 + Math.random() * 46;
      s.className = 'spark';
      s.textContent = '✦';
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      s.style.setProperty('--tx', `${(Math.cos(a) * d).toFixed(0)}px`);
      s.style.setProperty('--ty', `${(Math.sin(a) * d).toFixed(0)}px`);
      s.addEventListener('animationend', () => s.remove());
      fx.appendChild(s);
    }
  });

  // "every other website": identical wireframe cards trail the pointer in the problem section
  const problem = $('#problem');
  if (problem && finePointer) {
    let lx = 0, ly = 0;
    problem.addEventListener('pointermove', (e) => {
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < 90) return;
      lx = e.clientX; ly = e.clientY;
      const gh = document.createElement('span');
      gh.className = 'ghost';
      gh.style.left = `${e.clientX}px`;
      gh.style.top = `${e.clientY}px`;
      gh.style.setProperty('--r', `${(Math.random() * 24 - 12).toFixed(1)}deg`);
      gh.addEventListener('animationend', () => gh.remove());
      fx.appendChild(gh);
    });
  }
}

/* ==========================================================
   LOADER
   ========================================================== */
function initLoader() {
  const pct = $('#loaderPct');
  const word = $('#loaderWord');
  const done = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    const ht = $('.hero-title');
    if (ht) ht.classList.add('is-in');
    if (lenis) lenis.start();
  };
  if (reduceMotion || !pct) return done();

  const arcA = $('.loader-mark .mk-a');
  const arcB = $('.loader-mark .mk-b');
  const WORDS = ['Warming up', 'Mixing colours', 'Tuning pixels', 'Almost there', 'Go'];
  const start = performance.now();
  const DURATION = 1500;
  let fontsReady = false;
  const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fonts.then(() => { fontsReady = true; });
  setTimeout(() => { fontsReady = true; }, 3000); // never wait forever

  (function tick(now) {
    const t = clamp((now - start) / DURATION);
    const eased = 1 - Math.pow(1 - t, 3);
    const shown = Math.min(fontsReady ? 100 : 92, Math.round(eased * 100));
    pct.textContent = shown;
    if (word) word.textContent = WORDS[Math.min(WORDS.length - 1, Math.floor(shown / 25))];
    if (arcA) arcA.style.setProperty('--o', (1 - clamp(shown / 55)).toFixed(3));
    if (arcB) arcB.style.setProperty('--o', (1 - clamp((shown - 45) / 55)).toFixed(3));
    if (t >= 1 && fontsReady) setTimeout(done, 240);
    else requestAnimationFrame(tick);
  })(start);
}

/* ==========================================================
   BOOT
   ========================================================== */
function boot() {
  const safe = (fn) => { try { return fn(); } catch (err) { console.error(err); } };

  // buttery smooth scrolling (falls back to native if the library didn't load)
  if (window.Lenis && !reduceMotion) {
    safe(() => {
      lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
      lenis.stop();
    });
  }

  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.nx = e.clientX / innerWidth - 0.5;
    pointer.ny = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  safe(initContact);
  safe(initWork);
  safe(initHeroCloud);
  safe(initReveals);
  safe(initMarquees);
  safe(initScroll);
  const closeMenu = safe(initMenu) || (() => {});
  safe(() => initAnchors(closeMenu));
  safe(initCursor);
  safe(initMagnetic);
  safe(initStickers);
  safe(initFx);
  safe(initLoader);

  // one animation loop drives everything
  let last = performance.now();
  let lastY = scrollY;
  let vel = 0;
  (function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    if (lenis) safe(() => lenis.raf(now));
    const y = scrollY;
    vel = lerp(vel, y - lastY, 0.14);
    if (Math.abs(vel) < 0.01) vel = 0;
    if (y !== lastY) onScroll.forEach((fn) => safe(fn));
    lastY = y;
    tickers.forEach((fn) => safe(() => fn(now, dt, vel)));
    requestAnimationFrame(frame);
  })(last);

  // a little wink when the tab loses focus
  const baseTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'Come back — we were mid-sentence ✦' : baseTitle;
  });

  // whatever happens, never leave the loader up
  setTimeout(() => {
    if (!document.body.classList.contains('is-loading')) return;
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    const ht = $('.hero-title');
    if (ht) ht.classList.add('is-in');
    if (lenis) lenis.start();
  }, 5000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
