"use client";

import { useEffect, useState } from "react";
import KMark from "@/components/ui/KMark";
import styles from "./Loader.module.css";

/**
 * The loading experience: near-black, the mark, one engineered line
 * drawing itself. No percentages. Fades as soon as the film's first
 * frame renders, then unmounts.
 */
export default function Loader({ done }: { done: boolean }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [done]);

  if (gone) return null;

  return (
    <div
      className={`${styles.loader} ${done ? styles.done : ""}`}
      aria-hidden="true"
    >
      <div className={styles.brand}>
        <KMark size={26} />
        <span className={styles.word}>Kivotra</span>
      </div>
      <span className={styles.draw} />
    </div>
  );
}
