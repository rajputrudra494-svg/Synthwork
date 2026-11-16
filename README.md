# Synthworks

Portfolio site for Synthworks — websites, design, video and AI automation.

Live: https://synthwork.vercel.app/

A static, front-end-only site: plain HTML, CSS and JavaScript with no build step and no backend.

## The idea

**Signal.** Everyone else online is noise; the studio is the signal. The whole page sits on one WebGL canvas:
a slowly flowing atmosphere of light in three colour channels (flare, volt, iris) with specks of light drifting
in depth. The same three channels make up the 3D mark and lock into white.

- **Hero** — kinetic type (the font's width axis swells around your cursor) over the flowing light, with the
  S mark as three glowing 3D tubes that lock into white, follow the mouse and fly at you as you scroll away.
- **Problem** — a fly-through of hundreds of identical template pages; one of them becomes the Synthworks mark.
- **Services** — six partials that add up to one waveform as you scroll; hover or tap a service to see its part.
- **Work** — the 13 screenshots are WebGL planes whose colour channels snap into register.
- **Process** — three lines travel through four steps and lock together.
- **Contact** — the screen rings like a phone; giant tap-to-call numbers and India's local time.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole site (single page, sections linked from the nav) |
| `styles.css` | All styling |
| `js/main.js` | Portfolio data, scroll choreography, kinetic type and interactions |
| `js/stage.js` | The WebGL stage (Three.js and custom shaders), including the 3D mark |
| `js/fx.js` | Scroll and pointer effects: hero exit, headline reveals, client marquee, light trail, magnetic buttons |
| `assets/work/` | Portfolio screenshots (16:10, `.webp`) |
| `assets/logo-mark.svg`, `assets/logo-mark-dark.svg`, `favicon.svg` | Logo |
| `portfolio.html`, `contact.html` | Redirects so old links keep working |

Libraries come from the jsDelivr CDN: Three.js (via the import map in `index.html`), GSAP + ScrollTrigger, and Lenis.
Fonts: Anybody and Instrument Sans from Google Fonts.

## Editing

- **Add or remove a project:** edit the `WORK` list at the top of `js/main.js`. Put a 16:10 screenshot in
  `assets/work/` as `name.webp` and set `img: 'name'`.
- **Change phone numbers or email:** search `index.html` for `tel:` and `mailto:`, and update `CONTACT` in `js/main.js`.
- **Colours and fonts:** the variables at the top of `styles.css`. The shader colours are `C_FLARE`, `C_VOLT` and
  `C_IRIS` at the top of `js/stage.js`.
- **After changing CSS or JS**, bump the `?v=` number on the `styles.css` and `js/main.js` links in `index.html`
  (and on the `./stage.js` and `./fx.js` imports in `js/main.js`) so browsers don't keep an old copy.

## Performance and accessibility

- Quality tiers (`high`, `mid`, `low`) pick line and page counts and a pixel budget from the device; the stage also
  lowers its resolution on its own if frames run slow. Force a tier for testing with `?tier=low`.
- `prefers-reduced-motion` turns off smooth scroll, scroll-driven scenes and animation; everything is shown in place.
- Without WebGL the screenshots show as normal images and the page still works.
- `?debug` exposes `window.__sw` (the stage, tier and scroll engine) for testing.

## Run locally

```bash
python -m http.server 5178
```

Then open http://localhost:5178
