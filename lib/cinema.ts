"use client";

/**
 * Shared cinematic state — the single coordination point of the film.
 *
 * `chan` holds every value the WebGL scene needs. It is written EXCLUSIVELY
 * by the master GSAP timeline (Film.tsx); the 3D scene reads it inside its
 * frame loop. Nothing here triggers a React re-render.
 */

export type Tier = "high" | "mid" | "low";

/** Animation channels — tweened by the master timeline only. */
export const chan = {
  /* CH 01 — SIGNAL */
  stretch: 0, // 0 = point of light · 1 = engineered line
  trace: 0, // K outline draw-on 0..1

  /* CH 02 — FORMATION */
  assembly: 0, // parts seat into place 0..1
  glow: 0, // lighting resolve 0..1

  /* camera */
  camX: 0,
  camY: 0.1,
  camZ: 9.2,

  /* CH 03 — REPETITION */
  corridor: 0, // corridor presence 0..1
  fog: 0.012,
  kFade: 1, // K visibility after the pass-through

  /* CH 04 — INTERVENTION */
  beamZ: -60, // z position of the sweeping beam (inactive when < -55)
  beam: 0, // beam visibility 0..1
  reorg: 0, // slabs → reorganised lattice 0..1

  /* CH 05 — SOFTWARE */
  software: 0, // environment presence 0..1
  reflow: 0, // wall regions re-layout 0..1
  record: 0, // the travelling record's path progress 0..1

  /* CH 06 — AUTOMATION */
  network: 0, // stations presence 0..1
  connect: 0, // connections drawn in dependency order 0..1

  /* CH 09 — ONE SYSTEM (pull-back re-uses the journey groups) */
  machine: 0, // interior chamber glow during the reveal 0..1
};

export const cinema = {
  /** master progress 0..1 — written by ScrollTrigger onUpdate */
  progress: 0,
  pointerX: 0,
  pointerY: 0,
  tier: "high" as Tier,
  reduced: false,
  ready: false,
};

/* Prototype chapter ranges (fractions of the master timeline). */
export interface Chapter {
  index: string;
  name: string;
  t: number;
}

export const CHAPTERS: Chapter[] = [
  { index: "01", name: "Signal", t: 0 },
  { index: "02", name: "Formation", t: 0.08 },
  { index: "03", name: "Repetition", t: 0.18 },
  { index: "04", name: "Intervention", t: 0.28 },
  { index: "05", name: "Proof", t: 0.38 },
  { index: "06", name: "No Promises", t: 0.5 },
  { index: "07", name: "The Check", t: 0.6 },
  { index: "08", name: "Selected Work", t: 0.68 },
  { index: "09", name: "Authority", t: 0.86 },
  { index: "10", name: "Conversion", t: 0.94 },
];

export function chapterAt(p: number): Chapter {
  let cur = CHAPTERS[0];
  for (const c of CHAPTERS) if (p >= c.t) cur = c;
  return cur;
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

export function detectTier(): Tier {
  if (typeof window === "undefined") return "mid";
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  const mem =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  if (cores <= 4 || mem <= 4) return "low";
  if (w < 1280 || cores <= 8) return "mid";
  return "high";
}

export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}
