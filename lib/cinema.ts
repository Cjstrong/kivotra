"use client";

/**
 * Shared cinematic state.
 *
 * `chan` holds every value the WebGL scene needs. It is written EXCLUSIVELY by
 * the master GSAP timeline (Stage.tsx) — no component reads raw scroll
 * progress independently. The 3D scene reads `chan` inside its own frame loop.
 * Nothing here triggers a React re-render.
 */

export type Tier = "high" | "mid" | "low";

/** Animation channels — tweened by the master timeline only. */
export const chan = {
  /** camera dolly */
  camZ: 9.4,
  camY: -0.4,
  camX: 0.25,
  targetY: -0.55,
  /** 0 = K assembled · 1 = unfolded into the website frame */
  kUnfold: 0,
  /** 0 = on stage · 1 = withdrawn into darkness (pipeline/dashboard acts) */
  kParked: 0,
  /** hero: 0 = darkness · 1 = the light has built the K (intro + phase 1-2) */
  reveal: 0,
  /** hero: position of the narrow light sweep, -1 (off left) .. 1 (off right) */
  sweep: -1,
};

export const cinema = {
  /** master progress 0..1 — written by the ScrollTrigger, read by nav/inspector */
  progress: 0,
  pointerX: 0,
  pointerY: 0,
  tier: "high" as Tier,
  reduced: false,
  paused: false,
  ready: false,
};

/** Scene map, for the inspector + nav seeks. Fractions of the master timeline. */
export const SCENE_MARKS: { id: string; t: number }[] = [
  { id: "hero", t: 0.0 },
  { id: "website", t: 0.22 },
  { id: "interaction", t: 0.31 },
  { id: "pipeline", t: 0.5 },
  { id: "dashboard", t: 0.67 },
  { id: "showcase", t: 0.84 },
  { id: "finale", t: 0.985 },
];

export function sceneAt(p: number): string {
  let cur = SCENE_MARKS[0].id;
  for (const m of SCENE_MARKS) if (p >= m.t) cur = m.id;
  return cur;
}

/* ---------- helpers ---------- */

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
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  if (w < 760 || cores <= 4 || mem <= 4) return "low";
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

/* ---------- optional audio hooks (silent by default) ---------- */

export type CinemaCue =
  | "unfold"
  | "interface-activate"
  | "lead-born"
  | "data-pulse"
  | "booking-confirmed"
  | "reassemble";

type CueHandler = (cue: CinemaCue) => void;
const cueHandlers = new Set<CueHandler>();

export function onCue(handler: CueHandler) {
  cueHandlers.add(handler);
  return () => cueHandlers.delete(handler);
}

export function emitCue(cue: CinemaCue) {
  cueHandlers.forEach((h) => h(cue));
}
