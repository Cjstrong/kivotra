# Kivotra — Higgsfield Asset List

## Process rules (apply to every asset)

1. Generate **3–4 clearly different concepts** per asset. Never accept the
   first output.
2. Critique against: composition, material quality (glass/metal/light
   grammar), lighting discipline (single motivated key, true blacks),
   brand relevance, and "does it look AI-generated?"
3. Select one direction; refine for consistency with the established material
   language before use.
4. **No text, logos, UI labels or typography inside any generated asset.**
   All type and UI are native HTML.
5. Stills delivered as AVIF + WebP at per-breakpoint sizes; video as stable,
   keyframe-dense WebM + MP4 suitable for scrub/frame control — no long
   free-running clips.
6. Hero/case-study visuals are generated in **both landscape and portrait**
   compositions (desktop and mobile are separate crops, not resizes).

## Shared prompt DNA (consistency contract)

Every prompt inherits: *near-black architectural void, atmospheric haze,
single motivated key light, smoked glass with subtle edge-only spectral
refraction, polished graphite metal with machined chamfers, microscopic
mechanical detail, restrained electric-blue (#4D7CFE) accent under 5% of
frame, cinematic photography, true blacks, no text, no logos, no UI labels,
no orbs, no neon, no purple gradient.*

## Asset register

| ID | Asset | Type | Used in | Purpose |
|----|-------|------|---------|---------|
| H-01 | Black-void light study — single point of light in haze, optical flare behaviour | Still ×3 concepts | CH01 | Art-direction reference for the real-time signal |
| H-02 | Glass K material studies — smoked glass body, metal chamfers, interior micro-mechanics, 3 lighting angles | Still ×4 concepts | CH02, brand | Drives real-time material tuning; brand master |
| H-03 | Lighting studies — same K under key-light variations (edge rim, interior glow, top spot) | Still ×3 | CH02, CH10 | Choose the canonical lighting rig |
| H-04 | Macro mechanical details — extreme close-ups of components inside glass | Still ×4 | CH02, CH04 | In-glass environment textures + fragment reference |
| H-05 | Template-corridor environment — oppressive repeated dark slabs, one-point perspective, fog | Still ×3 | CH03 | Composition/mood reference for real-time corridor |
| H-06 | Fracture / liquid-metal transition study — engineered seam fracture, controlled reorganisation | Short video ×2 + stills | CH04 | Motion reference; possible depth plate |
| H-07 | Software-machine environment — architecture that *is* an interface: glass data surfaces on metal rails, no laptops, no dashboard cards | Still ×4 | CH05 | Environment concept + backplates |
| H-08 | Interface assembly sequence — abstract data surface filling/organising, stable camera | Short video ×2 | CH05 | Scrub-controlled hero surface if real-time falls short |
| H-09 | Automation network environment — disconnected nodes becoming a connected lightpath network, infrastructure aesthetic (no robots/brains) | Still ×3 | CH06 | Composition reference |
| H-10 | Flat-to-dimensional study — editorial composition expanding into layered 3D depth | Still ×3 | CH07 | Transition reference + media-frame stills |
| H-11a | Case environment — logistics: vast dark hall, routed lightpaths, cool blue accent | Still ×3, landscape + portrait | CH08 | Meridian Logistics hero plate |
| H-11b | Case environment — healthcare: calm glass volumes, soft icy-violet accent, clinical precision | Still ×3, landscape + portrait | CH08 | Halden Clinic Group hero plate |
| H-11c | Case environment — real estate: architectural glass forms, warm-neutral key against near-black | Still ×3, landscape + portrait | CH08 | Arcline Property hero plate |
| H-12 | Exterior machine-K — the K with visible interior systems (corridor, rooms, network as light signatures inside the volume) | Still ×4 | CH09 | Pull-back composition target |
| H-13 | Completed-K hero still — canonical final K, lit core, front-on | Still ×4, landscape + portrait | CH10, static edition, OG image | The definitive brand image |
| H-14 | Cinematic camera references — dolly-through-glass and rising-crane move studies | Short video ×2 | CH02, CH06 | Motion timing reference only (not shipped) |

## Selection & refinement flow per asset

Round 1: breadth (3–4 distinct concepts) → written critique → reject
generic/incoherent/AI-looking outputs → Round 2: refine the strongest
direction with the shared DNA locked → consistency check against H-02 (the
material master) → export pipeline (AVIF/WebP/WebM/MP4, breakpoint sizes) →
file under `public/assets/<chapter>/`.

H-02 is generated and locked **first**; every subsequent asset is judged
against it.
