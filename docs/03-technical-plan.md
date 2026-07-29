# Kivotra — Technical Plan

## 1. Audit result (Phase 1)

Per direction: **this is a fresh website.** Nothing content-level is carried
forward.

**Kept (scaffold only):**
- Next.js App Router + TypeScript project shell, `lint`/`typecheck` scripts.
- The architectural *pattern* already proven here: single persistent WebGL
  canvas + pinned stage + master scrubbed timeline + server-rendered static
  fallback + dynamic import of the heavy experience. The pattern survives;
  every implementation file is rewritten.

**Replaced entirely:**
- All copy, metadata, positioning ("local business" framing is retired).
- All scenes, components, content data, imagery.

**Upgraded (Phase 5, first commit):**
- Next 14 → **Next 15 (latest stable)**, React 18 → **React 19**,
  R3F 8 → **@react-three/fiber 9** (+ matching drei/postprocessing), current
  three.js and GSAP. One clean upgrade commit, gate-verified, before any
  feature work.
- `Archive/` remains gitignored and untouched.

## 2. Architecture

```
app/
  layout.tsx            fonts, metadata, theme tokens
  page.tsx              server component → <Experience/>
  globals.css           design tokens (CSS variables), reset, typography
components/
  experience/
    Experience.tsx      client gate: WebGL + reduced-motion detection
    Film.tsx            pinned stage + scroll spacer + master ScrollTrigger
    CanvasRoot.tsx      single persistent R3F canvas, DPR cap, capability tiers
    TextLayer.tsx       all copy: HTML lines keyed to progress windows
    chapters/           one module per chapter (01-signal … 10-conversion)
  static/
    StaticEdition.tsx   designed no-WebGL/reduced-motion/SEO edition
  ui/                   Nav, Cta, Footer, KMark (fixed-aspect SVG)
lib/
  timeline.ts           chapter ranges, progress mapping, easing utilities
  scene-manager.ts      registers chapters, distributes progress, handles
                        enter/exit + resource load/dispose by proximity
  copy.ts               every display line, chapter-keyed (single source)
  quality.ts            device tier detection → high | medium | mobile
content/
  work.ts               typed case-study records (placeholder → replaceable)
public/assets/          Higgsfield outputs: AVIF/WebP plates, WebM/MP4 video
docs/                   these foundation documents
```

### Scene manager (the anti-"dozens of ScrollTriggers" system)
- **One** ScrollTrigger pins the stage and scrubs a master progress value.
- `scene-manager` maps master progress into per-chapter local progress
  (0→1 inside each chapter's range) and calls pure
  `update(localProgress, tier)` on each chapter. All state derives from
  progress → automatically reversible, scrub-safe, resize-stable.
- Chapters expose `load()` / `dispose()`; the manager preloads a chapter when
  the visitor is within one chapter of it and disposes geometry/textures two
  chapters behind. GSAP work lives in one `gsap.context()` torn down on
  unmount.
- Lenis: included behind a flag; enabled only if scrub feel measurably
  improves on wheel devices, always disabled for touch.

### Text layer
All narrative copy is HTML (`TextLayer`), absolutely positioned by the scene
manager (screen-space or tracked to 3D anchors via projected coordinates).
Windows come from `copy.ts` with enforced non-overlap (build-time check:
no two lines' progress windows intersect within a chapter).

### Hybrid rendering policy
- Real-time: the K, corridor, fracture morph, network, pull-back (interaction
  and reversibility carry the value).
- Prerendered (Higgsfield): case-study plates, densest software surface,
  in-glass environment textures — mounted on planes with parallax. Video is
  scrub-frame-controlled (short, stable, keyframe-dense encodes), never
  free-running autoplay under scroll control.

## 3. Performance budget

- JS shipped to no-WebGL visitors: static edition only (experience is
  `dynamic(..., { ssr: false })` and never fetched).
- DPR capped at 1.75 (1.5 on mobile tier). Post-processing limited to one
  composer pass chain (bloom kept subtle + vignette); disabled on mobile tier.
- Textures: KTX2/compressed where meaningful; images AVIF with WebP fallback,
  sized per breakpoint; video WebM (VP9/AV1) + MP4 (H.264) fallback.
- Geometry via Draco/Meshopt if any authored meshes exceed trivial size.
- Targets: 60fps desktop / 40fps+ mid-tier mobile during scrub; LCP < 2.5s
  (static hero text is the LCP, not the canvas); CLS ≈ 0 (canvas and stage
  are fixed-size from first paint).
- Full disposal audit: every chapter's `dispose()` verified against
  `renderer.info` in the debug overlay.

## 4. Accessibility & fallbacks

- Reduced motion or no WebGL → static edition (same copy, designed layout).
- All CTAs/links native elements, focus-visible styles, logical tab order
  (text layer follows document order = narrative order).
- The film is presentational: `aria-hidden` on the canvas; the copy in the
  text layer is real DOM in narrative order.
- Keyboard users can traverse the page without the film blocking them.

## 5. Build phases & gates

Follows the approved 8-phase process. Each build phase ends with the full
gate — `npm run lint`, `npm run typecheck`, `npm run build`,
`npm audit --omit=dev` — all clean, then STOP for review:

1. ✅ **Audit** (this document, §1)
2. ✅ **Creative direction** (`01-creative-direction.md`)
3. ✅ **Storyboard** (`02-storyboard.md`)
4. **Visual exploration** — Higgsfield concept rounds per
   `04-higgsfield-assets.md`; critique, select, refine.
5. **Foundation** — dependency upgrade, tokens, typography, Nav/Footer,
   loading experience, scene manager, TextLayer, quality tiers, static
   edition skeleton.
6. **Hero prototype** — Chapters 01–02 + the through-the-glass transition,
   desktop + mobile, performance-verified. Severe critique before continuing.
7. **Full experience** — chapters 03→10 sequentially; run, inspect, test
   scroll/transitions/mobile after each.
8. **QA** — Chrome/Safari desktop + mobile, common laptop + ultra-wide
   resolutions, reduced motion, slow connections, mid-scroll refresh, resize,
   keyboard navigation.
