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

## Material studies (Higgsfield, first round — `design/h02/`)

Three genuinely different material directions were generated against the
Concept D construction and critiqued:

- **A — smoked optical glass** (`h02-material-A.png`): **selected.** Dense
  smoked glass, machined metal caps, restrained interior micro-mechanics at
  the junction, lit signal gap. Best narrative fit (the machine is visible
  inside the glass; the signal lives in the gap) and matches the real-time
  implementation's direction. Geometric deviation to reject in refinement:
  the model bridged the gap with a bracket — the gap must stay uninterrupted.
- **B — dark precision metal** (`h02-material-B.png`): rejected as the body
  material — an opaque K kills the interior narrative and deadens the camera
  pass — but its satin finish and chamfered edge catchlights are adopted as
  the finish target for the caps and gap rails.
- **C — hybrid truss core** (`h02-material-C.png`): rejected — scaffold-like,
  visually busy, gap bridged, visible generation artifacts on panel seams.
  It does validate interior mechanics as a concept, at A's restrained dose.

## Real-time vs hybrid (evidence-based, provisional)

The rendered real-time hero achieves credible dark glass but visibly less
material richness than study A. Decision: **hybrid** — the K, formation and
pass-through stay real-time (scrub reversibility and the pass are proven in
the browser and would be costly to fake with frame-controlled video), while
generated stills serve as material-tuning targets and as prerendered
atmosphere/hero plates (static edition, OG image, later-chapter detail
moments). Re-evaluate after the real-time material tuning pass narrows the
gap to study A.

## Still required before final lock

1. One refinement round of study A (remove the gap bracket, both
   orientations, macro details).
2. Real-time material tuning toward A (visible junction internals, cap/rail
   finish per B).
3. Documented allowed/prohibited visual variations.
