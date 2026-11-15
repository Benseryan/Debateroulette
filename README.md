# Debate Roulette

A cozy pixel-art library that reveals random research topics for competitive debaters.

**Production repository:** https://github.com/Benseryan/Debateroulette

The visual design originated in Lovable. This is an independent React / Vite implementation: no Lovable runtime, account, hosting, or backend is needed.

## Use

Click **PULL A TOPIC** (or use Space / Enter) to reveal a topic. Choose a drawer/category to narrow the pool. Recent pulls are remembered in your browser.

## Local development (optional)

```bash
npm install
npm run dev
```

## Production deployment

On every push to `main`, GitHub Actions installs dependencies, builds a static site and deploys `dist/` to GitHub Pages.

To activate initially, go to **Settings → Pages → Build and deployment → Source → GitHub Actions** in this repository. The deployment workflow then publishes to:

https://benseryan.github.io/Debateroulette/

See `GITHUB_PAGES_SETUP.md` for troubleshooting. GitHub Pages does not require Lovable to be running.

## Source

- `src/components/stacks/` — physical card catalogue and pixel-library layers
- `src/lib/topics.ts` — editable research topics
- `src/lib/spinner.ts` — randomized nonrepeating selection
- `src/styles.css` — original art direction, fonts and animations
- `src/assets/library-scene.png` — pixel-art illustration
