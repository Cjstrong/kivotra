"use client";

import { useEffect, useRef } from "react";
import { filmProgress } from "@/lib/experience/progress";
import { span } from "@/lib/experience/timeline";
import styles from "./ScrollHint.module.css";

/** Quiet signal that scrolling advances the experience. Gone by 6%. */
export default function ScrollHint() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      filmProgress.subscribe((p) => {
        const el = ref.current;
        if (!el) return;
        const o = 1 - span(p, 0.01, 0.06);
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o <= 0.001 ? "hidden" : "visible";
      }),
    []
  );

  return (
    <div ref={ref} className={styles.hint} aria-hidden="true">
      <span className="mono-label">Scroll</span>
      <span className={styles.tick} />
    </div>
  );
}
