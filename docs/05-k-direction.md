# H-02 — K direction (geometry layer decision)

**Status:** PARTIAL. Only the 2D geometry/scalability layer of the exploration
was completed (rendered from `design/k-studies.html` and reviewed at hero,
64px, 32px, favicon-16px, monochrome and on-white scales). Higgsfield
material/lighting studies remain **pending** — the platform's tool-safety
classifier was down for the entire session, blocking all generation. Phase 4
is NOT complete and the material layer of this decision is NOT locked.

## Verdict of the geometry comparison

- **Selected geometry: CONCEPT D — Reduced Icon.** A unified K with a narrow
  precision gap between stem and arms; arm tips overlap the stem line so the
  letterform reads whole at every scale. It was the only concept that read as
  a clean, confident K at all seven test scales, including favicon-16 and
  monochrome.
- **Concept 0 (current coded prototype) is rejected as a mark** — its wide
  full-height gap splits the letterform into "I<" at small scales — but its
  construction narrative (the K assembling around a vertical signal that
  becomes its machined gap, and the camera pass through that gap) is
  retained. Concept D is geometrically a tightened Concept 0: same assembly
  system, narrower gap, overlapping arm tips.
- **Concept A (Monolith)** rejected: whole and elegant, but the tapered arms
  read editorial/fashion rather than engineered, arm tips fade at favicon
  scale, and a solid mass offers no natural camera passage.
- **Concept B (Architectural)** rejected: layered plates are attractive at
  hero scale and animate beautifully, but the mark collapses into stripes at
  small scales and the double stem reads as "‖K".
- **Concept C (Engineered Core)** rejected: the K-inside-K double image reads
  as a logo trick, smudges below 32px, and glass-shell objects are a common
  AI-generated visual — brand risk.

## What this means for the prototype

Revise, don't discard: keep the scene architecture, retune the K's geometry
constants (gap width, arm tip overlap) to D-spec, and update `KMark` +
`app/icon.svg` to the D letterform. The camera pass-through must be
re-verified after the gap narrows (perspective widens the gap on approach;
needs rendered confirmation).

## Still required before the direction is locked

1. Higgsfield material studies of the D geometry (≥4 concepts, critique,
   refinement pass) — glass character, metal character, light colour and
   intensity, lens character, background treatment.
2. Rendered comparison of real-time vs prerendered vs hybrid for the
   formation sequence.
3. Documented allowed/prohibited visual variations.
