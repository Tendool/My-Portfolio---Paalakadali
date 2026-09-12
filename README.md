# tendool.me

Portfolio for Sala Tendool Srivatsav — AI/ML Engineer.
Next.js (App Router) · Tailwind CSS v4 · React Three Fiber · GSAP.

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
| `lib/data.ts` | **All copy.** Roster, timeline, projects, arsenal, album, education, contact. Edit here, not in components. |
| `lib/quality.tsx` | Device-tier detection + live FPS watchdog that scales particle counts and DPR. |
| `lib/flight.ts` | Scroll / pointer / drag state, read every frame by the 3D layer without re-rendering React. |
| `lib/stations.ts` | **The flight plan.** Where every body sits along the corridor, and its surface spec. Edit here to re-order or re-place the solar system. |
| `components/three/Universe.tsx` | Scene root: the scroll-driven camera and every station. |
| `components/three/Galaxy.tsx` | The hero galaxy: spiral generation, cursor repulsion, scroll split. |
| `components/three/Bodies.tsx` | One shader for every planet, plus the Sun. |
| `components/three/Constructs.tsx` | Asteroid belt, satellite, data core, beacon. |
| `components/three/SkillSphere.tsx` | Skills on a Fibonacci sphere. |
| `app/globals.css` | Theme tokens and the glassmorphic HUD styles. |

## Adding album photos

Drop images into `public/assets/projects/` using the exact filenames listed in
the `GALLERY` array in `lib/data.ts`. Each frame fills itself in on reload; a
missing file degrades to an on-theme "No Signal" panel naming the file to add.
Aim for ~1600px on the long edge, landscape, under ~400KB.

**Client work stays labelled by capability only** — no internal project names,
no screenshots showing client branding, employee data or internal URLs.

## The 3D layer

One WebGL scene runs behind the whole page and the camera flies down it as you
scroll — out through the solar system in real order, the asteroid belt sitting
between Mars and Jupiter where it belongs, then deep-space constructs.

- **Drag the galaxy** (outside panels, links and buttons) to spin it; it coasts
  to a stop.
- **Move the cursor over it** and stars are shouldered aside individually,
  returning to their exact positions as it leaves.
- **Scroll** and the disc parts left and right, clearing the middle of the page.
  Scrolling back to the top reassembles it.
- **Drag the skill sphere** in the Arsenal to bring its far side round.

Every object is procedural — there are no model or texture files. Planets share
one shader driven by a `kind` (rock / terran / gas / ice) plus band and grain
amounts, so Mercury and Jupiter are the same draw call with different uniforms.

Quality scales automatically: 27k galaxy stars and 420 asteroids on a desktop
GPU down to 4k and 80 on a phone, with a frame watchdog that drops a tier if the
page cannot hold 60fps. Lateral offsets are squeezed on narrow viewports, or
every body would fall outside a phone's much narrower frustum.

## Theme

Black ground, paper-white type, one accent (`#8B5CF6`) rationed to CTAs, hovers,
glows and planet rim-light. The accent lives in one place: `--color-accent` in
`app/globals.css`, mirrored by `ACCENT` in `components/three/Universe.tsx` for
the WebGL side.

## Notes

- All Three.js is behind `dynamic(..., { ssr: false })`; nothing WebGL runs on
  the server.
