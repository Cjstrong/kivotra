import { K2D } from "@/lib/experience/k-geometry";

/**
 * The Kivotra mark — Concept D letterform, drawn from the shared geometry
 * source of truth (lib/experience/k-geometry). Fixed viewBox, fixed aspect:
 * it can never stretch or crop.
 */
export default function KMark({
  size = 24,
  signal = true,
}: {
  size?: number;
  signal?: boolean;
}) {
  const { stem, signal: slit } = K2D;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${K2D.viewBox} ${K2D.viewBox}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x={stem.x}
        y={stem.y}
        width={stem.w}
        height={stem.h}
        fill="currentColor"
      />
      {signal && (
        <rect
          x={slit.x}
          y={slit.y}
          width={slit.w}
          height={slit.h}
          fill="var(--accent, #4d7cfe)"
          opacity="0.9"
        />
      )}
      <path d={K2D.armTopPath} fill="currentColor" />
      <path d={K2D.armBottomPath} fill="currentColor" />
    </svg>
  );
}
