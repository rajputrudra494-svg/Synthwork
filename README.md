# Synthworks

Portfolio site for Synthworks — websites, design, video and AI automation.

Live: https://synthwork.vercel.app/

A static, front-end-only site: plain HTML, CSS and JavaScript with no build step and no backend.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole site (single page, sections linked from the nav) |
| `styles.css` | All styling and CSS animation |
| `main.js` | Portfolio data, scroll effects and interactions |
| `assets/work/` | Portfolio cover images |
| `assets/logo-mark.svg`, `assets/logo-mark-dark.svg`, `favicon.svg` | Logo |
| `portfolio.html`, `contact.html` | Redirects so old links keep working |

## Editing

- **Add or remove a project:** edit the `WORK` list at the top of `main.js`. For a website, put a 16:10 screenshot in `assets/work/` as `name.webp` and set `img: 'name'`.
- **Change phone numbers or email:** search `index.html` for `tel:` and `mailto:`, and update `CONTACT` in `main.js`.
- **Colours and fonts:** the variables at the top of `styles.css`.

## Run locally

```bash
python -m http.server 5178
```

Then open http://localhost:5178
