# Phase 3b — Technical Plan

## Stack decisions

- **Next.js 15 (App Router) + React 19 + TS** — upgrade from current 14/18 at Phase 5, single commit, before scene work.
- **R3F 9 + Three (current stable)** — one persistent `<Canvas>` for the whole film; scenes are groups toggled/lerped by the master timeline, never mounted/unmounted mid-scroll.
- **GSAP + ScrollTrigger** — exactly **one** pinned ScrollTrigger scrubbing **one** master timeline. Chapters are labeled ranges. All WebGL state flows through `lib/cinema.ts` `chan` (kept from audit).
- **Lenis** — decision deferred to Phase 6 prototype: include only if native scroll scrubbing shows jitter on trackpad Safari.
- **No state library, no CSS framework.** CSS Modules + custom properties (design tokens).

## Architecture

```
app/
  layout.tsx        fonts, tokens, metadata
  page.tsx          <Film/> (dynamic import, ssr:false for canvas half)
components/film/
  Film.tsx          orchestrator: builds master timeline, owns ScrollTrigger
  Canvas.tsx        persistent R3F canvas, tier-based flags
  chapters/         one module per chapter: {range, build(tl), Scene}
    01-signal/ … 10-conversion/
  copy/             HTML copy layers, world-anchored positioning helper
  fallback/         image-sequence player (canvas 2D) + reduced-motion frames
lib/
  cinema.ts         chan + tier/webgl detection (kept)
  timeline.ts       chapter registry, label math, progress utils
  copy.ts           rewritten voice
  work.ts           typed case-study data
public/
  film/             prerendered plates & sequences (AVIF/WebP + WebM)
```

Chapter module contract: each chapter exports `range: [number, number]`, `build(tl)` adding its tweens on `chan`/DOM within that range, and an optional `Scene` (R3F group). `Film.tsx` composes them — adding/removing a chapter never touches another file. This is the "coordinated system with defined scenes, progress ranges, transition states" the brief requires.

## Text handling

All copy is HTML, absolutely positioned in a `copy` layer above the canvas. World-anchored lines (Ch 03) use a projection helper that reads camera state from `chan` each frame and writes `transform` — copy stays selectable, accessible, SEO-visible. `aria-hidden` never used on narrative copy; canvas is `aria-hidden`.

## Performance budget

- JS ≤ 300KB gz initial (three + gsap dominate; everything else dynamic).
- DPR cap 2.0 high tier, 1.5 mid, 1.0 low.
- Draco/meshopt for the K model (only real mesh asset).
- Plates: AVIF + WebP fallback, ≤ 350KB each at delivered size; sequences: WebM (VP9) + MP4 fallback, scrubbed via `currentTime` only on low tier.
- Preload: chapter N+1's assets when N is 50% viewed (IntersectionObserver on spacer divs).
- All GSAP in `useGSAP` contexts; Three resources disposed on unmount; `visibilitychange` pauses RAF.

## Fallback ladder (from creative direction, made concrete)

| Tier | Renderer | Trigger |
|---|---|---|
| high | full R3F, transmission materials, refraction | default desktop |
| mid | R3F, baked matcaps, DPR 1.5, no postprocessing | `detectTier() === "mid"` |
| low | prerendered sequence scrub, no WebGL context | low tier or `!hasWebGL()` |
| static | composed stills, opacity swaps | `prefers-reduced-motion` |

## Testing matrix (Phase 8)

Chrome/Safari desktop · Safari/Chrome iOS+Android · 1280/1440/1920/3440 widths · reduced motion · 3G throttle · refresh at 0/25/50/75/100% scroll · resize mid-scroll · keyboard-only pass (skip-to-content link jumps past the film to conversion + footer).

## Build order (Phases 5–7)

1. Foundation: tokens, type system, upgraded deps, `timeline.ts`, empty chapter registry, nav, loading, fallback player shell.
2. Hero prototype: Ch 01 + 02 + the pass-through transition into Ch 03's first frame. Prove material, camera, scrub, copy, mobile framing, 60fps mid-tier. **Stop and critique.**
3. Chapters sequentially 03 → 10, run + critique after each.
