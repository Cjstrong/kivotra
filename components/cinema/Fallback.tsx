import GlassK from "@/components/GlassK";
import {
  SCENES,
  WORKFLOW_STEPS,
  AUTOMATION_EVENTS,
  COMMAND_TILES,
  INDUSTRIES,
  SHOWCASE,
  PROOF,
} from "@/lib/copy";
import styles from "./Fallback.module.css";

/**
 * Static, accessible telling of the same story. Rendered on the server (so the
 * page has real content for SEO and no-JS), and shown to visitors without WebGL
 * or who prefer reduced motion. Same copy, same order, no animation required.
 */
export default function Fallback() {
  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <a href="#top" className={styles.topBrand}>
          <span className={styles.topMark}><GlassK variant="mark" sweepId="fbnav" /></span>
          Kivotra
        </a>
        <a href="#book" className={styles.topCta}>Book a Call</a>
      </div>

      <header className={styles.hero} id="top">
        {/* the strongest generated crystal frame — the premium no-WebGL hero */}
        <div className={styles.heroK}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/hero-still.jpg"
            alt="The Kivotra crystal K emerging from darkness"
            className={styles.heroStill}
          />
        </div>
        <p className={styles.eyebrow}>Websites &amp; automation for local business</p>
        <h1 className={styles.heroTitle}>
          {SCENES.arrival.headline[0]}<br />
          <span className={styles.dim}>{SCENES.arrival.headline[1]}</span>
        </h1>
        <p className={styles.sub}>{SCENES.arrival.sub}</p>
        <div className={styles.actions}>
          <a href="#book" className={`${styles.btn} ${styles.primary}`}>{SCENES.arrival.primary}</a>
          <a href="#work" className={`${styles.btn} ${styles.ghost}`}>{SCENES.arrival.secondary}</a>
        </div>
      </header>

      <section className={styles.section}>
        <span className={styles.tag}>Websites</span>
        <h2 className={styles.h2}>{SCENES.website.headline}</h2>
        <p className={styles.sub}>{SCENES.website.sub}</p>
      </section>

      <section className={styles.section}>
        <span className={styles.tag}>The workflow</span>
        <h2 className={styles.h2}>{SCENES.lead.headline.join(" ")}</h2>
        <p className={styles.sub}>{SCENES.lead.sub}</p>
        <ol className={styles.steps}>
          {WORKFLOW_STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
      </section>

      <section className={styles.section}>
        <span className={styles.tag}>Automation</span>
        <h2 className={styles.h2}>{SCENES.automation.headline.join(" ")}</h2>
        <ul className={styles.events}>
          {AUTOMATION_EVENTS.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </section>

      <section className={styles.section} id="work">
        <span className={styles.tag}>Command centre</span>
        <h2 className={styles.h2}>{SCENES.control.headline}</h2>
        <p className={styles.sub}>{SCENES.control.sub}</p>
        <div className={styles.tiles}>
          {COMMAND_TILES.map((t) => (
            <div key={t.label} className={styles.tile}>
              <span className={styles.tileValue}>{t.value}</span>
              <span className={styles.tileLabel}>{t.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.industries}>
          {INDUSTRIES.map((ind) => (
            <div key={ind.key} className={styles.industry}>
              <h3>{ind.label}</h3>
              <ul>{ind.rows.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <span className={styles.tag}>Our work</span>
        <h2 className={styles.h2}>{SCENES.showcase.headline.join(" ")}</h2>
        <div className={styles.showcase}>
          {SHOWCASE.map((s) => (
            <div key={s.key} className={styles.showcaseItem}>
              <span>{s.name}</span>
              <em>{s.note}</em>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <span className={styles.tag}>{SCENES.proof.label}</span>
        <div className={styles.proof}>
          <div><h4>Before</h4>{PROOF.before.map((b) => <p key={b} className={styles.bad}>{b}</p>)}</div>
          <div><h4>After</h4>{PROOF.after.map((a) => <p key={a} className={styles.good}>{a}</p>)}</div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.final}`} id="book">
        <h2 className={styles.h2}>{SCENES.cta.headline.join(" ")}</h2>
        <p className={styles.sub}>{SCENES.cta.sub}</p>
        <div className={styles.actions}>
          <a href="#book" className={`${styles.btn} ${styles.primary}`}>{SCENES.cta.primary}</a>
          <a href="#work" className={`${styles.btn} ${styles.ghost}`}>{SCENES.cta.secondary}</a>
        </div>
      </section>
    </div>
  );
}
