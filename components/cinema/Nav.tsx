"use client";

import { useEffect, useRef, useState } from "react";
import { cinema } from "@/lib/cinema";
import GlassK from "@/components/GlassK";
import styles from "./Nav.module.css";

const LINKS: { label: string; t: number }[] = [
  { label: "Websites", t: 0.24 },
  { label: "Automation", t: 0.52 },
  { label: "Command centre", t: 0.7 },
  { label: "Work", t: 0.86 },
];

function seekTo(t: number) {
  (window as unknown as { __cinemaSeek?: (p: number) => void }).__cinemaSeek?.(t);
}

export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const shown = cinema.progress > 0.015;
        el.dataset.shown = shown ? "1" : "0";
        el.style.setProperty(
          "--nav-solid",
          Math.min(1, cinema.progress * 6).toFixed(3)
        );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={styles.nav} ref={ref} data-shown="0">
      <div className={styles.bar}>
        <button className={styles.brand} onClick={() => seekTo(0)} aria-label="Kivotra home">
          <span className={styles.mark}><GlassK variant="mark" sweepId="nav" /></span>
          <span className={styles.word}>Kivotra</span>
        </button>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((l) => (
            <button key={l.label} className={styles.link} onClick={() => seekTo(l.t)}>
              {l.label}
            </button>
          ))}
        </nav>

        <div className={styles.right}>
          <button className={`${styles.cta} ${styles.ctaDesktop}`} onClick={() => seekTo(1)}>
            Book a Call
          </button>
          <button
            className={styles.burger}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span data-open={open} />
            <span data-open={open} />
          </button>
        </div>
      </div>

      <div className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}>
        {LINKS.map((l) => (
          <button
            key={l.label}
            className={styles.sheetLink}
            onClick={() => { seekTo(l.t); setOpen(false); }}
          >
            {l.label}
          </button>
        ))}
        <button
          className={styles.sheetCta}
          onClick={() => { seekTo(1); setOpen(false); }}
        >
          Book a Call
        </button>
      </div>
    </header>
  );
}
