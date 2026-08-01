"use client";

/**
 * Static experience — reduced motion, low-tier devices, or no WebGL.
 * The full narrative in plain readable sections over composed stills.
 */

import Image from "next/image";
import { COPY } from "@/lib/copy";
import { WORK } from "@/lib/work";
import s from "./Fallback.module.css";
import f from "./Film.module.css";

export default function Fallback() {
  return (
    <div className={s.root}>
      <nav className={f.nav} aria-label="Main">
        <span className={f.wordmark}>{COPY.nav.wordmark}</span>
        <a className={f.cta} href={COPY.nav.ctaHref}>
          {COPY.nav.cta}
        </a>
      </nav>

      <header className={s.hero}>
        <Image
          src="/film/hero-fallback.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={s.heroImg}
        />
        <div className={s.heroCopy}>
          <p className={s.kicker}>{COPY.signal.line}</p>
          <h1 className="display">{COPY.formation.headline}</h1>
          <p className="body">{COPY.formation.sub}</p>
        </div>
      </header>

      <section className={s.section}>
        {COPY.repetition.lines.map((line, i) => (
          <div key={line} className={s.row}>
            <span className="mono">/ 0{i + 1}</span>
            <span className="title">{line}</span>
          </div>
        ))}
        <p className="body">{COPY.intervention.a}</p>
        <p className="title">{COPY.intervention.b}</p>
      </section>

      <section className={s.section}>
        <span className="mono">{COPY.software.tag}</span>
        <p className="title">{COPY.software.a}</p>
        <p className="body">{COPY.software.b}</p>
        {COPY.automation.lines.map((line) => (
          <p key={line} className="title">
            {line}
          </p>
        ))}
      </section>

      <section className={s.section}>
        <p className="title">{COPY.experiences.a}</p>
        <p className="body">{COPY.experiences.b}</p>
        {WORK.map((w) => (
          <div key={w.key} className={s.row}>
            <span className="mono">
              {w.industry} · {w.note}
            </span>
            <span className="title">{w.name}</span>
          </div>
        ))}
      </section>

      <section className={s.section}>
        {COPY.oneSystem.lines.map((line) => (
          <p key={line} className="title">
            {line}
          </p>
        ))}
        <h2 className="display">{COPY.conversion.headline}</h2>
        <div className={f.ctaRow}>
          <a className={f.btnPrimary} href={COPY.conversion.primaryHref}>
            {COPY.conversion.primary}
          </a>
        </div>
      </section>

      <footer className={f.footer}>
        <span className={f.wordmark}>{COPY.nav.wordmark}</span>
        <p className="body">{COPY.footer.line}</p>
        <span className="mono">{COPY.footer.note}</span>
      </footer>
    </div>
  );
}
