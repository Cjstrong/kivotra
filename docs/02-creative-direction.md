# Phase 2 — Creative Direction

## Concept

**THE KIVOTRA ENGINE.** The homepage is one continuous camera move through a single machine. The machine is the argument: businesses enter it ordinary and repeated; they leave it engineered and distinct. The K is the machine's housing — the first thing built, the thing we travel through, and the completed object we return to. Nothing on the page is a "section"; every scene is a state of the same environment.

One sentence to test every decision against: *does this moment show transformation from generic to engineered?* If not, cut it.

## Narrative structure

Three acts across ten chapters:

- **Act I — The problem** (Ch 01–03): darkness → the K forms → inside it, the oppressive sameness of template businesses.
- **Act II — The transformation** (Ch 04–07): a controlled intervention fractures the sameness and reorganises it into software, automation, and digital experience — each shown as behaviour, not as screenshots.
- **Act III — The proof** (Ch 08–10): real work at full-viewport scale, the reveal that everything was one connected machine, and the completed K as the call to action.

The end mirrors the beginning (the same K, now complete and lit) so the page reads as one closed loop.

## Visual language

- **World**: near-black architectural void. Surfaces exist only where light defines them. Base tone is not #000 — it is a very dark warm-neutral (see tokens) so blacks have depth on cheap displays.
- **Materials** (the entire palette is materials, not colors):
  - *Smoked glass* — dark, slightly warm transmission, visible thickness, restrained spectral refraction on edges only.
  - *Machined dark metal* — brushed gunmetal, chamfered edges, micro-detail visible only in close-up.
  - *Light* — one engineered white key light; one accent hue used sparingly: **glacial blue `#9BB8D4` → cold violet `#8B87C6`** range, never saturated purple, never neon.
  - *Haze* — thin, low, cold; gives beams a body and depth cues without particles.
- **Composition**: generous negative space; single dominant object per frame; horizon low; camera moves are dolly/track, never orbit for its own sake.
- **Explicitly banned** (from the brief, enforced in review): glowing orbs, purple gradient washes, floating dashboard cards, particle fields, HUD chrome, bento grids, stock mockups, per-word text animation.

## Typography

- **Display**: a precise grotesk with engineering character — *Neue Haas Grotesk / Suisse Intl class*. Practical licensed choice: **Inter Display** (tight tracking, -2%) for now; swap-ready via CSS variable.
- **Mono accent**: a single mono face (*JetBrains Mono / IBM Plex Mono class*) used only for small technical annotations — chapter indices, coordinates, measurements. This is the "engineered" voice; used at 11–12px, letterspaced, muted.
- Scale: display sizes step clamp()-fluid between 2.5rem and 7rem; body copy never below 1rem; measure capped at 34em.
- Copy is set in HTML always. WebGL never renders essential text.

## Voice

Short declaratives. No adjectives doing the work of evidence. Banned-phrase list from the brief is enforced in `lib/copy.ts` review. The site says what Kivotra builds and shows it happening; it never claims transformation abstractly.

## Animation principles

1. **Scroll is the timeline.** One master timeline, scrubbed; every scene is a labeled range. Reversible by construction.
2. **The camera tells the story; objects change state.** Text does not fly — it holds position in screen space while the world moves behind and through it.
3. **One transformation per chapter.** Each chapter has exactly one thing that changes (form, connection, fold, fracture). If a chapter has two ideas, it becomes two beats within its range, never simultaneous.
4. **Continuity over punctuation.** No hard cuts between chapters; every transition is a physical transformation of what is already on screen.
5. **Restraint budget**: max one text animation style (opacity+8px rise, 300ms equivalent in scrub-space); no character animation; no entrance choreography on static content.

## Responsive strategy

Mobile is a **re-framed film, not a shrunk one**: same 10 chapters, same story, tighter camera (portrait framing on the K), shorter travel per chapter (~60% of desktop scroll length), no cursor-parallax (replaced by subtle gyro-free idle drift), heavier reliance on prerendered frames vs live 3D on low-tier devices. Text blocks sit in a safe area: 5vw side margins, bottom 20% reserved for chapter copy so browser chrome changes never crop it.

## Fallback ladder

1. High tier: full R3F scenes + refraction.
2. Mid tier: same scenes, cheaper materials, capped DPR 1.5.
3. Low tier / no WebGL: prerendered image sequences (Higgsfield-derived) scrubbed on canvas 2D.
4. Reduced motion: static composed frames per chapter with instant opacity swaps; full copy preserved.
