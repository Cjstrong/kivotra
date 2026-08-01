"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  chan,
  chapterAt,
  cinema,
  detectTier,
  hasWebGL,
} from "@/lib/cinema";
import { COPY } from "@/lib/copy";
import { WORK } from "@/lib/work";
import FilmCanvas from "./FilmCanvas";
import Fallback from "./Fallback";
import { gapCenterX } from "./scene/kGeometry";
import s from "./Film.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Film() {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"film" | "fallback" | null>(null);

  /* capability gate — decided on the client, once */
  useEffect(() => {
    // the film owns its scroll position; a reload restarts from chapter 01
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    // dev QA deep-link: #p=0.42 pins the film to that progress, defeating
    // the browser's late scroll restoration
    if (process.env.NODE_ENV === "development") {
      const m = window.location.hash.match(/p=([\d.]+)/);
      if (m) {
        const target = parseFloat(m[1]);
        const until = performance.now() + 12000;
        const assert = () => {
          const sc = document.querySelector("[class*='scroller']");
          if (sc) {
            const travel =
              (sc as HTMLElement).offsetHeight - window.innerHeight;
            const want = Math.round(travel * target);
            if (Math.abs(window.scrollY - want) > 4) window.scrollTo(0, want);
          }
          if (performance.now() < until) requestAnimationFrame(assert);
        };
        requestAnimationFrame(assert);
      }
    }
    cinema.tier = detectTier();
    cinema.reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const film = !cinema.reduced && cinema.tier !== "low" && hasWebGL();
    setMode(film ? "film" : "fallback");
  }, []);

  /* readiness — the scene flags its first rendered frame; a hard timeout
     guarantees the film is never blocked behind the loader */
  useEffect(() => {
    if (mode !== "film") return;
    const w = window as unknown as { __kivotraReady?: boolean };
    const id = window.setInterval(() => {
      if (cinema.ready || w.__kivotraReady) {
        setReady(true);
        window.clearInterval(id);
      }
    }, 100);
    const hard = window.setTimeout(() => setReady(true), 4000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(hard);
    };
  }, [mode]);

  /* pointer → optical response (film mode only) */
  useEffect(() => {
    if (mode !== "film") return;
    const onMove = (e: PointerEvent) => {
      cinema.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      cinema.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mode]);

  /* master timeline — the only ScrollTrigger in the film */
  useGSAP(
    () => {
      if (mode !== "film" || !scroller.current || !stage.current) return;

      const q = gsap.utils.selector(root.current);
      if (process.env.NODE_ENV === "development") {
        (window as unknown as { gsap?: typeof gsap }).gsap = gsap;
      }

      /* centering lives in GSAP so tweened transforms don't clobber it */
      gsap.set(q(`.${s.c1}`), { xPercent: -50 });
      gsap.set(q(`.${s.c2h}`), { xPercent: -50 });
      gsap.set(q(`.${s.c2s}`), { xPercent: -50 });
      gsap.set([q(`.${s.c3a}`), q(`.${s.c3b}`)], { yPercent: -50 });
      gsap.set(q(`.${s.c3c}`), { xPercent: -50, yPercent: -50 });
      gsap.set(q(`.${s.centered}`), { xPercent: -50 });
      gsap.set(q(`.${s.cvItem}`), { opacity: 0, y: 26 });
      gsap.set(q(`.${s.siteCanvas}`), { perspective: 1100 });

      /* explicit initial states — the film must be deterministic no matter
         when or how many times the timeline is (re)built */
      gsap.set(q(`.${s.copy} > *`), { opacity: 0 });
      gsap.set(
        [q(`.${s.dimmer}`), q(`.${s.canvasWrap}`), q(`.${s.workTrack}`)],
        { opacity: 0 },
      );
      gsap.set(q(`.${s.workInfo}`), { opacity: 0, y: 20 });
      gsap.set(q(`.${s.workRail}`), { xPercent: 0 });
      gsap.set(q(`.${s.canvasTilt}`), { rotateX: 0, scale: 1 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scroller.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.75,
          pin: stage.current,
          pinSpacing: false,
          onUpdate: (st) => {
            cinema.progress = st.progress;
            if (process.env.NODE_ENV === "development") {
              (window as unknown as { __p?: number }).__p = st.progress;
            }
            const c = chapterAt(st.progress);
            if (chapterRef.current) {
              const label = `${c.index} / ${c.name}`;
              if (chapterRef.current.textContent !== label)
                chapterRef.current.textContent = label;
            }
          },
        },
      });

      /* ── CH 01 · SIGNAL · 0–8 ── */
      tl.to(q(`.${s.c1}`), { opacity: 1, duration: 2 }, 1);
      tl.to(q(`.${s.c1}`), { opacity: 0, duration: 1.5 }, 6);
      tl.to(chan, { stretch: 1, duration: 2.5, ease: "power2.inOut" }, 3.5);
      tl.to(chan, { trace: 1, duration: 3, ease: "power1.inOut" }, 6);

      /* ── CH 02 · FORMATION · 8–18 ── */
      tl.to(chan, { assembly: 1, duration: 5, ease: "power1.inOut" }, 8.5);
      tl.to(chan, { glow: 1, duration: 7, ease: "power1.inOut" }, 9);
      tl.to(q(`.${s.c2h}`), { opacity: 1, duration: 1.5 }, 10);
      tl.to(q(`.${s.c2s}`), { opacity: 1, duration: 1.5 }, 11);
      tl.to(q(`.${s.c2s}`), { opacity: 0, duration: 1.5 }, 15);
      tl.to(q(`.${s.c2h}`), { opacity: 0, scale: 1.05, duration: 1.5 }, 15.5);
      /* the dive aims at the true centre of the open gap — never at glass */
      const GAP_X = gapCenterX();
      tl.to(chan, { camZ: 6.0, duration: 7, ease: "power1.inOut" }, 8);
      tl.to(chan, { camX: GAP_X, camY: 0, duration: 2.5, ease: "power1.inOut" }, 13.5);
      tl.to(chan, { camZ: -2.4, duration: 2.5, ease: "power2.in" }, 15.5);
      /* threshold: the world's light stays outside the letter */
      tl.to(chan, { glow: 0.12, duration: 1.5 }, 16.3);
      tl.to(chan, { fog: 0.085, duration: 1.5 }, 16.6);
      tl.to(chan, { kFade: 0, duration: 1.5 }, 17);

      /* ── CH 03 · REPETITION · 18–28 ── */
      /* the corridor materialises only AFTER the crossing */
      tl.to(chan, { corridor: 1, duration: 2.4 }, 18.4);
      tl.to(chan, { fog: 0.05, duration: 2.6 }, 18.8);
      tl.to(chan, { camX: 0, camY: 0.15, duration: 2, ease: "power1.inOut" }, 18);
      tl.to(chan, { camZ: -24, duration: 10 }, 18);
      tl.to(q(`.${s.c3a}`), { opacity: 1, duration: 1.2 }, 19.5);
      tl.to(q(`.${s.c3a}`), { opacity: 0, duration: 1.2 }, 21.8);
      tl.to(q(`.${s.c3b}`), { opacity: 1, duration: 1.2 }, 22.5);
      tl.to(q(`.${s.c3b}`), { opacity: 0, duration: 1.2 }, 24.8);
      tl.to(q(`.${s.c3c}`), { opacity: 1, duration: 1.2 }, 25.5);
      tl.to(q(`.${s.c3c}`), { opacity: 0, duration: 1.2 }, 27.6);

      /* ── CH 04 · INTERVENTION · 28–38 ── */
      tl.to(chan, { beam: 1, duration: 1.5 }, 28.5);
      tl.to(chan, { beamZ: -18, duration: 6, ease: "power1.in" }, 29);
      tl.to(chan, { beam: 0, duration: 1.5 }, 35.5);
      tl.to(chan, { reorg: 1, duration: 6.5, ease: "power1.inOut" }, 30);
      tl.to(chan, { fog: 0.028, duration: 6 }, 30);
      tl.to(chan, { camZ: -28, duration: 5 }, 28);
      tl.to(chan, { camZ: -44, camY: 0.6, duration: 6, ease: "power1.inOut" }, 34);
      tl.to(q(`.${s.c4a}`), { opacity: 1, duration: 1.2 }, 29.5);
      tl.to(q(`.${s.c4a}`), { opacity: 0, duration: 1.2 }, 33);
      tl.to(q(`.${s.c4b}`), { opacity: 1, duration: 1.2 }, 33.8);
      tl.to(q(`.${s.c4b}`), { opacity: 0, duration: 1.2 }, 37);

      /* ── CH 05 · SOFTWARE · 38–50 ── */
      tl.to(chan, { software: 1, duration: 3 }, 37);
      tl.to(chan, { camZ: -70, duration: 10 }, 40);
      tl.to(chan, { record: 1, duration: 8, ease: "power1.inOut" }, 40);
      tl.to(chan, { reflow: 1, duration: 3, ease: "power1.inOut" }, 43);
      tl.to(q(`.${s.c5a}`), { opacity: 1, duration: 1.2 }, 39);
      tl.to(q(`.${s.c5a}`), { opacity: 0, duration: 1.2 }, 43.5);
      tl.to(q(`.${s.c5tag}`), { opacity: 1, duration: 1.2 }, 40);
      tl.to(q(`.${s.c5tag}`), { opacity: 0, duration: 1.2 }, 47);
      tl.to(q(`.${s.c5b}`), { opacity: 1, duration: 1.2 }, 44);
      tl.to(q(`.${s.c5b}`), { opacity: 0, duration: 1.2 }, 48.5);

      /* ── CH 06 · AUTOMATION · 50–60 ── */
      tl.to(chan, { network: 1, duration: 3 }, 49);
      tl.to(chan, { connect: 1, duration: 7, ease: "power1.inOut" }, 51);
      tl.to(chan, { camZ: -80, duration: 6 }, 50);
      tl.to(chan, { camY: 2.4, duration: 5, ease: "power1.inOut" }, 53);
      tl.to(chan, { camZ: -78, duration: 2 }, 58);
      const c6 = [q(`.${s.c6a}`), q(`.${s.c6b}`), q(`.${s.c6c}`)];
      [51.5, 54.5, 57.5].forEach((at, i) => {
        tl.to(c6[i], { opacity: 1, duration: 1.2 }, at);
        tl.to(c6[i], { opacity: 0, duration: 1.2 }, at + 2);
      });

      /* ── CH 07 · DIGITAL EXPERIENCES · 60–68 ── */
      tl.to(q(`.${s.dimmer}`), { opacity: 0.94, duration: 2.5 }, 60);
      tl.to(q(`.${s.canvasWrap}`), { opacity: 1, duration: 1 }, 60.5);
      tl.to(
        q(`.${s.cvItem}`),
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.32 },
        60.8,
      );
      tl.to(q(`.${s.c7a}`), { opacity: 1, duration: 1.2 }, 60.5);
      tl.to(q(`.${s.c7a}`), { opacity: 0, duration: 1 }, 63.4);
      tl.to(
        q(`.${s.canvasTilt}`),
        { rotateX: 9, scale: 1.02, duration: 3, ease: "power1.inOut" },
        64,
      );
      tl.to(
        q(`.${s.cvItem}`),
        {
          z: (i: number, el: Element) =>
            Number((el as HTMLElement).dataset.depth || 0) * 130,
          duration: 3,
          stagger: 0.1,
          ease: "power1.inOut",
        },
        64.2,
      );
      tl.to(q(`.${s.c7b}`), { opacity: 1, duration: 1.2 }, 64.4);
      tl.to(q(`.${s.c7b}`), { opacity: 0, duration: 1 }, 66.9);
      tl.to(
        q(`.${s.canvasWrap}`),
        { opacity: 0, scale: 1.05, duration: 1.4 },
        66.8,
      );

      /* ── CH 08 · SELECTED WORK · 68–86 ── */
      tl.to(q(`.${s.workTrack}`), { opacity: 1, duration: 1 }, 67.5);
      const infos = q(`.${s.workInfo}`);
      const bgs = q(`.${s.workBg}`);
      tl.to(infos[0], { opacity: 1, y: 0, duration: 1.2 }, 68.5);
      tl.to(q(`.${s.workRail}`), { xPercent: -33.3333, duration: 2.5, ease: "power1.inOut" }, 72.5);
      tl.to(infos[1], { opacity: 1, y: 0, duration: 1.2 }, 75.2);
      tl.to(q(`.${s.workRail}`), { xPercent: -66.6666, duration: 2.5, ease: "power1.inOut" }, 79.5);
      tl.to(infos[2], { opacity: 1, y: 0, duration: 1.2 }, 82);
      tl.fromTo(bgs[0], { x: "0vw" }, { x: "-5vw", duration: 6 }, 68);
      tl.fromTo(bgs[1], { x: "5vw" }, { x: "-5vw", duration: 8 }, 73);
      tl.fromTo(bgs[2], { x: "5vw" }, { x: "0vw", duration: 6 }, 80);
      tl.to(q(`.${s.workTrack}`), { opacity: 0, duration: 1.4 }, 84.8);
      tl.to(q(`.${s.dimmer}`), { opacity: 0, duration: 1.5 }, 85.5);

      /* ── CH 09 · ONE SYSTEM · 86–94 ── */
      tl.to(chan, { machine: 1, duration: 2 }, 85.5);
      tl.to(chan, { kFade: 1, duration: 1.5 }, 86);
      tl.to(chan, { glow: 0.8, duration: 3 }, 87);
      tl.to(chan, { camX: GAP_X, duration: 3 }, 86);
      tl.to(chan, { camY: 0.5, duration: 4 }, 86);
      tl.to(chan, { camZ: 11, duration: 6.5, ease: "power2.out" }, 86);
      tl.to(chan, { fog: 0.016, duration: 4 }, 86);
      const c9 = [q(`.${s.c9a}`), q(`.${s.c9b}`), q(`.${s.c9c}`)];
      [87.2, 89.6, 92].forEach((at, i) => {
        tl.to(c9[i], { opacity: 1, duration: 1 }, at);
        if (i < 2) tl.to(c9[i], { opacity: 0, duration: 1 }, at + 1.9);
      });
      tl.to(c9[2], { opacity: 0, duration: 1 }, 93.6);
      tl.to(chan, { machine: 0.3, duration: 1.5 }, 93);

      /* ── CH 10 · CONVERSION · 94–100 ── */
      tl.to(chan, { camZ: 9.4, camY: 0.1, camX: 0, duration: 3, ease: "power1.out" }, 94);
      tl.to(chan, { glow: 1.2, duration: 2 }, 94);
      tl.to(q(`.${s.c10}`), { opacity: 1, duration: 1.5 }, 95.5);

      tl.duration(100);
    },
    { scope: root, dependencies: [mode] },
  );

  if (mode === null) {
    return <div className={s.loading} aria-hidden />;
  }

  if (mode === "fallback") {
    return <Fallback />;
  }

  const ch3 = COPY.repetition.lines;
  const ch6 = COPY.automation.lines;
  const ch9 = COPY.oneSystem.lines;

  const exploreWork = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!scroller.current) return;
    const travel = scroller.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: travel * 0.7, behavior: "smooth" });
  };

  return (
    <div ref={root} className={s.root}>
      <a className="skip-link" href="#site-footer">
        Skip to content
      </a>

      <nav className={s.nav} aria-label="Main">
        <span className={s.wordmark}>{COPY.nav.wordmark}</span>
        <a className={s.cta} href={COPY.nav.ctaHref}>
          {COPY.nav.cta}
        </a>
      </nav>
      <span className={`${s.chapterIndex} mono`} ref={chapterRef}>
        01 / Signal
      </span>

      <div ref={scroller} className={s.scroller}>
        <div ref={stage} className={s.stage}>
          <FilmCanvas onReady={() => setReady(true)} />

          {/* dims the WebGL world for the DOM chapters */}
          <div className={s.dimmer} aria-hidden />

          {/* CH 07 — the website canvas */}
          <div className={s.canvasWrap} aria-hidden>
            <div className={s.siteCanvas}>
              <div className={s.canvasTilt}>
                <div className={`${s.cvItem} ${s.cvHeader}`} data-depth="2.2">
                  <span />
                  <span />
                  <span />
                </div>
                <div className={`${s.cvItem} ${s.cvDisplay}`} data-depth="1.6" />
                <div className={`${s.cvItem} ${s.cvMedia}`} data-depth="1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/film/work-arla.png" alt="" />
                </div>
                <div className={`${s.cvItem} ${s.cvColA}`} data-depth="1.9">
                  <span />
                  <span />
                  <span />
                </div>
                <div className={`${s.cvItem} ${s.cvColB}`} data-depth="1.4">
                  <span />
                  <span />
                </div>
                <div className={`${s.cvItem} ${s.cvChip}`} data-depth="2.6" />
              </div>
            </div>
          </div>

          {/* CH 08 — selected work */}
          <div className={s.workTrack} aria-hidden={false}>
            <div className={s.workRail}>
              {WORK.map((w) => (
                <article key={w.key} className={s.workPanel}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={s.workBg} src={w.plate} alt="" />
                  <div className={s.workShade} />
                  <div
                    className={s.workInfo}
                    style={{ "--accent": w.accent } as React.CSSProperties}
                  >
                    <span className="mono">
                      {w.industry} · {w.note}
                    </span>
                    <h3 className="title">{w.name}</h3>
                    <dl>
                      <div>
                        <dt className="mono">Challenge</dt>
                        <dd>{w.challenge}</dd>
                      </div>
                      <div>
                        <dt className="mono">Solution</dt>
                        <dd>{w.solution}</dd>
                      </div>
                      <div>
                        <dt className="mono">Result</dt>
                        <dd>{w.result}</dd>
                      </div>
                    </dl>
                    <span className={s.workLink}>View case study →</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* copy layer */}
          <div className={s.copy}>
            <p className={s.c1}>{COPY.signal.line}</p>
            <h1 className={`${s.c2h} display`}>{COPY.formation.headline}</h1>
            <p className={s.c2s}>{COPY.formation.sub}</p>

            <div className={`${s.c3} ${s.c3a}`}>
              <span className="mono">/ 01</span>
              <span className="title">{ch3[0]}</span>
            </div>
            <div className={`${s.c3} ${s.c3b}`}>
              <span className="mono">/ 02</span>
              <span className="title">{ch3[1]}</span>
            </div>
            <div className={`${s.c3} ${s.c3c}`}>
              <span className="mono">/ 03</span>
              <span className="title">{ch3[2]}</span>
            </div>

            <p className={`${s.line} ${s.c4a} title`}>{COPY.intervention.a}</p>
            <p className={`${s.line} ${s.c4b} title`}>{COPY.intervention.b}</p>

            <p className={`${s.line} ${s.c5a} title`}>{COPY.software.a}</p>
            <p className={`${s.line} ${s.c5b} title`}>{COPY.software.b}</p>
            <p className={`${s.c5tag} ${s.centered} mono`}>
              {COPY.software.tag}
            </p>

            <p className={`${s.line} ${s.c6} ${s.c6a} title`}>{ch6[0]}</p>
            <p className={`${s.line} ${s.c6} ${s.c6b} title`}>{ch6[1]}</p>
            <p className={`${s.line} ${s.c6} ${s.c6c} title`}>{ch6[2]}</p>

            <p className={`${s.c7a} ${s.centered} title`}>
              {COPY.experiences.a}
            </p>
            <p className={`${s.c7b} ${s.centered} title`}>
              {COPY.experiences.b}
            </p>

            <p className={`${s.c9} ${s.c9a} ${s.centered} display`}>{ch9[0]}</p>
            <p className={`${s.c9} ${s.c9b} ${s.centered} display`}>{ch9[1]}</p>
            <p className={`${s.c9} ${s.c9c} ${s.centered} display`}>{ch9[2]}</p>

            <div className={`${s.c10} ${s.centered}`}>
              <h2 className="display">{COPY.conversion.headline}</h2>
              <div className={s.ctaRow}>
                <a className={s.btnPrimary} href={COPY.conversion.primaryHref}>
                  {COPY.conversion.primary}
                </a>
                <a className={s.btnGhost} href="#work" onClick={exploreWork}>
                  {COPY.conversion.secondary}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer id="site-footer" className={s.footer}>
        <span className={s.wordmark}>{COPY.nav.wordmark}</span>
        <p className="body">{COPY.footer.line}</p>
        <span className="mono">{COPY.footer.note}</span>
      </footer>

      <div
        className={`${s.loading} ${ready ? s.loadingHidden : ""}`}
        aria-hidden
      >
        <span className={s.wordmark}>{COPY.nav.wordmark}</span>
        <span className={s.loadingLine} />
      </div>
    </div>
  );
}
