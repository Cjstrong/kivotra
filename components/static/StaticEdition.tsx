import KMark from "@/components/ui/KMark";
import Nav from "@/components/ui/Nav";
import { BRAND, CAPABILITIES, FILM_LINES } from "@/lib/experience/copy";
import styles from "./StaticEdition.module.css";

/**
 * The designed static edition: served to search engines, no-JS visitors,
 * reduced-motion visitors and devices without WebGL. Same story, same copy,
 * same order — deliberately composed, not a degraded fallback.
 */
export default function StaticEdition() {
  return (
    <div className={styles.wrap} id="top">
      <Nav />

      <header className={styles.hero}>
        <div className={styles.heroMark} aria-hidden="true">
          <KMark size={520} />
        </div>
        <p className={styles.opening}>{FILM_LINES[0].text}</p>
        <h1 className={styles.title}>{BRAND.statement}</h1>
        <p className={styles.support}>{BRAND.support}</p>
        <div className={styles.actions}>
          <a href="#contact" className="btn btn-primary">
            {BRAND.ctaPrimary}
          </a>
          <a href="#work" className="btn">
            {BRAND.ctaSecondary}
          </a>
        </div>
      </header>

      <section className={styles.section} id="capabilities">
        <span className="mono-label">Capabilities</span>
        <ul className={styles.capabilities}>
          {CAPABILITIES.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section} id="work">
        <span className="mono-label">Selected work</span>
        <p className={styles.note}>
          Case studies are in production. Ask us to walk you through recent
          projects when we talk.
        </p>
      </section>

      <footer className={styles.footer} id="contact">
        <span className="mono-label">Contact</span>
        <h2 className={styles.footTitle}>Engineer your advantage.</h2>
        <div className={styles.actions}>
          <a href="mailto:hello@kivotra.com" className="btn btn-primary">
            {BRAND.ctaPrimary}
          </a>
        </div>
        <p className={styles.fine}>
          Kivotra — custom software, systems and digital experiences.
        </p>
      </footer>
    </div>
  );
}
