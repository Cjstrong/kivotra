# Higgsfield Asset List & Workflow Log

Model of record: `soul_cinematic` (Soul Cinema, 2k) for stills; escalate to `cinematic_studio_2_5` 4K only for final selected plates. Video models chosen per-shot when transition footage is needed. ~0.12 credits per 2k still — explore widely, select severely.

Rules (from brief): multiple clearly different concepts per major visual → critique → reject generic → refine winner → keep one material language. **No text, logos, labels or UI chrome inside generated assets.** Nothing ships from round 1 without a refinement pass.

## Asset register

| # | Asset | Chapter | Use | Status |
|---|---|---|---|---|
| A1 | Hero K — 4 concept directions (monolith / engine-hall / mid-assembly / optical-crystal) | 02, 10 | art direction for the 3D K + lighting reference | **R1 generated, in critique** |
| A2 | Hero K — refined winner, front + ¾ + macro edge detail | 02, 10 | material/lighting bible for the R3F asset | pending A1 verdict |
| A3 | Corridor of identical slabs — 2 concepts | 03 | env direction + low-tier plate | queued |
| A4 | Fracture / reorganisation study — 2 concepts (liquid-metal behaviour) | 04 | transition reference; possible prerendered clip | queued |
| A5 | Software-environment interior — 3 concepts | 05 | env direction | queued |
| A6 | Workflow network still + station macro detail | 06 | env direction | queued |
| A7 | Dimensional layer-stack background plate | 07 | reveal backdrop | queued |
| A8 | Case-study environment plates — 3 projects × 2 concepts (+ portrait crops) | 08 | hero visuals per project | queued |
| A9 | K-machine cross-section wide plate | 09 | pull-back reveal (likely prerendered-assist) | queued |
| A10 | Formation sequence clip (video) — only if Ch 02 low-tier fallback needs it | 02 | scrubbed fallback sequence | decision after Phase 6 |
| A11 | Lighting studies — single-blade key light on dark glass/metal | all | consistency reference | queued |

## Round log

### R1 — Hero K concepts (2026-07-30)
Four 16:9 2k stills, `soul_cinematic`:
- R1a `f63f146f` — monolith: smoked glass + gunmetal K, single raking light blade
- R1b `a5e4de82` — engine-hall: colossal K structure in dark architectural hall
- R1c `e73751bb` — mid-assembly: exploded K of machined components
- R1d `4b3b7b30` — optical crystal: edge-lit K, restrained spectral split

**R1 critique (2026-07-30):**
- R1a — glossy smoked-glass body is right; frosted edge crust reads "frozen", not "engineered" → reject crust, keep material.
- R1b — mood/restraint excellent, blue seams on-brand, but letterform illegible (reads as truss, not K) → keep only as Ch 09 ambience reference.
- R1c — **rejected**: chaotic shattered debris, exactly the visibly-AI look the brief bans.
- R1d — **strongest**: edge-light-defined K, vast negative space, deep blacks. Flaws: horizontal lens flare (cliché) and beam drifted purple (banned hue).

**Verdict**: synthesize R1d restraint + R1a glass body, on the distinctive disconnected-chevron K construction (open counter, no bridge — ownable letterform, not a font). Kill flare, cool accent to glacial blue.

### R2 — Hero K refinement (2026-07-30)
Three 16:9 2k stills, `soul_cinematic`, one unified direction:
- R2a `6118bb13` — ¾ hero view — **rejected**: glass edges rendered wavy/hand-cast (poured resin, not machined); ignored the chevron-gap construction.
- R2b `61291683` — macro edge detail — **accepted** as material bible (glass seated into chamfered graphite metal, hairline embedded light strip). Ignore stray purple bokeh dot; regenerate clean version during Phase 6 if needed. → `docs/art/material-joint-macro_R2b.png`
- R2c `2d2d28a7` — front-on complete state — **ACCEPTED — canonical hero direction** for Ch 02/10: disconnected-chevron construction reads clearly, fine rim light on every edge, deep blacks, engineered not rendered. → `docs/art/hero-k-front_R2c.png`

**Settled material language** (binding for all further assets and the R3F build): dark graphite/gunmetal panels + smoked glass, fine cool rim light defining edges, glacial-blue hairline seams, thin floor haze, deep blacks, machined precision everywhere. R1d kept as restraint/negative-space reference → `docs/art/reference-restraint_R1d.png`.

### R3 — Ch 03 corridor concepts (2026-07-30)
- R3a `6cf3744b` — **rejected**: slabs collapsed into a tiny tiled texture (reads as carbon-fiber floor, no monolith scale).
- R3b `24fa24db` — **accepted** as Ch 03 direction: towering identical module walls, one-point perspective into cold haze, oppressive but controlled. Pull teal cast toward glacial blue in build. → `docs/art/corridor-repetition_R3b.png`

### R4 — Ch 05 concept-site loop (2026-07-31)
- Stills: 3 restaurant candidates (`91706498` dining room — too dark at panel size; `135882a5` bar counter — **accepted**; `dad87f22` blue-hour — figure-like shapes right edge, rejected).
- Video: Seedance 2.0, one take, 45 credits: start=end frame loop trick, locked-off camera, steam + shimmer only, 5s 1080p high-bitrate silent. **Accepted first take.** Master → `docs/art/masters/site-restaurant-1080-master.mp4`; web → `public/film/site-restaurant-720.mp4` (2.4MB via avconvert). Poster → `public/film/site-restaurant-poster.jpg`.
- Integrated as the floating AMBER concept-site panel in Ch 05 (HTML chrome/type + video imagery — no AI-generated UI text). Future: property + wellness variants, same pipeline.

## Session status (2026-07-30)

Settled: hero K (R2c) · material bible (R2b) · restraint reference (R1d) · Ch 03 corridor (R3b). ~9 stills spent (~1.1 credits).
Next generation rounds: A4 fracture study, A5 software environment (3 concepts), A6 network still, A7 layer-stack plate, A8 case-study plates, A9 K cross-section, A11 lighting studies — all must obey the settled material language.
