import styles from "./GlassK.module.css";

const K_PATH =
  "M60,40 H110 V160 L205,40 H260 L150,190 L265,320 H210 L110,205 V320 H60 Z";

type Props = {
  variant?: "hero" | "mark";
  className?: string;
  sweepId?: string;
};

/**
 * The Kivotra glass K. Faceted optical-glass mark — the one place the full
 * spectrum is allowed. Pure SVG so it stays crisp at any size and needs no GPU.
 */
export default function GlassK({ variant = "mark", className = "", sweepId }: Props) {
  const uid = sweepId || variant;
  return (
    <svg
      viewBox="0 0 300 360"
      className={`${variant === "hero" ? styles.hero : styles.mark} ${className}`}
      role="img"
      aria-label="Kivotra"
    >
      <defs>
        <linearGradient id={`kA-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d6f2ee" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#5be9de" stopOpacity="0.6" />
          <stop offset="1" stopColor="#0c5852" stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id={`kB-${uid}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c3c0ff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#8f8bff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#2b2a55" stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id={`kC-${uid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ffc7d8" stopOpacity="0.82" />
          <stop offset="1" stopColor="#5be9de" stopOpacity="0.42" />
        </linearGradient>
        <linearGradient id={`kEdge-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5be9de" />
          <stop offset="0.5" stopColor="#8f8bff" />
          <stop offset="1" stopColor="#ff9dbb" />
        </linearGradient>
        <linearGradient id={`kSweep-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`kClip-${uid}`}>
          <path d={K_PATH} />
        </clipPath>
      </defs>

      <path d={K_PATH} fill={`url(#kA-${uid})`} />
      <g clipPath={`url(#kClip-${uid})`} opacity="0.9">
        <polygon points="110,40 205,40 150,190" fill={`url(#kB-${uid})`} opacity="0.85" />
        <polygon points="205,40 260,40 150,190" fill={`url(#kC-${uid})`} opacity="0.6" />
        <polygon points="150,190 265,320 210,320" fill={`url(#kB-${uid})`} opacity="0.7" />
        <polygon points="60,40 110,40 110,320 60,320" fill="#ffffff" opacity="0.07" />
        <polygon points="110,205 210,320 110,320" fill="#04120f" opacity="0.28" />
        {variant === "hero" && (
          <rect
            className={styles.sweep}
            x="-140"
            y="0"
            width="120"
            height="360"
            fill={`url(#kSweep-${uid})`}
            opacity="0.5"
          />
        )}
      </g>
      <path
        d={K_PATH}
        fill="none"
        stroke={`url(#kEdge-${uid})`}
        strokeWidth={variant === "hero" ? 1.4 : 2}
        strokeLinejoin="round"
      />
      {variant === "hero" && (
        <path
          d="M72,52 V300"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
          clipPath={`url(#kClip-${uid})`}
        />
      )}
    </svg>
  );
}
