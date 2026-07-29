"use client";

import { useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { chan, cinema, detectTier, clamp01 } from "@/lib/cinema";
import { WORKFLOW_STEPS } from "@/lib/copy";
import styles from "./Stage.module.css";

/**
 * The pinned stage: every DOM composition plus THE master timeline.
 *
 * One GSAP timeline, scrubbed by one ScrollTrigger, owns every animation on
 * the page — DOM and WebGL alike (the 3D scene reads `chan`, which only this
 * timeline writes). Each scene is sequenced entrance → hold → exit, and no
 * two copy blocks ever coexist, so any scroll position is a finished frame.
 */

const D = 100; // master duration in timeline units

/* The system's geometry — one coordinate space (viewBox 1200×620) shared by
   the SVG fibre paths and the absolutely-positioned modules, so the signal
   always meets its module. Modules 0–6 arc over the core at (600, 470). */
const SYSTEM_MODS: [number, number][] = [
  [120, 300], [280, 180], [450, 110], [600, 90], [750, 110], [920, 180], [1080, 300],
];
/* Segments: 0 = core→M1, 1–6 = module→module, 7 = M7→core (the return). */
const SYSTEM_SEGS = [
  "M 552 428 Q 330 408 134 334",
  "M 136 268 Q 175 208 246 190",
  "M 316 162 Q 372 132 418 122",
  "M 484 102 Q 540 92 570 90",
  "M 630 90 Q 686 92 718 102",
  "M 784 122 Q 830 132 886 162",
  "M 956 190 Q 1026 208 1064 268",
  "M 1066 334 Q 870 408 648 428",
];

export default function Stage() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    cinema.tier = detectTier();
    cinema.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const el = root.current;
    if (!el) return;
    const q = (sel: string) => el.querySelector<HTMLElement>(sel);
    const qa = (sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel));

    /* ---------- pointer (for 3D reflections + device tilt) ---------- */
    const onPointer = (e: PointerEvent) => {
      cinema.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      cinema.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
      el.style.setProperty("--px", cinema.pointerX.toFixed(3));
      el.style.setProperty("--py", cinema.pointerY.toFixed(3));
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    /* ---------- smooth scroll ---------- */
    let lenis: Lenis | null = null;
    if (!cinema.reduced) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      (el as HTMLElement & { __lenisRaf?: (t: number) => void }).__lenisRaf = raf;
    }

    /* ---------- master timeline ---------- */
    const mobile = window.innerWidth < 760;

    /* The loop contract: the film opens from this pose and the finale tweens
       back to this exact object — beginning and end are the same frame. */
    const openingPose = mobile
      ? { camZ: 11.8, camY: -0.1, targetY: -0.2, kUnfold: 0, kParked: 0 }
      : { camZ: 9.4, camY: -0.4, targetY: -0.55, kUnfold: 0, kParked: 0 };

    const ctx = gsap.context(() => {
      gsap.set(chan, openingPose);
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: ".cinema-scroll",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.75,
          onUpdate: (self) => {
            cinema.progress = self.progress;
          },
        },
      });

      const copies = qa("[data-copy]");
      // Everything hidden except the hero copy; deterministic on refresh.
      gsap.set(copies, { autoAlpha: 0, y: 44 });
      gsap.set("[data-copy='1']", { autoAlpha: 1, y: 0 });
      gsap.set("[data-el='site']", { autoAlpha: 0, y: 60, scale: 0.94 });
      gsap.set("[data-el='film2']", { autoAlpha: 0 });
      gsap.set("[data-el='filmtitle']", { autoAlpha: 0, y: 26 });
      gsap.set("[data-el='filmpanel']", { autoAlpha: 0, y: 30 });
      gsap.set("[data-el='filmcta']", { autoAlpha: 0, y: 24 });
      gsap.set("[data-el='cursor']", { autoAlpha: 0, x: 260, y: -140, scale: 1 });
      gsap.set("[data-el='click']", { autoAlpha: 0, scale: 0.4 });
      gsap.set("[data-el='sent']", { autoAlpha: 0, y: 8 });
      // The orb is born where the film's CTA sits, then glides to the core.
      gsap.set(
        "[data-el='orb']",
        mobile
          ? { autoAlpha: 0, scale: 0.2, left: "50%", top: "30%" }
          : { autoAlpha: 0, scale: 0.2, left: "13%", top: "72%" }
      );
      // The system sleeps: silhouette only. Fibre paths are measured so the
      // lit overlays and ring sweeps can be scrubbed by dashoffset.
      gsap.set("[data-el='system']", { autoAlpha: 0 });
      gsap.set("[data-el='coreglow']", { autoAlpha: 0 });
      gsap.set("[data-el='pulse']", { autoAlpha: 0 });
      qa("[data-lit]").forEach((p) => {
        const len = (p as unknown as SVGPathElement).getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      const RING_CORE = 2 * Math.PI * 92;
      const RING_MOD = 2 * Math.PI * 15;
      gsap.set("[data-el='corering']", { strokeDasharray: RING_CORE, strokeDashoffset: RING_CORE });
      qa("[data-modring]").forEach((c) => gsap.set(c, { strokeDasharray: RING_MOD, strokeDashoffset: RING_MOD }));
      qa("[data-mod]").forEach((m) => gsap.set(m, { opacity: 0.42 }));
      qa("[data-modinner]").forEach((m) => gsap.set(m, { autoAlpha: 0 }));
      qa("[data-modstatus]").forEach((m) => gsap.set(m, { autoAlpha: 0, scale: 0.3 }));
      gsap.set("[data-el='dash']", { autoAlpha: 0, y: 70, scale: 0.96 });
      gsap.set(qa("[data-card]"), { autoAlpha: 0, y: 34 });
      gsap.set("[data-el='chartline']", { strokeDashoffset: 1 });
      gsap.set("[data-el='chartfill']", { autoAlpha: 0 });
      gsap.set(qa("[data-row]"), { autoAlpha: 0, x: 22 });
      gsap.set("[data-el='devices']", { autoAlpha: 0 });
      gsap.set("[data-el='dev-desktop']", { y: 80, rotateY: -10 });
      gsap.set("[data-el='dev-phone']", { y: 130, rotateY: -16 });
      // portfolio: project A on every screen; B and C wait beneath
      gsap.set(qa("[data-proj='a']"), { autoAlpha: 1 });
      gsap.set(qa("[data-proj='b']"), { autoAlpha: 0 });
      gsap.set(qa("[data-proj='c']"), { autoAlpha: 0 });

      const copyIn = (n: number, at: number) =>
        tl.to(`[data-copy='${n}']`, { autoAlpha: 1, y: 0, duration: 2.6, ease: "power3.out" }, at);
      const copyOut = (n: number, at: number) =>
        tl.to(`[data-copy='${n}']`, { autoAlpha: 0, y: -44, duration: 2.2, ease: "power3.in" }, at);

      /* SCENE 1 — the K, alone. Hold 0–9. */
      copyOut(1, 9);

      /* SCENE 2 — mechanical unfold into the website. */
      tl.to(chan, { kUnfold: 1, duration: 9, ease: "power2.inOut" }, 11);
      tl.to(
        chan,
        mobile
          ? { camZ: 14.2, camY: 0, targetY: 0, duration: 9, ease: "power2.inOut" }
          : { camZ: 12.4, camY: 0, targetY: 0, duration: 9, ease: "power2.inOut" },
        11
      );
      tl.to("[data-el='site']", { autoAlpha: 1, y: 0, scale: 1, duration: 5, ease: "power3.out" }, 17.5);
      copyIn(2, 20);

      /* The walkthrough: scroll scrubs the film. One continuous journey —
         approach (film1) cuts to interior (film2) on the door threshold. */
      const film1 = q("[data-el='film1']") as HTMLVideoElement | null;
      const film2 = q("[data-el='film2']") as HTMLVideoElement | null;
      const seek = (v: HTMLVideoElement | null, p: number) => {
        if (v && v.duration && isFinite(v.duration)) {
          v.currentTime = Math.min(v.duration - 0.05, Math.max(0, p * v.duration));
        }
      };
      const scrub = { p1: 0, p2: 0 };
      tl.to(scrub, { p1: 1, duration: 13, ease: "none", onUpdate: () => seek(film1, scrub.p1) }, 17.5);
      tl.to(scrub, { p2: 1, duration: 7.4, ease: "none", onUpdate: () => seek(film2, scrub.p2) }, 30.6);
      tl.to("[data-el='film2']", { autoAlpha: 1, duration: 1.1, ease: "power1.inOut" }, 30.2);
      // the title reads as if set into the concrete during the approach
      tl.to("[data-el='filmtitle']", { autoAlpha: 1, y: 0, duration: 2.8, ease: "power3.out" }, 20.5);
      tl.to("[data-el='filmtitle']", { autoAlpha: 0, y: -18, duration: 2, ease: "power3.in" }, 27.2);

      /* SCENE 3 — the interaction. Inside now: facts surface in glass,
         the illuminated plate takes the click, the lead is born. */
      copyOut(2, 27.5);
      copyIn(3, 30.5);
      tl.to("[data-el='filmpanel']", { autoAlpha: 1, y: 0, duration: 2.4, ease: "power3.out" }, 31.2);
      tl.to("[data-el='filmcta']", { autoAlpha: 1, y: 0, duration: 2.2, ease: "power3.out" }, 31.6);
      tl.to("[data-el='cursor']", { autoAlpha: 1, duration: 1 }, 28);
      tl.to("[data-el='cursor']", { x: 0, y: 0, duration: 3.4, ease: "power2.inOut" }, 28.6);
      tl.to("[data-el='cursor']", { scale: 0.82, duration: 0.5, ease: "power2.in" }, 32.2);
      tl.to("[data-el='cursor']", { scale: 1, duration: 0.6, ease: "power2.out" }, 32.7);
      tl.to("[data-el='click']", { autoAlpha: 0.9, scale: 1.7, duration: 1.2, ease: "power2.out" }, 32.4);
      tl.to("[data-el='click']", { autoAlpha: 0, duration: 0.8 }, 33.6);
      tl.to("[data-el='sent']", { autoAlpha: 1, y: 0, duration: 1.4, ease: "power3.out" }, 33.4);
      tl.to("[data-el='orb']", { autoAlpha: 1, scale: 1, duration: 2, ease: "back.out(2)" }, 34.2);
      tl.to("[data-el='cursor']", { autoAlpha: 0, duration: 1 }, 34.4);

      /* SCENE 4 — the site leaves; the enquiry enters the machine.
         Dormant silhouette → core boot → the signal activates all seven
         modules in order → the circuit closes back at the core. */
      copyOut(3, 38);
      tl.to("[data-el='site']", { autoAlpha: 0, y: -70, scale: 0.96, duration: 4.5, ease: "power3.in" }, 39);
      tl.to("[data-el='sent']", { autoAlpha: 0, duration: 1.5 }, 39);
      tl.to(chan, { kParked: 1, duration: 5, ease: "power2.inOut" }, 39.5);
      // dormant system reveal — silhouette, breathing, nothing active
      tl.to("[data-el='system']", { autoAlpha: 1, duration: 3, ease: "power2.out" }, 40);
      // the orb (the enquiry) glides into the core
      tl.to(
        "[data-el='orb']",
        mobile
          ? { left: "50%", top: "40%", duration: 3.6, ease: "power2.inOut" }
          : { left: "50%", top: "58%", duration: 3.6, ease: "power2.inOut" },
        41
      );
      copyIn(4, 44);
      // boot: the orb is absorbed, the ring sweeps once, the core lights
      tl.to("[data-el='orb']", { scale: 0.25, autoAlpha: 0, duration: 1.4, ease: "power2.in" }, 44.2);
      tl.to("[data-el='corering']", { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut" }, 44.6);
      tl.to("[data-el='coreglow']", { autoAlpha: 1, duration: 2.2, ease: "power2.out" }, 45.4);

      // the signal: per stage — pulse rides the fibre path, the module's
      // ring spins once, its internals light, its status point locks in
      const pulse = q("[data-el='pulse']");
      const rideSeg = (seg: number, at: number, dur: number) => {
        const path = q(`[data-lit='${seg}']`) as unknown as SVGPathElement | null;
        if (!path || !pulse) return;
        const prox = { p: 0 };
        tl.to(`[data-lit='${seg}']`, { strokeDashoffset: 0, duration: dur, ease: "none" }, at);
        tl.to(
          prox,
          {
            p: 1,
            duration: dur,
            ease: "none",
            onUpdate: () => {
              const pt = path.getPointAtLength(prox.p * path.getTotalLength());
              gsap.set(pulse, { attr: { cx: pt.x, cy: pt.y } });
            },
          },
          at
        );
      };
      tl.to("[data-el='pulse']", { autoAlpha: 1, duration: 0.4 }, 47.4);
      WORKFLOW_STEPS.forEach((_, i) => {
        const at = 47.6 + i * 1.7;
        rideSeg(i, at, 0.95);
        tl.to(`[data-modring='${i}']`, { strokeDashoffset: 0, duration: 0.55, ease: "power1.inOut" }, at + 0.9);
        tl.to(`[data-mod='${i}']`, { opacity: 1, duration: 0.5, ease: "power2.out" }, at + 1.05);
        tl.to(`[data-modinner='${i}']`, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, at + 1.1);
        tl.to(`[data-modstatus='${i}']`, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.5)" }, at + 1.25);
      });
      // the return: revenue closes the circuit; the whole system holds lit
      rideSeg(7, 59.2, 1.1);
      tl.to("[data-el='pulse']", { autoAlpha: 0, duration: 0.5 }, 60.2);
      tl.to("[data-el='coreglow']", { scale: 1.15, duration: 1.2, ease: "power2.out" }, 60.2);

      /* SCENE 5 — everything folds into the command centre. */
      copyOut(4, 60.6);
      tl.to("[data-el='system']", { autoAlpha: 0, y: -44, duration: 2.6, ease: "power3.in" }, 61.6);
      tl.to("[data-el='dash']", { autoAlpha: 1, y: 0, scale: 1, duration: 4.5, ease: "power3.out" }, 64.5);
      tl.to(qa("[data-card]"), { autoAlpha: 1, y: 0, duration: 2.4, stagger: 0.5, ease: "power3.out" }, 65.5);
      tl.to("[data-el='chartline']", { strokeDashoffset: 0, duration: 5, ease: "power2.inOut" }, 67);
      tl.to("[data-el='chartfill']", { autoAlpha: 1, duration: 3 }, 69.5);
      tl.to(qa("[data-row]"), { autoAlpha: 1, x: 0, duration: 2, stagger: 0.45, ease: "power3.out" }, 68);
      copyIn(5, 66.5);

      // live numbers count up with the scrub — reversible by construction
      qa("[data-count]").forEach((node) => {
        const target = parseFloat(node.dataset.count || "0");
        const proxy = { v: 0 };
        tl.to(
          proxy,
          {
            v: target,
            duration: 6,
            ease: "power2.out",
            onUpdate: () => {
              node.textContent = Math.round(proxy.v).toLocaleString("en-US");
            },
          },
          66
        );
      });

      /* SCENE 6 — the work. Devices sweep past the lens. */
      copyOut(5, 74.5);
      tl.to("[data-el='dash']", { autoAlpha: 0, y: -60, scale: 0.97, duration: 4, ease: "power3.in" }, 76);
      tl.to("[data-el='devices']", { autoAlpha: 1, duration: 3 }, 79);
      tl.to("[data-el='dev-desktop']", { y: 0, rotateY: 0, duration: 4.5, ease: "power3.out" }, 79.5);
      tl.to("[data-el='dev-phone']", { y: 0, rotateY: -8, duration: 4.5, ease: "power3.out" }, 80.6);
      copyIn(6, 81);
      // the camera drifts across the gallery during the hold
      tl.to("[data-el='devtrack']", { xPercent: -8, duration: 8, ease: "none" }, 83);
      // the same devices re-dress for each project: Aurelia → Veyra → Olive
      tl.to(qa("[data-proj='a']"), { autoAlpha: 0, duration: 1.1, ease: "power2.inOut" }, 84.2);
      tl.to(qa("[data-proj='b']"), { autoAlpha: 1, duration: 1.1, ease: "power2.inOut" }, 84.6);
      tl.to(qa("[data-proj='b']"), { autoAlpha: 0, duration: 1.1, ease: "power2.inOut" }, 87.2);
      tl.to(qa("[data-proj='c']"), { autoAlpha: 1, duration: 1.1, ease: "power2.inOut" }, 87.6);

      /* SCENE 7 — everything reconstructs into the object, and the film's
         last frame IS its first: the finale tweens chan back to openingPose,
         and the closing copy mirrors the hero. The loop closes. */
      copyOut(6, 89.5);
      tl.to("[data-el='devices']", { autoAlpha: 0, y: -50, duration: 3.5, ease: "power3.in" }, 91);
      tl.to(chan, { kParked: openingPose.kParked, duration: 4, ease: "power2.out" }, 92.5);
      tl.to(chan, { kUnfold: openingPose.kUnfold, duration: 5.5, ease: "power3.inOut" }, 93.5);
      tl.to(
        chan,
        {
          camZ: openingPose.camZ,
          camY: openingPose.camY,
          targetY: openingPose.targetY,
          duration: 5.5,
          ease: "power3.inOut",
        },
        93.5
      );
      copyIn(7, D - 3.2);
      tl.to({}, { duration: 0.001 }, D); // pin the full duration

      if (process.env.NODE_ENV !== "production") {
        // Audit hook: drive the master timeline directly, bypassing scrub lag.
        (window as unknown as { __tl?: gsap.core.Timeline }).__tl = tl;
      }
    }, el);

    /* ---------- anchor + dev seek ---------- */
    const scroller = document.querySelector<HTMLElement>(".cinema-scroll");
    const seek = (p: number) => {
      if (!scroller) return;
      const total = scroller.offsetHeight - window.innerHeight;
      const y = scroller.offsetTop + clamp01(p) * total;
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
      ScrollTrigger.update();
    };
    (window as unknown as { __cinemaSeek?: (p: number) => void }).__cinemaSeek = seek;
    if (process.env.NODE_ENV !== "production") {
      // Verification aid: /?p=0.42 lands the film on that frame BEFORE the
      // first paint, so even a single composited frame shows the scene.
      const param = new URLSearchParams(window.location.search).get("p");
      if (param) {
        const target = clamp01(parseFloat(param));
        seek(target);
        ScrollTrigger.refresh();
        seek(target);
        for (let i = 0; i < 8; i++) gsap.ticker.tick();
        const tlAny = (window as unknown as { __tl?: gsap.core.Timeline }).__tl;
        if (tlAny) tlAny.progress(target, false);
      }
      (window as unknown as { __cine?: unknown }).__cine = {
        unpause: () => {
          cinema.paused = false;
        },
        goto: seek,
        tick: (count = 3) => {
          for (let i = 0; i < count; i++) gsap.ticker.tick();
        },
      };
    }

    return () => {
      window.removeEventListener("pointermove", onPointer);
      const raf = (el as HTMLElement & { __lenisRaf?: (t: number) => void }).__lenisRaf;
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <div className={styles.stage} ref={root}>
      {/* ---- copy: one block at a time, ever ---- */}
      <div className={styles.copyLayer}>
        <div className={`${styles.copy} ${styles.copyHero}`} data-copy="1">
          <p className={styles.kicker}>Kivotra</p>
          <h1 className={styles.h1}>
            Websites that win attention.
            <br />
            <span className={styles.dim}>Systems that run the business.</span>
          </h1>
          <a href="#book" className={styles.cta}>Book a Call</a>
        </div>

        <div className={styles.copy} data-copy="2">
          <span className={styles.anno}>PROJECT 001 — WEBSITE</span>
          <h2 className={styles.h2}>Your website should do more than look good.</h2>
          <p className={styles.sub}>It should turn visitors into enquiries.</p>
        </div>

        <div className={styles.copy} data-copy="3">
          <span className={styles.anno}>ATTENTION INTO ACTION</span>
          <h2 className={styles.h2}>Attention becomes action.</h2>
        </div>

        <div className={styles.copy} data-copy="4">
          <span className={styles.anno}>LIVE WORKFLOW</span>
          <h2 className={styles.h2}>Every enquiry handled. Every follow-up sent.</h2>
        </div>

        <div className={styles.copy} data-copy="5">
          <span className={styles.anno}>CONTROL LAYER</span>
          <h2 className={styles.h2}>One clear view of everything that matters.</h2>
        </div>

        <div className={styles.copy} data-copy="6">
          <span className={styles.anno}>SELECTED WORK</span>
          <h2 className={styles.h2}>Built to be remembered. Designed to convert.</h2>
        </div>

        {/* the closing frame mirrors the opening — the loop */}
        <div className={`${styles.copy} ${styles.copyHero}`} data-copy="7" id="book">
          <span className={styles.anno}>BUILT TO KEEP MOVING</span>
          <p className={styles.kicker}>Kivotra</p>
          <h2 className={styles.h1}>
            Websites that win attention.
            <br />
            <span className={styles.dim}>Systems that run the business.</span>
          </h2>
          <a href="#book" className={styles.cta}>Book a Call</a>
        </div>
      </div>

      {/* ---- scene 2/3: the work itself — inside the Veyra film.
           No browser chrome, no mockup: a continuous scroll-scrubbed
           walkthrough of the project. Approach → door → interior → pool.
           The lead is still born here (click → sent → orb), so the film
           hands off to the pipeline exactly as before. ---- */}
      <div className={styles.film} data-el="site" aria-hidden="true">
        <div className={styles.filmStage}>
          <video
            className={styles.filmVideo}
            data-el="film1"
            src="/video/veyra-approach.mp4"
            poster="/img/veyra-approach.jpg"
            muted
            playsInline
            preload="auto"
          />
          <video
            className={styles.filmVideo}
            data-el="film2"
            src="/video/veyra-interior.mp4"
            poster="/img/veyra-interior.jpg"
            muted
            playsInline
            preload="auto"
          />
          <span className={styles.filmGrade} />
          {/* in-world: the title reads as if set into the concrete */}
          <span className={styles.filmTitle} data-el="filmtitle">
            VEYRA<i>Cliffside Residence — one continuous walkthrough</i>
          </span>
          {/* in-world: an illuminated glass panel carries the facts */}
          <div className={styles.filmPanel} data-el="filmpanel">
            <span><b>840 m²</b><i>six rooms, one shot</i></span>
            <span><b>Scroll-driven</b><i>the camera walks with you</i></span>
            <span><b>Website · 3D · Automation</b><i>concept build by Kivotra</i></span>
          </div>
          {/* in-world: the CTA is an illuminated plate by the water */}
          <div className={styles.filmCtaWrap} data-el="filmcta">
            <span className={styles.filmCta}>Book a similar project</span>
            <span className={styles.clickRing} data-el="click" />
            <span className={styles.leadOrbBirth} data-el="sent">Enquiry received ✓</span>
          </div>
        </div>
        <div className={styles.cursor} data-el="cursor">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" stroke="#0a0c0e" strokeWidth="1.4">
            <path d="M5 3l14 8-6.5 1.5L9 19z" />
          </svg>
        </div>
      </div>

      {/* ---- scene 4: the system — a premium business machine powering on.
           The lead orb is absorbed by the core (boot), then a violet signal
           travels the fibre paths and activates all seven modules in order,
           returning to the core to close the circuit. ---- */}
      <div className={styles.orb} data-el="orb" aria-hidden="true"><span /></div>
      <div className={styles.system} data-el="system" aria-hidden="true">
        <span className={styles.sysBoard} />
        <svg className={styles.sysPaths} viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid meet">
          {SYSTEM_SEGS.map((d, i) => (
            <g key={i}>
              <path className={styles.sysTrace} d={d} />
              <path className={styles.sysLit} data-lit={i} d={d} />
            </g>
          ))}
          <circle className={styles.sysPulse} data-el="pulse" r="5" cx="600" cy="470" />
        </svg>
        <div className={styles.sysCore} data-el="core">
          <svg className={styles.sysCoreRing} viewBox="0 0 200 200">
            <circle className={styles.sysCoreRingBase} cx="100" cy="100" r="92" />
            <circle className={styles.sysCoreRingLit} data-el="corering" cx="100" cy="100" r="92" />
          </svg>
          <span className={styles.sysCoreFace} />
          <i className={styles.sysCoreGlow} data-el="coreglow" />
          <span className={styles.sysCoreLabel}>Business core</span>
        </div>
        {WORKFLOW_STEPS.map((step, i) => (
          <div
            className={styles.sysMod}
            data-mod={i}
            key={step}
            style={{ "--mx": SYSTEM_MODS[i][0], "--my": SYSTEM_MODS[i][1] } as React.CSSProperties}
          >
            <i className={styles.sysModInner} data-modinner={i} />
            <svg className={styles.sysModRing} viewBox="0 0 40 40">
              <circle className={styles.sysModRingBase} cx="20" cy="20" r="15" />
              <circle className={styles.sysModRingLit} data-modring={i} cx="20" cy="20" r="15" />
            </svg>
            <span className={styles.sysModNo}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.sysModLabel}>{step}</span>
            <i className={styles.sysModStatus} data-modstatus={i} />
          </div>
        ))}
      </div>

      {/* ---- scene 5: the command centre ---- */}
      <div className={styles.dash} data-el="dash" aria-hidden="true">
        <div className={styles.dashHead}>
          <span className={styles.dashBrand}><i className={styles.liveDot} />Kivotra — Today</span>
          <span className={styles.dashDate}>Tue 28 Jul</span>
        </div>
        <div className={styles.dashGrid}>
          <div className={styles.statCard} data-card>
            <span className={styles.statLabel}>Website visits</span>
            <span className={styles.statValue} data-count="1284">0</span>
            <span className={styles.statDelta}>↑ 12% vs last week</span>
          </div>
          <div className={styles.statCard} data-card>
            <span className={styles.statLabel}>New enquiries</span>
            <span className={styles.statValue} data-count="37">0</span>
            <span className={styles.statDelta}>every one answered</span>
          </div>
          <div className={styles.statCard} data-card>
            <span className={styles.statLabel}>Appointments booked</span>
            <span className={styles.statValue} data-count="28">0</span>
            <span className={styles.statDelta}>9 by the AI receptionist</span>
          </div>
          <div className={styles.statCard} data-card>
            <span className={styles.statLabel}>Follow-ups sent</span>
            <span className={styles.statValue} data-count="112">0</span>
            <span className={styles.statDelta}>0 written by hand</span>
          </div>

          <div className={`${styles.chartCard}`} data-card>
            <span className={styles.statLabel}>Enquiries — last 30 days</span>
            <svg className={styles.chart} viewBox="0 0 300 96" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#57e6da" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#57e6da" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                data-el="chartfill"
                d="M0,78 C30,70 48,52 76,56 C110,61 128,34 160,40 C196,47 214,22 250,26 L300,20 L300,96 L0,96 Z"
                fill="url(#cfill)"
              />
              <path
                data-el="chartline"
                d="M0,78 C30,70 48,52 76,56 C110,61 128,34 160,40 C196,47 214,22 250,26 L300,20"
                fill="none"
                stroke="#57e6da"
                strokeWidth="2"
                pathLength={1}
                strokeDasharray={1}
              />
            </svg>
          </div>

          <div className={styles.listCard} data-card>
            <span className={styles.statLabel}>Happening now</span>
            <div className={styles.listRow} data-row><i />Call answered — appointment offered</div>
            <div className={styles.listRow} data-row><i />New enquiry from the website</div>
            <div className={styles.listRow} data-row><i />Reminder sent for Thursday 2:30</div>
            <div className={styles.listRow} data-row><i />Review request delivered</div>
          </div>
        </div>
      </div>

      {/* ---- scene 6: the work — a curated exhibition, one project at a time ---- */}
      <div className={styles.devices} data-el="devices" aria-hidden="true">
        <div className={styles.devTrack} data-el="devtrack">
          {/* EDITORIAL LABEL COLUMN */}
          <div className={styles.projIndex}>
            <div className={styles.projMeta} data-proj="a">
              <span className={styles.projNo}>PROJECT 01</span>
              <span className={styles.projName}>Aurelia Dental</span>
              <span className={styles.projField}>Private healthcare</span>
              <span className={styles.projServices}>Website · Booking · Automation</span>
              <span className={styles.projNote}>Dr. Elena Marsh — cosmetic lead. 214 verified reviews. Same-day consultations.</span>
            </div>
            <div className={styles.projMeta} data-proj="b">
              <span className={styles.projNo}>PROJECT 02</span>
              <span className={styles.projName}>Veyra Estates</span>
              <span className={styles.projField}>Luxury real estate</span>
              <span className={styles.projServices}>Website · 3D walkthrough · Viewings</span>
              <span className={styles.projNote}>Cliffside residence — a scroll-driven 3D walkthrough. Every room, before the viewing.</span>
            </div>
            <div className={styles.projMeta} data-proj="c">
              <span className={styles.projNo}>PROJECT 03</span>
              <span className={styles.projName}>Olive &amp; Ash</span>
              <span className={styles.projField}>Hospitality</span>
              <span className={styles.projServices}>Website · Reservations · Guest follow-up</span>
              <span className={styles.projNote}>Chef Nora Quinn. Seasonal menu, private dining for twelve, Tue–Sun.</span>
            </div>
          </div>

          {/* DESKTOP */}
          <div className={`${styles.device} ${styles.devDesktop}`} data-el="dev-desktop">
            <div className={styles.devScreen}>
              {/* Aurelia home */}
              <div className={`${styles.projLayer} ${styles.aurelia}`} data-proj="a">
                <div className={styles.pNav}><span className={styles.pBrand}>Aurelia Dental</span><span className={styles.pNavLinks}>Treatments · Cosmetic · Team · Fees</span><span className={styles.pNavCta}>Book</span></div>
                <div className={styles.pHero}>
                  <div>
                    <span className={styles.pEyebrow}>Private dentistry · Same-day</span>
                    <span className={styles.pHeadline}>Confidence, engineered.</span>
                    <span className={styles.pSub}>Modern dentistry designed around your comfort and time.</span>
                    <span className={styles.pCta}>Book an appointment</span>
                    <span className={styles.pTrust}>4.9 ★★★★★ · 214 reviews</span>
                  </div>
                  <div className={styles.pVisual}><span className={styles.siteImageArch} /></div>
                </div>
              </div>
              {/* Veyra home */}
              <div className={`${styles.projLayer} ${styles.veyra}`} data-proj="b">
                <div className={styles.pNav}><span className={styles.pBrand}>VEYRA</span><span className={styles.pNavLinks}>Residences · Walkthrough · Viewings · Contact</span><span className={styles.pNavCta}>Enquire</span></div>
                <div className={styles.pHero}>
                  <div>
                    <span className={styles.pEyebrow}>Luxury real estate · 3D walkthrough</span>
                    <span className={styles.pHeadline}>Step inside.<br />Before you arrive.</span>
                    <span className={styles.pSub}>Scroll through every room of the residence — from anywhere.</span>
                    <span className={styles.pCta}>Begin the walkthrough</span>
                    <span className={styles.pTrust}>Private viewings · By appointment</span>
                  </div>
                  <div className={styles.pVisual} />
                </div>
              </div>
              {/* Olive home */}
              <div className={`${styles.projLayer} ${styles.olive}`} data-proj="c">
                <div className={styles.pNav}><span className={styles.pBrand}>Olive &amp; Ash</span><span className={styles.pNavLinks}>Menu · Reservations · Private dining</span><span className={styles.pNavCta}>Reserve</span></div>
                <div className={styles.pHero}>
                  <div>
                    <span className={styles.pEyebrow}>Seasonal dining · Dublin</span>
                    <span className={styles.pHeadline}>A table worth talking about.</span>
                    <span className={styles.pSub}>Season-led food, considered cocktails, warm hospitality.</span>
                    <span className={styles.pCta}>Reserve a table</span>
                    <span className={styles.pTrust}>Tue–Sun · Dinner from 5 PM</span>
                  </div>
                  <div className={styles.pVisual}><span className={styles.pPlate} /></div>
                </div>
              </div>
            </div>
            <span className={styles.devLabel} data-proj-label>Concept build</span>
          </div>

          {/* PHONE */}
          <div className={`${styles.device} ${styles.devPhone}`} data-el="dev-phone">
            <div className={styles.devScreen}>
              {/* Aurelia booking */}
              <div className={`${styles.projLayer} ${styles.aurelia}`} data-proj="a">
                <span className={styles.pBrand}>Aurelia</span>
                <span className={styles.pTitleSm}>Book your visit</span>
                <div className={styles.pSlots}><span className={styles.pSlotOn}>14:30</span><span>15:15</span><span>16:00</span></div>
                <span className={styles.pCta}>Confirm</span>
                <span className={styles.pConfirm}>✓ Confirmed — Today 14:30</span>
              </div>
              {/* Veyra viewing */}
              <div className={`${styles.projLayer} ${styles.veyra}`} data-proj="b">
                <span className={styles.pBrand}>VEYRA</span>
                <span className={styles.pTitleSm}>Book a private viewing</span>
                <div className={styles.pField}>Cliffside Residence</div>
                <div className={styles.pField}>Sat · 11:00</div>
                <span className={styles.pCta}>Request viewing</span>
                <span className={styles.pConfirm}>✓ Confirmed — Sat 11:00</span>
              </div>
              {/* Olive reservation */}
              <div className={`${styles.projLayer} ${styles.olive}`} data-proj="c">
                <span className={styles.pBrand}>Olive &amp; Ash</span>
                <span className={styles.pTitleSm}>Reserve</span>
                <div className={styles.pSlots}><span>18:00</span><span className={styles.pSlotOn}>19:30</span><span>21:00</span></div>
                <span className={styles.pCta}>Reserve · 2 guests</span>
                <span className={styles.pConfirm}>✓ Table held 15 min</span>
              </div>
            </div>
            <span className={styles.devLabel} data-proj-label>Concept build</span>
          </div>
        </div>

        {/* project identity captions, cycled with the screens */}
        <div className={styles.projCaptions}>
          <span className={styles.projCaption} data-proj="a">Aurelia Dental — private clinic · concept build</span>
          <span className={styles.projCaption} data-proj="b">Veyra Estates — luxury real estate · concept build</span>
          <span className={styles.projCaption} data-proj="c">Olive &amp; Ash — restaurant · concept build</span>
        </div>
      </div>
    </div>
  );
}
