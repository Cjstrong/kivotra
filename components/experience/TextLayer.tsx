"use client";

import { useEffect, useRef } from "react";
import { FILM_LINES } from "@/lib/experience/copy";
import { fadeWindow } from "@/lib/experience/timeline";
import { filmProgress } from "@/lib/experience/progress";
import styles from "./TextLayer.module.css";

/**
 * Every narrative line, as real HTML in narrative order. Opacity and drift
 * are pure functions of film progress — deliberate entrance, readable hold,
 * complete exit, and never two lines at once (enforced by the copy windows).
 */
export default function TextLayer() {
  const refs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(
    () =>
      filmProgress.subscribe((p) => {
        FILM_LINES.forEach((line, i) => {
          const el = refs.current[i];
          if (!el) return;
          const o = fadeWindow(p, line.window);
          el.style.opacity = o.toFixed(3);
          el.style.transform = `translate3d(0, ${((1 - o) * 14).toFixed(2)}px, 0)`;
          el.style.visibility = o <= 0.001 ? "hidden" : "visible";
        });
      }),
    []
  );

  return (
    <div className={styles.layer}>
      {FILM_LINES.map((line, i) => (
        <p
          key={line.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`${styles.line} ${
            line.role === "line" ? styles.narration : styles[line.role]
          }`}
        >
          {line.text}
        </p>
      ))}
    </div>
  );
}
