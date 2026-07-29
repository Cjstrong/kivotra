import KMark from "./KMark";
import { NAV_LINKS } from "@/lib/experience/copy";
import styles from "./Nav.module.css";

/** Extremely minimal. It must never compete with the opening scene. */
export default function Nav() {
  return (
    <header className={styles.nav}>
      <a href="#top" className={styles.brand} aria-label="Kivotra — home">
        <KMark size={20} />
        <span>Kivotra</span>
      </a>
      <nav className={styles.links} aria-label="Primary">
        {NAV_LINKS.map((l) => (
          <a key={l.label} href={l.href} className={styles.link}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
