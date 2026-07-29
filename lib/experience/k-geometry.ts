/**
 * THE single source of truth for the Kivotra K — Concept D (Reduced Icon).
 *
 * One 2D letterform (64-unit viewBox) defines the mark, the favicon and the
 * 3D hero object. The 3D constants below are derived from the same numbers,
 * with the SIGNAL GAP centred on x = 0 — the gap is the narrative axis the
 * camera passes through.
 *
 * Concept D requirements encoded here:
 * - uninterrupted vertical stem (12→23)
 * - narrow intentional signal gap (23→25.5, 2.5 units)
 * - arms visually connected: inner tips overlap the stem line vertically
 *   (junction band y 31.5→32.5) so the letterform never reads as "I<"
 */

/* ---------- 2D letterform (viewBox 0 0 64 64) ---------- */

export const K2D = {
  viewBox: 64,
  stem: { x: 12, y: 6, w: 11, h: 52 },
  /** machined signal gap between stem (23) and arms (25.5) */
  gap: { from: 23, to: 25.5 },
  armTopPath: "M25.5 32.5 L43 6 L53 6 L35.5 32.5 Z",
  armBottomPath: "M25.5 31.5 L35.5 31.5 L53 58 L43 58 Z",
  /** thin accent line inside the gap (colour versions only) */
  signal: { x: 23.85, y: 10, w: 0.9, h: 44 },
} as const;

/* ---------- 3D derivation ---------- */

/** world units per letterform unit — K body height 3.2 wu over 52 u */
const S = 3.2 / 52;
/** gap centre in letterform x — becomes world x = 0 */
const GAP_CX = (K2D.gap.from + K2D.gap.to) / 2; // 24.25
/** letterform vertical centre */
const CY = 32;

const x3 = (x2: number) => (x2 - GAP_CX) * S;
const y3 = (y2: number) => (CY - y2) * S;

/** arm axis: from inner tip (25.5, 32.5) to outer top (43, 6) */
const ARM_DX = 43 - 25.5; // 17.5
const ARM_DY = 32.5 - 6; // 26.5

export const K3D = {
  depth: 0.5,
  /** lean of the arms from vertical, radians (≈ 33.4°) */
  armAngle: Math.atan(ARM_DX / ARM_DY),
  stem: {
    size: [K2D.stem.w * S, K2D.stem.h * S, 0.5] as [number, number, number],
    center: [x3(K2D.stem.x + K2D.stem.w / 2), 0, 0] as [
      number,
      number,
      number,
    ],
  },
  arm: {
    /** box: [perpendicular thickness, axis length, depth] */
    size: [
      10 * Math.sin(Math.atan(ARM_DY / ARM_DX)) * S,
      Math.hypot(ARM_DX, ARM_DY) * S,
      0.5,
    ] as [number, number, number],
    upperCenter: [x3(39.25), y3(19.25), 0] as [number, number, number],
    lowerCenter: [x3(39.25), -y3(19.25), 0] as [number, number, number],
    /** outer tip (cap position), from top-edge midpoint (48, 6) */
    upperTip: [x3(48), y3(6), 0] as [number, number, number],
    lowerTip: [x3(48), -y3(6), 0] as [number, number, number],
  },
  /** the signal: a vertical engineered line on the gap axis (x = 0) */
  signal: {
    height: K2D.signal.h * S, // ≈ 2.71
    /** half-width of the physical gap channel — the camera's clearance */
    halfGap: ((K2D.gap.to - K2D.gap.from) / 2) * S, // ≈ 0.077
  },
  /** machined rails on the stem's gap-facing face */
  railX: x3(K2D.gap.from),
  /** visual centre of the whole letterform in world x (for framing) */
  visualCenterX: x3(32.5), // ≈ 0.508
  bodyHeight: 3.2,
} as const;
