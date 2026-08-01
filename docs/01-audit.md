# Phase 1 — Repository Audit

_Date: 2026-07-30_

## Current state

`kivotra-web` — Next.js 14 (App Router) + TypeScript + React Three Fiber 8 + GSAP 3.12 + Lenis 1.1 + Three 0.169. Clean git tree on `main`, pushed to origin.

The repo contains a **previous site iteration** aimed at local small businesses (restaurants, gyms, salons, trades) with AI-receptionist / booking-automation messaging. That positioning is obsolete under the new brief (premium digital engineering company).

## Keep — the chassis is good

| Asset | Why it stays |
|---|---|
| `lib/cinema.ts` | Single mutable channel (`chan`) written only by the master timeline, read by the render loop. Zero React re-renders during scroll. This is exactly the "coordinated animation system" the brief demands. |
| Master-timeline pattern (`Stage.tsx`) | One ScrollTrigger scrubbing one GSAP timeline — not dozens of triggers. Pattern survives; contents will be rebuilt. |
| `detectTier()` / `hasWebGL()` | Device-tier + capability detection with static fallback path. Required by the brief. |
| `Fallback.tsx` pattern | Non-WebGL graceful path exists. |
| `lib/gsap.ts` | Plugin registration helper. |
| Tooling | `typecheck` script, ESLint, tsconfig — fine. |

## Replace

| Asset | Reason |
|---|---|
| `lib/copy.ts` | Entire voice is small-business AI-agency ("AI Receptionist", "Book a Call", industry tiles). Contradicts new positioning and banned-phrase list. Full rewrite. |
| Scene structure (`SCENE_MARKS`: hero → website → interaction → pipeline → dashboard → showcase → finale) | Replaced by the 10-chapter Kivotra Engine storyboard. |
| `Stage.tsx`, `Scene.tsx`, `KModel.tsx`, `GlassK.tsx` internals | Rebuilt against the new storyboard and material direction. Techniques (light-builds-the-K, unfold) may be salvaged where they serve the new narrative. |
| `public/img`, `public/video` (Veyra Estates etc.) | Previous placeholder projects; superseded by new Higgsfield-produced assets and new case-study system. |
| `components/cinema/Inspector.tsx` | Dev tool — keep during development, exclude from production UI. |

## Upgrade considerations

- Next 14 → latest stable 15.x, React 18 → 19, R3F 8 → 9 (R3F 9 requires React 19). Do this at Phase 5 foundation, in one commit, before new scene work.
- Add `@gsap/react` `useGSAP` usage consistently for context cleanup (already a dependency).
- Lenis stays **only if** trackpad/wheel normalization proves necessary during the hero prototype; otherwise native scroll + ScrollTrigger scrub.
