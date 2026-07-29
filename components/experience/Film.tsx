"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Nav from "@/components/ui/Nav";
import Loader from "./Loader";
import CanvasRoot from "./CanvasRoot";
import TextLayer from "./TextLayer";
import ScrollHint from "./ScrollHint";
import { filmProgress } from "@/lib/experience/progress";
import {
  FILM_LENGTH_VH_DESKTOP,
  FILM_LENGTH_VH_MOBILE,
} from "@/lib/experience/timeline";
import { deviceTier } from "@/lib/experience/quality";
import styles from "./Film.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The pinned stage + the one master ScrollTrigger. A sticky stage inside a
 * tall spacer provides the scroll distance; the trigger scrubs a single
 * progress value that every layer derives its state from.
 */
export default function Film() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  // This component is client-only (dynamic, ssr: false), so the tier can be
  // resolved in the initializer — the ScrollTrigger then measures the spacer
  // at its correct final height on creation.
  const [lengthVh] = useState(() =>
    deviceTier() === "mobile" ? FILM_LENGTH_VH_MOBILE : FILM_LENGTH_VH_DESKTOP
  );

  useLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: spacerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => filmProgress.set(self.progress),
      });
    }, spacerRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Loader done={ready} />
      <Nav />

      <div
        ref={spacerRef}
        className={styles.spacer}
        style={{ height: `${lengthVh}vh` }}
      >
        <div className={styles.stage}>
          <CanvasRoot onReady={() => setReady(true)} />
          <TextLayer />
          <ScrollHint />
          <div className={styles.vignette} aria-hidden="true" />
        </div>
      </div>
    </>
  );
}
