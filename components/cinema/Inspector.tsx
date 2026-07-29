"use client";

import { useEffect, useRef, useState } from "react";
import { cinema, chan, sceneAt, SCENE_MARKS } from "@/lib/cinema";
import styles from "./Inspector.module.css";

/** Development-only cinematic inspector. Excluded from production builds. */
export default function Inspector() {
  const [open, setOpen] = useState(true);
  const [, force] = useState(0);
  const slider = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (slider.current && document.activeElement !== slider.current) {
        slider.current.value = String(Math.round(cinema.progress * 1000));
      }
      force((n) => (n + 1) % 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "`") setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const seek = (p: number) =>
    (window as unknown as { __cinemaSeek?: (p: number) => void }).__cinemaSeek?.(p);

  if (!open) {
    return (
      <button className={styles.fab} onClick={() => setOpen(true)}>
        ⚙ inspector
      </button>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <strong>Cinema Inspector</strong>
        <button className={styles.x} onClick={() => setOpen(false)}>×</button>
      </div>

      <input
        ref={slider}
        className={styles.slider}
        type="range"
        min={0}
        max={1000}
        defaultValue={0}
        onChange={(e) => seek(Number(e.target.value) / 1000)}
      />

      <div className={styles.scenes}>
        {SCENE_MARKS.map((s) => (
          <button
            key={s.id}
            className={`${styles.scene} ${sceneAt(cinema.progress) === s.id ? styles.active : ""}`}
            onClick={() => seek(Math.min(0.999, s.t + 0.03))}
          >
            {s.id}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        <span>scene</span><b>{sceneAt(cinema.progress)}</b>
        <span>progress</span><b>{cinema.progress.toFixed(3)}</b>
        <span>kUnfold</span><b>{chan.kUnfold.toFixed(2)}</b>
        <span>kParked</span><b>{chan.kParked.toFixed(2)}</b>
        <span>camZ</span><b>{chan.camZ.toFixed(2)}</b>
        <span>pointer</span><b>{cinema.pointerX.toFixed(2)}, {cinema.pointerY.toFixed(2)}</b>
        <span>tier</span><b>{cinema.tier}</b>
        <span>ready</span><b>{cinema.ready ? "yes" : "no"}</b>
      </div>

      <div className={styles.toggles}>
        <label>
          <input
            type="checkbox"
            defaultChecked={cinema.paused}
            onChange={(e) => (cinema.paused = e.target.checked)}
          />
          pause 3D
        </label>
        <label>
          <input
            type="checkbox"
            defaultChecked={cinema.reduced}
            onChange={(e) => (cinema.reduced = e.target.checked)}
          />
          reduced
        </label>
      </div>
    </div>
  );
}
