# Phase 3 — Scroll Storyboard

Master timeline: `0.00 → 1.00`. Ranges below are desktop; mobile compresses each range's scroll distance ~40% but keeps proportions. Every chapter lists: content, camera, object states, text state, exit transition, Higgsfield asset, realtime-vs-prerendered, mobile adaptation.

Copy shown is final unless marked (draft).

---

## CH 01 — SIGNAL · `0.00–0.07`

- **Visible**: near-black frame. One point of light, center, slow 2s pulse. Cursor moves produce ±4px parallax of the point's bloom (an optical response, not a follow).
- **Camera**: static, lens at rest.
- **Objects**: light point only. At 0.04 it stretches horizontally into a hairline engineered line (with faint machined tick-marks visible on close inspection).
- **Text**: "Most businesses disappear into the noise." — appears at 0.02, small size, center-low. Exits by dimming into the dark at 0.06 (not sliding).
- **Transition out**: the line begins to bend and trace — first two strokes of the K outline appear as light paths.
- **Higgsfield**: none live (pure code: shader line + bloom). Reference lighting still only.
- **Implementation**: realtime (trivially cheap). Reduced-motion: static line + text.
- **Mobile**: identical; pulse point slightly higher (45% viewport height) to clear browser chrome.

## CH 02 — FORMATION · `0.07–0.18`

- **Visible**: the traced light outline fills with material — smoked glass panels slide in along the strokes, dark metal spine pieces seat themselves, micro-components settle. The K completes as a physical object on a dark reflective floor, thin haze.
- **Camera**: slow dolly-in from wide; slight lateral drift (0.3m) for parallax on the K's thickness.
- **Objects**: K assembly progress 0→1 across the range; assembly is *ordered* (light skeleton → glass → metal → detail), never a particle swarm.
- **Text**: "Built to stand apart." (display size) at 0.10, holds. At 0.14 sub-line: "We engineer software, systems and digital experiences for businesses that refuse to blend in." Both exit by staying in place while the camera passes them (depth fade).
- **Transition out**: camera continues forward; the K's counter (negative space between strokes) becomes the doorway; we pass *through* it into darkness that resolves into Ch 03.
- **Higgsfield**: hero K material studies (R1 done), assembly-sequence reference frames, lighting study. Optional prerendered 4K "formation" clip for the low-tier fallback sequence.
- **Implementation**: realtime R3F (the K is the site's one true 3D asset; transmission material with refraction on high tier, baked matcap on mid). Low tier: image sequence.
- **Mobile**: K framed portrait (taller, closer), assembly identical, dolly path shortened; through-the-counter pass keeps the counter ≥ 80% viewport width at crossing moment.

## CH 03 — REPETITION · `0.18–0.28`

- **Visible**: inside the K: a receding corridor-grid of identical dark slabs — abstract website/dashboard silhouettes, all the same, rank after rank into haze. Aesthetically controlled: strict grid, one light temperature, oppressive by *repetition*, not clutter.
- **Camera**: steady forward track down the corridor; rows slide past on both sides.
- **Objects**: slabs are instanced (one geometry, hundreds of instances); subtle synchronized idle motion — they all move *identically*, which is the point.
- **Text**: integrated into camera movement — "Same templates." aligns with a rank of slabs at 0.20; passing the next rank reveals "Same systems." at 0.23; "Same experience." at 0.26. Each line is positioned in world-anchored screen space so the camera's passage is what brings and removes it.
- **Transition out**: far ahead, a vertical seam of white light appears between the ranks — the first non-identical thing on screen.
- **Higgsfield**: environment concept — "corridor of identical dark slabs" plate for art direction + low-tier background.
- **Implementation**: realtime (instancing is cheap and the synchronized motion needs to be exact). 
- **Mobile**: corridor narrows to a single centered aisle; two visible columns instead of four; text centered.

## CH 04 — INTERVENTION · `0.28–0.38`

- **Visible**: the seam widens into a controlled vertical beam that sweeps toward the camera. Slabs it touches fracture along precise lines (pre-cut fracture patterns — engineered demolition, not shattering glass) and their fragments re-align into new configurations: thin interface planes, node lattices, routed pathways.
- **Camera**: holds position as the beam approaches; then slowly begins moving again through the reorganised field.
- **Objects**: slab → fragment → component morph driven by per-instance progress offset from the beam position.
- **Text**: "Ordinary is a technical limitation." at 0.30 (during fracture), then "We replace it with engineered advantage." at 0.35 (during reorganisation).
- **Transition out**: reorganised fragments ahead of camera assemble into the walls/floor of the software environment of Ch 05.
- **Higgsfield**: fracture/reorganisation reference frames; liquid-metal transition study (for the fragment re-alignment material behaviour).
- **Implementation**: realtime, but fracture patterns pre-baked into geometry attributes (no physics at runtime). Low tier: prerendered clip, scroll-scrubbed.
- **Mobile**: beam sweeps top-to-bottom instead of depth-wise (reads better portrait); fewer instances.

## CH 05 — SOFTWARE · `0.38–0.50`

- **Visible**: the environment *is* the product: the corridor has become a habitable system — floor lanes carry ordered data pulses, wall planes hold live-updating layout regions (abstract: rows populate, states change, a approval travels from plane to plane). No laptops, no framed dashboards. It reads as walking through the inside of well-built software.
- **Camera**: unhurried track through; two gentle turns (the only turns in the film — software has rooms).
- **Objects**: three behaviours demonstrate the offering without labels: (1) a record travels lanes between wall regions → integrations/portals; (2) a region reflows itself as data density changes → internal tools; (3) a queue drains automatically → operational software.
- **Text**: "Software engineered around your business." at 0.40; "Not another system your business must work around." at 0.46. Small mono annotations (draft) may name capabilities — *portals · internal tools · SaaS platforms* — set in HTML, never in-scene.
- **Transition out**: the wall regions detach and float apart into discrete stations, stretching the space into the network of Ch 06.
- **Higgsfield**: software-machine environment concepts (2–3 alternatives); interface-assembly close-up references.
- **Implementation**: realtime; wall regions are shader-driven planes (cheap), not DOM-in-WebGL.
- **Mobile**: single corridor, no turns; two wall planes instead of four; behaviours sequenced not simultaneous.

## CH 06 — AUTOMATION · `0.50–0.60`

- **Visible**: stations hang disconnected in dark space, each pulsing its own small repetitive motion (manual work). As scroll advances, machined light-paths draw between them in dependency order; when a path connects, the stations' motions synchronize and a payload travels the route; connected clusters go quiet and efficient — repetition visibly *decreases*.
- **Camera**: slow pull-back, revealing more of the network as it organises.
- **Objects**: ~9 stations, path-drawing driven by timeline; payload pulses use the accent hue.
- **Text**: "Less repetition." 0.52 · "Fewer disconnected tools." 0.55 · "More room to grow." 0.58 — each tied to a visible network state change (first connection, cluster merge, full graph quiet).
- **Transition out**: the completed network flattens — camera rises overhead as the graph folds down into a flat plane.
- **Higgsfield**: network/workflow environment still for art direction; macro mechanical detail of a "station".
- **Implementation**: realtime (lines + instanced nodes, cheap).
- **Mobile**: 5 stations, vertical layout, pull-back becomes zoom-out.

## CH 07 — DIGITAL EXPERIENCES · `0.60–0.68`

- **Visible**: the flattened plane becomes a website canvas seen face-on: typographic blocks, media regions and interface elements slide into a precise editorial grid (this is HTML, composited over the WebGL plane). Then the composition *lifts* — layers separate in Z, revealing that the flat page was a three-dimensional environment all along; camera glides between its layers.
- **Camera**: face-on hold during assembly; then a push *into* the layer stack.
- **Objects**: the page-assembly is the one moment DOM and WebGL lock together — DOM grid positions drive plane positions.
- **Text**: "Your website should not simply explain your business." at 0.62; "It should prove what your business is capable of." at 0.66 (as the layers separate — the line lands exactly when the proof happens).
- **Transition out**: passing the deepest layer, its surface becomes the first case-study environment.
- **Higgsfield**: none for the flat state (must be crisp/native); background plate for the dimensional reveal.
- **Implementation**: hybrid DOM+WebGL, highest-risk chapter — prototyped early in Phase 7.
- **Mobile**: assembly in portrait grid; layer-lift shallower; identical copy timing.

## CH 08 — SELECTED WORK · `0.68–0.86`

- **Visible**: three full-viewport case-study environments, each a distinct atmosphere within the brand system (same blacks, same light discipline, different accent temperature and texture). Large visual presentation (prerendered environment plate + subtle live parallax), with an HTML information column: project name, industry, challenge, solution, result, case-study link.
- **Camera**: horizontal glide from environment to environment; each holds for reading (scroll-mapped hold zones — no hijack, just longer range per project).
- **Data**: `lib/work.ts` — typed array; placeholder projects clearly structured for later replacement: (draft) *Meridian Logistics — operations platform*; *Halewood Clinics — patient portal*; *Arla & Frost — brand experience site*.
- **Text**: per-project HTML column; no banned phrases; results stated as concrete facts (draft numbers marked as placeholders in code comments, and the projects presented as concept builds until real case studies exist — no fabricated client claims).
- **Transition out**: the third environment's lighting dims to a single edge-light; camera pulls back and up.
- **Higgsfield**: one hero environment plate per project (3 × 2 alternatives), consistent material language.
- **Implementation**: prerendered plates + live parallax layer; HTML column native.
- **Mobile**: vertical stack, one project per ~120vh, plate art re-framed portrait (separate Higgsfield crops).

## CH 09 — ONE SYSTEM · `0.86–0.94`

- **Visible**: continued pull-back: corridor, network, page-layers and case environments are revealed as chambers of one machine, and its silhouette is the K. Interior lights of each chamber remain on — the whole journey visible at once inside the letterform.
- **Camera**: long single pull-back to a three-quarter view of the complete K-machine.
- **Text**: "One partner." 0.88 · "One system." 0.90 · "No disconnected thinking." 0.92.
- **Transition out**: chamber lights fade; exterior key light rises — the machine becomes the object.
- **Higgsfield**: "K as machine cross-section" concept study (hard to model; may become a prerendered wide plate with live lighting pass).
- **Implementation**: likely the second prerendered-assist chapter — decision after Phase 6 learnings.
- **Mobile**: pull-back ends closer (K fills portrait height); chamber detail simplified.

## CH 10 — CONVERSION · `0.94–1.00`

- **Visible**: the same K from Ch 02, now complete, stable, exterior-lit — visually rhyming with the opening frame (same floor, same haze, now confident lighting). Below/beside it, the conversion block in clean HTML.
- **Camera**: settles to the Ch 02 hero framing — closing the loop.
- **Text**: "Engineer your advantage." + CTA primary **Start a project** + secondary **Explore our work**. Footer follows as normal document flow — scrolling never hijacked, page ends like a page.
- **Higgsfield**: reuse hero direction asset; no new generation needed.
- **Implementation**: realtime (same K asset, new lighting state).
- **Mobile**: K above, CTAs below, both fully inside safe area; CTA tap targets ≥ 48px.

---

## Global notes

- Chapter indices (mono, e.g. `01 / SIGNAL`) are the only persistent chrome besides nav; they double as the inspector/progress affordance.
- Every inter-chapter transition is a transformation of on-screen matter — checked in QA by scrubbing backwards.
- Scroll length target: ~9–10 viewport-heights desktop, ~6 mobile.
