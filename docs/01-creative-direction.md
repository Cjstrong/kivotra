# Kivotra — Creative Direction

**Status:** Foundation document. No implementation begins until this direction is approved.
**Supersedes:** everything currently on the site. The previous positioning ("websites & automation for local business"), copy, scenes and assets are retired in full.

---

## 1. The concept — THE KIVOTRA ENGINE

The homepage is not a page. It is one continuous camera move through a single
machine — the Kivotra Engine — that turns an ordinary business into an
engineered one.

The visitor never "scrolls past sections." They travel:

> darkness → a signal → the K forms → we pass *through* it → we see the world
> of sameness it was built against → we watch that world get re-engineered →
> we move through the software, the automation, the experiences it produces →
> we pull back and see it was all one machine → we land back at the K, now
> complete and lit.

One environment. One camera. One material language. Every chapter is a state
of the same machine, not a new backdrop.

**The rule for every design decision:** if it doesn't advance that story, it
doesn't ship.

## 2. Positioning

Primary statement: **Built to stand apart.**

Kivotra engineers custom software, intelligent systems and digital experiences
for businesses that refuse to blend in. The site must read as a **digital
engineering company with exceptional design taste** — never a web-design
agency, an "AI agency," or a template studio.

What we say we do (concrete, never vague): custom business software, SaaS
platforms, customer/employee portals, dashboards and internal tools, workflow
automation, system integrations, premium websites, interactive digital
experiences, ongoing technical development.

### Voice

Short declarative sentences. Confident, technical, restrained. We state
capability; we never hype it.

Banned vocabulary: unlock, elevate, revolutionary, cutting-edge, seamless,
transform(ation), harness, empower, next-level, supercharge, "the power of
AI," future-proof.

## 3. Visual language

### Environment
Near-black architectural void — not empty black, but a *space*: faint floor
reflections, atmospheric haze catching light, distant structure implied rather
than shown. Think precision instrument photographed in a dark lab, not
"space background."

### Material system (used identically in Higgsfield assets and real-time 3D)
| Material | Behaviour | Where |
|---|---|---|
| **Smoked glass** | Transparent, high-dispersion, subtle spectral refraction at edges only | The K's body, key surfaces |
| **Polished dark metal** | Graphite/gunmetal, anisotropic reflections, machined edges | Frames, mechanisms, chamfers |
| **Engineered light** | Thin, precise lines and planes of light — never glow-blobs | Signals, data, energy through the machine |
| **Micro-mechanics** | Microscopic components visible inside glass at close range | Interior of the K, transition moments |

Accent: **one** highlight hue — electric blue (`#4D7CFE` family) cooling to
icy violet (`#8B8FE8`) in deep-interior scenes. Used at low area coverage
(<5% of any frame). Everything else is a grayscale of near-blacks and whites.

### Lighting
Cinematic single-source discipline: one motivated key light per chapter (the
signal, the beam, the interface glow), soft haze falloff, true blacks
preserved. No ambient wash.

### Typography
- **Display/headlines:** a precise editorial grotesk (direction: *Neue
  Montreal / Founders-class*; free-license candidate: **General Sans** or
  **Switzer** via Fontshare). Tight tracking, large sizes, weight 500–600.
  Never bold-black shouting.
- **Technical/labels:** a quiet monospace (**Geist Mono** class) at small
  sizes, uppercase, wide tracking — used for chapter indices, coordinates,
  material captions. This is the "engineering annotation" layer.
- **Body:** the grotesk at 16–18px, `--fg-dim` (~70% white), max measure 34em.
- All copy is native HTML. Nothing essential rendered in WebGL or baked into
  generated imagery.

### Explicit prohibitions (enforced at review)
No glowing orbs, purple gradient soup, neon overload, floating dashboard
cards, particle confetti, HUD cosplay, glassmorphism cards, rounded-rect
grids, laptop mockups, startup illustration, bento clutter, per-word/
per-character text animation.

## 4. Animation principles

1. **One master timeline.** A single scroll-scrubbed progress value (0→1)
   drives the whole film through a scene manager. Chapters own progress
   ranges; no pile of independent ScrollTriggers.
2. **The camera is the narrator.** Movement between chapters is continuous
   camera travel through one space — never a crossfade between unrelated
   scenes.
3. **Reversible and scrub-safe.** Every state is a pure function of progress.
   Scrolling up plays the film backwards, perfectly.
4. **Text is staged, not decorated.** Lines enter as part of the composition
   (placed in space, revealed by camera or light), one thought on screen at a
   time, no overlap, no character-splitting.
5. **Restraint budget:** if a chapter has more than one idea moving at once,
   cut one.
6. **Never hijack scroll.** No forced scroll-jacking, no snap traps. The
   visitor's wheel always owns the timeline.

## 5. Responsive strategy

Mobile is a **recomposition**, not a scale-down:
- Same 10-chapter narrative, same copy, shorter camera travel per chapter.
- Camera framing re-blocked for portrait: the K fills width, text sits in a
  protected lower band (safe from browser chrome collapse).
- Scene complexity tiered: `high / medium / mobile` variants per scene
  (fewer instances, cheaper materials, capped DPR, lighter or prerendered
  alternatives).
- No hover-dependent meaning anywhere; touch scrub must feel identical.
- The K stays centred and proportional at every breakpoint; the nav mark is
  an SVG with fixed aspect — it can never stretch or crop.

Non-WebGL / reduced-motion visitors get a deliberately designed static
edition: same story, same copy order, Higgsfield stills as chapter plates.
It must look intentional, not like a fallback.

## 6. Quality bar

Before any chapter is called done: Does the animation communicate something?
Is the transition continuous from the previous chapter? Is the copy readable
at every scroll speed? Does it hold at 390px and at 3440px? Would a premium
business trust this? Any "AI-agency" pattern visible? If any answer fails,
the chapter isn't done.
