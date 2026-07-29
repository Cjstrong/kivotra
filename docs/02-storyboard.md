# Kivotra — Scroll Storyboard

One master timeline, progress `0 → 1`, scrubbed by scroll across a pinned
stage. Chapters own progress ranges; transitions are shared camera moves, so
no chapter ever "ends" — it becomes the next one.

Desktop scroll length target: ~1,000vh. Mobile: ~700vh (same chapters,
shorter travel).

| # | Chapter | Range | Length |
|---|---------|-------|--------|
| 01 | Signal | 0.00 – 0.07 | 7% |
| 02 | Formation | 0.07 – 0.17 | 10% |
| 03 | Repetition | 0.17 – 0.27 | 10% |
| 04 | Intervention | 0.27 – 0.37 | 10% |
| 05 | Software | 0.37 – 0.48 | 11% |
| 06 | Automation | 0.48 – 0.58 | 10% |
| 07 | Digital Experiences | 0.58 – 0.68 | 10% |
| 08 | Selected Work | 0.68 – 0.84 | 16% |
| 09 | One System | 0.84 – 0.92 | 8% |
| 10 | Conversion | 0.92 – 1.00 | 8% |

Text timing rule: every line gets ≥1.5% of progress fully readable and never
overlaps another line. Text lives in the HTML layer, positioned by the scene
manager; the WebGL layer never renders copy.

---

## CH 01 — SIGNAL (0.00–0.07)

- **Visible:** near-black frame. A single point of light, ~2px, pulsing
  slowly at centre. Faint haze. Nothing else.
- **Camera:** static at origin, extremely subtle parallax (≤0.5°) following
  cursor — an *optical* response (light flare shifts), not object movement.
- **Object states:** point light intensity oscillates; at 0.03 it stretches
  into a thin **vertical** engineered line with machined end caps. This line
  is the K's future gap axis — the machine is built around the signal, and
  the camera will later pass through it. Deliberately incomplete: a line, not
  a letter. Anticipation, not reveal.
- **Text:** "Most businesses disappear into the noise." — fades up at 0.015,
  holds, exits by 0.05 as the line starts moving.
- **Transition out:** the tracing line accelerates; camera begins a slow
  dolly-in toward the forming outline.
- **Higgsfield:** H-01 (black-void light study) as reference only; scene is
  fully real-time.
- **Real-time vs prerendered:** 100% real-time (trivial cost).
- **Mobile:** identical; parallax driven by nothing (no gyro dependence);
  point sized up to 3px for small screens; text in lower safe band.

## CH 02 — FORMATION (0.07–0.17)

- **Visible:** the K assembles around the signal: the smoked-glass stem
  slides in from the left, the two glass arms from the right, machined
  metal caps and gap rails seat themselves, micro-mechanical components
  become visible *inside* the glass as depth layers. The signal line remains
  as the illuminated machined gap between stem and arms — the K's defining
  trait. Spectral refraction only on edges. Floor reflection beneath.
- **Camera:** slow dolly-in from 12 units to 4 units, slight orbital drift
  (≤8°) so the glass catches light.
- **Object states:** assembly is progress-mapped: outline (0.07) → glass
  volumes (0.09) → metal frame (0.11) → interior micro-detail (0.13) →
  complete, breathing idle (0.15).
- **Text:** "Built to stand apart." large display at 0.10–0.13. Then
  "We engineer software, systems and digital experiences for businesses that
  refuse to blend in." at 0.13–0.16.
- **Transition out:** camera keeps dollying and threads *through the K's
  illuminated gap* — the signal flares as we cross it, glass walls slide
  past on both sides — into the interior. The passage emerges naturally
  from the geometry; the K is never distorted to make a tunnel.
- **Higgsfield:** H-02 material studies (glass K), H-03 lighting studies —
  drive the real-time material tuning. Optional H-04 macro interior plate as
  in-glass environment texture.
- **Real-time vs prerendered:** real-time geometry + shaders; Higgsfield used
  as reference and environment/backplate textures.
- **Mobile:** K scaled to fill portrait width; assembly steps identical but
  micro-detail layer reduced 60%; text lines stacked in lower band; camera
  travel halved.

## CH 03 — REPETITION (0.17–0.27)

- **Visible:** inside the K: a receding corridor-grid of identical dark
  slabs — abstracted generic websites/dashboards/templates (grey wireframe
  planes, same layout repeated). Oppressive but composed: strict one-point
  perspective, fog swallowing the far end.
- **Camera:** travels down the corridor at constant speed; the sameness
  *passes* the visitor.
- **Object states:** slabs are instanced (hundreds), all identical, gentle
  synchronized idle — uniformity as motion design.
- **Text:** integrated into the composition, not faded in: each line sits on
  a slab face's position in space (HTML tracked to 3D anchors), so the camera
  *drives past* "Same templates." (0.19), "Same systems." (0.22), "Same
  experience." (0.25). Lines rush past like signage.
- **Transition out:** far ahead, a hairline of blue light appears between
  slabs — the corridor's vanishing point becomes the source of Chapter 04's
  beam.
- **Higgsfield:** H-05 environment concept (oppressive template corridor) as
  art direction reference; real-time build.
- **Real-time vs prerendered:** real-time (instancing is cheap and the camera
  interaction matters here).
- **Mobile:** corridor narrowed to portrait; slab count ~⅓; text anchored to
  screen-safe positions while still translating with camera.

## CH 04 — INTERVENTION (0.27–0.37)

- **Visible:** a controlled beam — a thin plane of blue-white light — sweeps
  through the corridor. Slabs it touches fracture along precise seams (not
  explosion; engineered separation). Fragments reorganise mid-air into
  distinct components: interface fragments, node clusters, routing paths.
- **Camera:** slows, then tracks alongside the beam; slight rotation so the
  fracture reads in parallax.
- **Object states:** slab material transitions grey→glass as they fracture;
  fragments are the *same instanced geometry* re-targeted to new layouts
  (morph by progress, fully reversible).
- **Text:** "Ordinary is a technical limitation." (0.29–0.32), then
  "We replace it with engineered advantage." (0.33–0.36).
- **Transition out:** fragments accelerate forward past camera and settle
  into the architecture of Chapter 05 — the software environment is *built
  from* the fractured pieces.
- **Higgsfield:** H-06 liquid-metal/fracture transition study, H-04 macro
  mechanical details for fragment close-ups.
- **Real-time vs prerendered:** real-time morph (reversibility is the point);
  Higgsfield informs the look only.
- **Mobile:** fracture count reduced; beam sweep shortened; identical copy
  timing.

## CH 05 — SOFTWARE (0.37–0.48)

- **Visible:** the visitor is *inside* a working product — no laptop, no
  screen-in-screen. The environment is the software: glass planes carry
  live-updating abstract data surfaces (tables filling, charts drawing,
  states changing), metal rails route between them like a build system.
  Portals/dashboards/internal tools are distinct "rooms" the camera passes.
- **Camera:** smooth S-curve path through three zones: platform (SaaS),
  operations (internal tools/dashboards), access (client/employee portals).
- **Object states:** data surfaces animate by progress — records flow in,
  a workflow completes, a permission gate opens as the camera approaches.
  Behaviour communicates function; no labels needed.
- **Text:** "Software engineered around your business." (0.39–0.43), then
  "Not another system your business must work around." (0.43–0.47).
- **Transition out:** the rails between rooms grow more prominent than the
  rooms; camera lifts to follow the rails — which *are* Chapter 06's network.
- **Higgsfield:** H-07 software-machine environment concepts, H-08 interface
  assembly sequence (frame-controlled video for one hero surface if real-time
  falls short).
- **Real-time vs prerendered:** hybrid — real-time environment; the densest
  data surface may be a scrub-controlled prerendered sequence mapped onto a
  plane (cheaper than simulating).
- **Mobile:** two zones instead of three (operations folded into platform);
  surfaces at half density; camera path simplified to a straight dolly.

## CH 06 — AUTOMATION (0.48–0.58)

- **Visible:** pull up/back: the rooms shrink into nodes and the rails into a
  network. At entry, nodes sit disconnected, each pulsing alone —
  manual tasks. As progress advances, connections draw themselves with
  machined precision, packets of light travel between nodes, and disconnected
  clusters become one operating system-of-systems.
- **Camera:** slow rising crane shot; ends looking at the network slightly
  from above.
- **Object states:** connection lines draw by progress; packet traffic
  density ramps; node idle animations synchronize as they join — repetition
  *leaves* the system (visual echo/inversion of Chapter 03).
- **Text:** "Less repetition." (0.50), "Fewer disconnected tools." (0.53),
  "More room to grow." (0.56) — placed in the negative space the network
  clears as it organises.
- **Transition out:** the network's plane rotates to face the camera and
  flattens — becoming the 2D canvas of Chapter 07.
- **Higgsfield:** H-09 network/automation environment concept (no robots,
  no brains — pure infrastructure aesthetic).
- **Real-time vs prerendered:** real-time (lines + instanced nodes are cheap;
  interactivity of draw-on-scroll matters).
- **Mobile:** node count halved; network composed vertically for portrait.

## CH 07 — DIGITAL EXPERIENCES (0.58–0.68)

- **Visible:** the flattened network is now a website canvas seen straight-on.
  Typography blocks, media frames and interface elements assemble into a
  precise editorial composition (this is real HTML choreographed over the
  canvas — the one moment the film becomes literal). Then the flat
  composition *expands* — layers separate in Z, gaining depth, shadow and
  atmosphere — a website becoming a three-dimensional experience.
- **Camera:** locked orthographic-feeling front-on during assembly; pushes in
  as layers separate, re-entering perspective.
- **Object states:** assembly is layout-true (grid lines flash as guides,
  then vanish); expansion staggers layers by depth.
- **Text:** "Your website should not simply explain your business."
  (0.60–0.63), then "It should prove what your business is capable of."
  (0.64–0.67).
- **Transition out:** the expanded layers part like a doorway; through the
  gap, the first case-study atmosphere is already visible.
- **Higgsfield:** H-10 "flat-to-dimensional" study; media frames inside the
  assembling composition use Higgsfield stills (abstract, text-free).
- **Real-time vs prerendered:** hybrid — assembly is HTML/CSS + GSAP;
  expansion is the WebGL layer taking ownership of the same composition.
- **Mobile:** assembly in a single column; expansion depth reduced; identical
  narrative beat.

## CH 08 — SELECTED WORK (0.68–0.84)

- **Visible:** three full-viewport case-study environments, each a distinct
  atmosphere within the Kivotra material system (same glass/metal/light
  grammar; different accent temperature and backdrop). No cards. Each
  presents: project name, industry, challenge, solution, one concrete result,
  a large visual plate, and a case-study link (native HTML, keyboard
  reachable).
- **Placeholder projects** (data-driven, `content/work.ts`, trivially
  replaceable):
  1. **Meridian Logistics** — logistics — fragmented dispatch tooling →
     unified operations platform → measurable dispatch-time reduction.
  2. **Halden Clinic Group** — healthcare — manual patient intake → patient
     portal + automated intake → front-desk hours recovered weekly.
  3. **Arcline Property** — real estate — template site + spreadsheet ops →
     premium web experience + owner dashboard → lead quality uplift.
- **Camera:** dolly through each environment; ~5% of progress per project
  with a held "reading state" in the middle of each.
- **Text state:** editorial block (name, industry, challenge/solution/result)
  pinned during each project's reading state; never overlapping the next.
- **Transition between projects:** atmosphere handoff — the current
  environment's light dims to black-with-haze, next environment's key light
  rises; the camera never cuts.
- **Higgsfield:** H-11a/b/c — one hero environment plate per project
  (text-free, brand-consistent), plus optional short stable video loops for
  depth plates.
- **Real-time vs prerendered:** prerendered plates (Higgsfield) mounted in
  real-time space with parallax layers — realism where live 3D adds nothing.
- **Mobile:** same three projects; plates art-directed for portrait crop
  (generate both orientations); editorial block below the visual, scroll
  budget per project unchanged.

## CH 09 — ONE SYSTEM (0.84–0.92)

- **Visible:** the camera pulls back and up — and the whole journey is
  revealed as the interior of one K-shaped machine: corridor, software rooms,
  network and case-study chambers visibly occupy the K's silhouette (a
  simplified miniature "map" version of each environment placed within the K
  volume).
- **Camera:** single continuous pull-back from inside to a three-quarter
  exterior view.
- **Object states:** interior environments simplify to their lightform
  signatures as the camera recedes; K exterior glass reforms around them.
- **Text:** "One partner." (0.86), "One system." (0.88),
  "No disconnected thinking." (0.90).
- **Transition out:** camera continues to the front-on framing of Chapter 01,
  matched composition.
- **Higgsfield:** H-12 exterior "machine K" concept — the K with visible
  interior systems.
- **Real-time vs prerendered:** real-time (it's the same assets at LOD);
  H-12 guides the composition.
- **Mobile:** pull-back shortened; K sized to portrait; miniature interiors
  reduced to light signatures only.

## CH 10 — CONVERSION (0.92–1.00)

- **Visible:** the K from Chapter 01's position — now complete, stable,
  internally lit: the point of light from the opening pulses at its core.
  Full circle. Calm idle; no further scene transformation.
- **Camera:** settles to the exact opening framing; subtle cursor-following
  optical response returns (bookend).
- **Text:** "Engineer your advantage." (0.94). CTAs at 0.96: primary
  **Start a project**, secondary **Explore our work** — native HTML buttons,
  always fully visible once revealed, never re-hidden by scroll. Footer
  (contact, socials, legal) below the film's end; normal scrolling, no
  hijack.
- **Higgsfield:** H-13 completed-K hero still (also the static-fallback and
  OG image).
- **Real-time vs prerendered:** real-time (same K asset, "complete" state).
- **Mobile:** CTAs stacked, thumb-reachable, safe from browser chrome; K
  centred above them.

---

## Static edition (no WebGL / reduced motion)

Same ten chapters as a designed editorial page: Higgsfield still per chapter
(H-01…H-13 selects), same copy in the same order, no motion. Server-rendered;
this is also what SEO and no-JS receive.
