/**
 * Master-timeline math. Everything on screen is a pure function of the film
 * progress value (0→1), which makes every state reversible and scrub-safe.
 */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Local progress 0→1 across the span [a, b] of the master timeline. */
export const span = (p: number, a: number, b: number) =>
  clamp01((p - a) / (b - a));

/** Linear interpolate. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Map master progress p across [a,b] onto [from,to] with an easing. */
export const track = (
  p: number,
  a: number,
  b: number,
  from: number,
  to: number,
  ease: (t: number) => number = easeInOutCubic
) => lerp(from, to, ease(span(p, a, b)));

/* Easings */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const easeInQuad = (t: number) => t * t;

/**
 * Text-window opacity: ramp in across [a,b], hold [b,c], ramp out [c,d].
 * Used for every narrative line — deliberate entrance, readable hold,
 * complete exit.
 */
export const fadeWindow = (
  p: number,
  [a, b, c, d]: [number, number, number, number]
) => {
  if (p <= a || p >= d) return 0;
  if (p < b) return easeOutCubic(span(p, a, b));
  if (p <= c) return 1;
  return 1 - easeInCubic(span(p, c, d));
};

/** Film beats for the hero prototype (Chapter 01 → 02 → pass-through). */
export const BEATS = {
  /* Chapter 01 — Signal */
  pulseOnly: [0.0, 0.24] as const, // lone point of light
  lineStretch: [0.24, 0.4] as const, // point → engineered vertical line
  /* Chapter 02 — Formation */
  stemIn: [0.4, 0.52] as const,
  armUpperIn: [0.46, 0.58] as const,
  armLowerIn: [0.5, 0.62] as const,
  capsIn: [0.56, 0.66] as const,
  internalsIn: [0.6, 0.72] as const,
  /* Transition — through the K into Chapter 03's first suggestion */
  passThrough: [0.85, 1.0] as const,
  corridorReveal: [0.84, 0.96] as const,
};

/** Scroll length of the prototype film. */
export const FILM_LENGTH_VH_DESKTOP = 340;
export const FILM_LENGTH_VH_MOBILE = 260;
