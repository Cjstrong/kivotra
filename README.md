# Kivotra

**Websites that win attention. Systems that run the business.**

The Kivotra homepage — a single continuous, scroll-driven brand film. One
persistent WebGL canvas, one master GSAP timeline, and a signature 3D
sculpture that mechanically unfolds into a website, feeds a lead through an
automation pipeline, assembles a command centre, presents the portfolio, and
reconstructs itself exactly — the closing frame mirrors the opening.

## Stack

- **Next.js 14** (App Router, static export-friendly)
- **React Three Fiber + drei + postprocessing** — the signature object, studio lighting, restrained bloom
- **GSAP + ScrollTrigger** — the single master timeline that owns every animation (DOM and WebGL)
- **Lenis** — smooth scroll, synced to the GSAP ticker
- TypeScript, CSS Modules

## Architecture

```
app/                  Next.js shell + global tokens
components/cinema/
  Cinema.tsx          Composition: canvas + stage + nav (+ dev inspector)
  CinemaCanvas.tsx    The one persistent <Canvas> (adaptive DPR, pauses when hidden)
  Scene.tsx           Studio lighting, camera rig, contact shadow, post
  KModel.tsx          The signature sculpture (split spine, blades, light channel)
  Stage.tsx           All scene DOM + THE master timeline (scenes, loop, mobile edit)
  Stage.module.css    Scene compositions, client concept brands, mobile edit
  Nav.tsx             Translucent nav, revealed after the opening frame
  Fallback.tsx        Static SSR telling of the story (SEO / no-WebGL / reduced motion)
  Inspector.tsx       Dev-only cinematic inspector (?debug=cinema, dev builds only)
lib/
  cinema.ts           Shared channels — written only by the master timeline
  copy.ts             Every word on the page
  gsap.ts             GSAP + ScrollTrigger registration
public/img/           Generated concept-build photography (optimized)
```

Key principles:

- **One timeline.** No component reads raw scroll. `Stage.tsx` scrubs a single
  GSAP timeline; the 3D scene reads the `chan` channels that timeline writes.
- **Every frame finished.** Scenes are sequenced entrance → hold → exit; no
  two copy blocks ever coexist. Stop anywhere — it composes.
- **The loop.** The finale tweens back to the literal `openingPose` object, so
  the last frame is the first.
- **Tiers.** Quality adapts (high / mid / low) by device; reduced-motion and
  no-WebGL visitors get the static `Fallback`.

## Develop

```bash
npm install
npm run dev            # http://localhost:3000
# dev inspector: http://localhost:3000/?debug=cinema  (` toggles panel)
# jump to a frame:  /?p=0.42
```

## Verify & ship

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

## Notes

- The three portfolio projects (Aurelia Dental, Forge & Sons, Olive & Ash)
  are **concept builds** with generated photography — not client work.
- The sculpture is procedural (`KModel.tsx`); the marked asset-replacement
  point accepts a sculpted Draco GLB without touching the choreography.
