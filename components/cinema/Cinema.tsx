"use client";

import { useEffect, useState } from "react";
import CinemaCanvas from "./CinemaCanvas";
import Stage from "./Stage";
import Nav from "./Nav";
import Inspector from "./Inspector";
import styles from "./Cinema.module.css";

/**
 * The homepage: one persistent Canvas + one pinned stage, both driven by the
 * single master timeline that lives in Stage. The tall spacer provides the
 * scroll distance the ScrollTrigger scrubs across.
 */
export default function Cinema() {
  // Dev tooling only appears in development AND when explicitly requested.
  const [showInspector, setShowInspector] = useState(false);
  useEffect(() => {
    setShowInspector(
      process.env.NODE_ENV !== "production" &&
        window.location.search.includes("debug=cinema")
    );
  }, []);
  return (
    <>
      <Nav />

      <div className="cinema-scroll" id="top">
        <div className="cinema-stage">
          <CinemaCanvas />
          <Stage />
        </div>
      </div>

      <footer className={styles.foot}>
        <span>Kivotra — websites &amp; automation for local business</span>
        <a href="#top">Back to top</a>
      </footer>

      {showInspector && <Inspector />}
    </>
  );
}
