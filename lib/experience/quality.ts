/**
 * Capability detection + device tiers. The experience only mounts when the
 * device can honour it; everyone else gets the designed static edition.
 */

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export type Tier = "high" | "mobile";

export function deviceTier(): Tier {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 820px)").matches;
  return coarse || narrow ? "mobile" : "high";
}

export const DPR_CAP: Record<Tier, number> = {
  high: 1.75,
  mobile: 1.5,
};
