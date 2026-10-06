# tendool.me

Portfolio for Sala Tendool Srivatsav — AI/ML & Data Engineer.
Next.js (App Router) · Tailwind CSS v4 · React Three Fiber.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

`next build` and `next dev` share the `.next` directory, and a production build
left there makes the dev server serve a client manifest pointing at chunk names
that do not exist — every dynamic import then fails with `ChunkLoadError`.
`predev` runs `scripts/clean-stale-build.mjs`, which clears `.next` only when a
production `BUILD_ID` is present, so the dev incremental cache survives normal
use. If you ever run `next build` **while** the dev server is live, restart the
dev server afterwards.

## Deploying on Render

This is a Next.js server app (`next start`), not a static export — the repo
used to also hold the old single-file v1 site (`index.html` at the root, and
an archived copy at `legacy/index.html`), which is exactly the kind of file a
naive "is there an index.html?" static-site heuristic latches onto. Both are
gone now; `render.yaml` makes the deploy target explicit either way:

1. In Render: **New +** → **Blueprint** → point it at this repo. Render reads
   `render.yaml` and configures the service for you — no manual settings.
2. If you instead use **New +** → **Web Service**, set:
   - **Runtime:** Node
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Node version:** matches `.node-version` (`20.18.1`) / `engines.node`
     in `package.json` (`>=20.9.0`) — Render reads either automatically.

Render injects a `PORT` env var the app must bind to. Nothing to configure for
that: `next start` reads `process.env.PORT` and binds `0.0.0.0` whenever no
`-p`/`-H` flag is passed (verified straight from the installed Next.js CLI
source, and by actually running `PORT=4173 npm run start` and curling it).

## Where things live

| Path | Purpose |
| --- | --- |
| `lib/data.ts` | **All copy.** Profile, featured work, every project, experience, toolkit, education, photographs. Edit here, not in components. |
| `app/page.tsx` | Section order, and the check that decides whether the photographs section appears. |
| `app/globals.css` | Theme tokens (light and dark), the figure inks, and the few shared styles. |
| `components/figures/dither.ts` | The one shader every figure uses, plus the cursor-following light. |
| `components/figures/scenes.tsx` | The drawings: the GPU (hero), agent graph, voice ring, staircase, eye, Bloch sphere, pills. |
| `components/figures/Backdrop.tsx` | The animated dot-grid page background. |
| `components/figures/Stage.tsx` | The single fixed canvas that draws the background and every figure. |
| `components/Portrait.tsx` | The two-ink portrait, dithered on a 2D canvas from `public/assets/profile.png`. |

## Design

Warm paper, near-black ink and one signal orange, set in Newsreader (display),
Schibsted Grotesk (text) and JetBrains Mono (dates, captions, figure numbers).
The page reads like a printed report: plain section names, ruled tables and
illustrations framed with crop marks. Behind everything is a dot grid like
notebook paper, kept almost invisible: only the crest of a slow wave and the
area around the cursor bring the dots up.

On screens wider than 1536px the root font size grows gently (to 22px at
2560px). Every size in the layout is in rem, so type, spacing and columns
scale together and the page fills large monitors instead of sitting in a
narrow strip; laptop sizes are unaffected.

Light and dark themes are both first-class. The visitor's system setting
picks one on the first visit; the toggle in the header overrides it and is
remembered. Every colour is a token in `app/globals.css` — change a value
there and the type, rules, figures and portrait all follow, including the
WebGL side, which reads the `--fig-*` tokens at runtime.

## The figures

Each figure is a small three.js scene drawn in two inks with an 8×8 ordered
(Bayer) dither, so they print like 1-bit illustrations rather than renders.

- **One canvas, many figures.** Every `<Figure>` is a drei `View`: a
  transparent box in the page that a single fixed canvas behind the content
  scissors and draws into. Every figure and the background share one WebGL
  context, and a figure that is scrolled away costs nothing.
- **Lit by the cursor.** Each figure's light swings towards wherever the mouse
  is relative to that figure, so everything on screen shares one moving lamp.
  On touch screens the light drifts on its own.
- **Hover a project** and its figure re-inks in the accent.
- **The hero is a graphics card** drawn like a technical illustration. Every
  few seconds it lifts apart into an exploded view — shroud and fans, heatsink,
  then the board with the GPU die and memory — and settles back together.
  Hovering spins the fans up; drag it to turn it, and it settles back to its
  resting angle.

Everything is built from primitives in code — there are no model or texture
files. With `prefers-reduced-motion` the figures and the background wave hold
still (the light still follows the cursor). Without WebGL the frames show a quiet dot screen instead.

## Adding project photographs

Drop images into `public/assets/projects/` using the exact filenames listed in
the `GALLERY` array in `lib/data.ts`, then rebuild. A "From the bench"
section appears automatically once at least one file exists; entries without a
file are simply left out. Aim for ~1600px on the long edge, landscape, under
~400KB.

**Client work stays labelled by capability only** — no internal project names,
no screenshots showing client branding, employee data or internal URLs.

## Notes

- All Three.js is behind `dynamic(..., { ssr: false })`; nothing WebGL runs on
  the server.
