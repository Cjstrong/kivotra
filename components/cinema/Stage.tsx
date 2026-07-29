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
      gsap.set("[data-el='cursor']", { autoAlpha: 0, x: 260, y: -140, scale: 1 });
      gsap.set("[data-el='click']", { autoAlpha: 0, scale: 0.4 });
      gsap.set("[data-el='sent']", { autoAlpha: 0, y: 8 });
      // The orb is born where the website's form sits, then glides to the rail.
      gsap.set(
        "[data-el='orb']",
        mobile
          ? { autoAlpha: 0, scale: 0.2, left: "50%", top: "-36px" }
          : { autoAlpha: 0, scale: 0.2, left: "31%", top: "96px" }
      );
      gsap.set(qa("[data-chip]"), { autoAlpha: 0, y: 40 });
      gsap.set(qa("[data-chipglow]"), { autoAlpha: 0 });
      gsap.set(
        "[data-el='rail']",
        mobile
          ? { scaleX: 1, scaleY: 0, transformOrigin: "center top" }
          : { scaleX: 0, scaleY: 1, transformOrigin: "left center" }
      );
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

      /* SCENE 3 — the interaction. Cursor → CTA → submitted → lead born. */
      copyOut(2, 27.5);
      copyIn(3, 30.5);
      tl.to("[data-el='cursor']", { autoAlpha: 1, duration: 1 }, 28);
      tl.to("[data-el='cursor']", { x: 0, y: 0, duration: 3.4, ease: "power2.inOut" }, 28.6);
      tl.to("[data-el='cursor']", { scale: 0.82, duration: 0.5, ease: "power2.in" }, 32.2);
      tl.to("[data-el='cursor']", { scale: 1, duration: 0.6, ease: "power2.out" }, 32.7);
      tl.to("[data-el='click']", { autoAlpha: 0.9, scale: 1.7, duration: 1.2, ease: "power2.out" }, 32.4);
      tl.to("[data-el='click']", { autoAlpha: 0, duration: 0.8 }, 33.6);
      tl.to("[data-el='sent']", { autoAlpha: 1, y: 0, duration: 1.4, ease: "power3.out" }, 33.4);
      tl.to("[data-el='orb']", { autoAlpha: 1, scale: 1, duration: 2, ease: "back.out(2)" }, 34.2);
      tl.to("[data-el='cursor']", { autoAlpha: 0, duration: 1 }, 34.4);

      /* SCENE 4 — the site leaves; the lead travels the pipeline. */
      copyOut(3, 38);
      tl.to("[data-el='site']", { autoAlpha: 0, y: -70, scale: 0.96, duration: 4.5, ease: "power3.in" }, 39);
      tl.to("[data-el='sent']", { autoAlpha: 0, duration: 1.5 }, 39);
      tl.to(chan, { kParked: 1, duration: 5, ease: "power2.inOut" }, 39.5);
      // the orb glides from the form to the start of the rail —
      // horizontal pipeline on desktop, a descending column on mobile
      if (mobile) {
        tl.to("[data-el='orb']", { left: "50%", top: "0%", duration: 5, ease: "power2.inOut" }, 41);
        tl.to("[data-el='rail']", { scaleY: 1, duration: 6, ease: "power2.inOut" }, 43);
      } else {
        tl.to("[data-el='orb']", { left: "0%", top: "50%", duration: 5, ease: "power2.inOut" }, 41);
        tl.to("[data-el='rail']", { scaleX: 1, duration: 6, ease: "power2.inOut" }, 43);
      }
      tl.to(qa("[data-chip]"), { autoAlpha: 1, y: 0, duration: 2.6, stagger: 0.55, ease: "power3.out" }, 43.5);
      copyIn(4, 44);

      // station-to-station travel: move → seat → station lights
      const chips = qa("[data-chip]");
      const n = chips.length;
      chips.forEach((_, i) => {
        const at = 47 + i * 1.75;
        tl.to(
          "[data-el='orb']",
          mobile
            ? { top: `${(i / (n - 1)) * 100}%`, duration: 1.15, ease: "power2.inOut" }
            : { left: `${(i / (n - 1)) * 100}%`, duration: 1.15, ease: "power2.inOut" },
          at
        );
        tl.to(`[data-chipglow='${i}']`, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, at + 0.95);
      });

      /* SCENE 5 — everything folds into the command centre. */
      copyOut(4, 60);
      tl.to(qa("[data-chip]"), { autoAlpha: 0, y: -28, duration: 2.2, stagger: 0.18, ease: "power3.in" }, 61);
      tl.to("[data-el='rail']", { autoAlpha: 0, duration: 2.4, ease: "power3.in" }, 61.5);
      tl.to("[data-el='orb']", { autoAlpha: 0, scale: 0.2, duration: 2, ease: "power2.in" }, 63);
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
      // the same devices re-dress for each project: Aurelia → Forge → Olive
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

      {/* ---- scene 2/3: the website, inside the K's frame ---- */}
      <div className={styles.site} data-el="site" aria-hidden="true">
        <div className={styles.browser}>
          <div className={styles.browserBar}>
            <span className={styles.winDot} /><span className={styles.winDot} /><span className={styles.winDot} />
            <span className={styles.urlPill}>
              <svg width="9" height="10" viewBox="0 0 10 12" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="5" width="8" height="6" rx="1.5"/><path d="M3 5V3.5a2 2 0 014 0V5"/></svg>
              aurelia-dental.co.uk
            </span>
          </div>
          <div className={`${styles.siteBody} ${styles.aurelia}`}>
            <div className={styles.siteNav}>
              <span className={styles.siteLogo}>Aurelia Dental</span>
              <span className={styles.siteLinks}><i>Treatments</i><i>Cosmetic</i><i>Team</i><i>Fees</i><i>Contact</i></span>
              <span className={styles.siteNavCta}>Book online</span>
            </div>
            <div className={styles.siteHero}>
              <div className={styles.siteHeroCopy}>
                <span className={styles.siteEyebrow}>Private dentistry · Same-day appointments</span>
                <h3>Confidence, engineered.</h3>
                <p>Modern dentistry designed around your comfort, time and long-term health.</p>
                <div className={styles.siteCtaRow}>
                  <div className={styles.siteCtaWrap}>
                    <span className={styles.siteCta}>Book an appointment</span>
                    <span className={styles.clickRing} data-el="click" />
                    <span className={styles.leadOrbBirth} data-el="sent">Enquiry received ✓</span>
                  </div>
                  <span className={styles.siteGhostCta}>Explore treatments</span>
                </div>
                <span className={styles.siteTrust}><b>4.9</b> ★★★★★ · 214 verified patient reviews</span>
              </div>
              <div className={styles.siteVisual}>
                <div className={styles.siteImage}>
                  <span className={styles.siteImageArch} />
                  <span className={styles.siteImageGlow} />
                </div>
                <div className={styles.availCard}>
                  <span className={styles.availTitle}>Next available</span>
                  <span className={styles.availSlot}>Today · 14:30</span>
                  <span className={styles.availSlot}>Today · 15:15</span>
                  <span className={`${styles.availSlot} ${styles.availDim}`}>Tue · 09:00</span>
                </div>
              </div>
            </div>
            <div className={styles.siteStrip}>
              <span className={styles.stripItem}>Whitening</span>
              <span className={styles.stripItem}>Invisible aligners</span>
              <span className={styles.stripItem}>Implants</span>
              <span className={styles.stripReview}>“Painless, precise, on time.” — verified patient</span>
            </div>
          </div>
          <div className={styles.cursor} data-el="cursor">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" stroke="#0a0c0e" strokeWidth="1.4">
              <path d="M5 3l14 8-6.5 1.5L9 19z" />
            </svg>
          </div>
        </div>
        <div className={`${styles.phone} ${styles.aurelia}`}>
          <div className={styles.phoneNotch} />
          <span className={styles.phoneBrand}>Aurelia Dental</span>
          <div className={styles.phoneHero}><span className={styles.siteImageArch} /></div>
          <span className={styles.phoneTitle}>Book your visit</span>
          <div className={styles.phoneSlots}>
            <span className={styles.phoneSlotOn}>14:30</span>
            <span className={styles.phoneSlot}>15:15</span>
            <span className={styles.phoneSlot}>16:00</span>
          </div>
          <div className={styles.phoneCta}>Confirm — Today 14:30</div>
          <span className={styles.phoneConfirm}>✓ Reminder by text</span>
        </div>
      </div>

      {/* ---- scene 4: the pipeline ---- */}
      <div className={styles.pipeline} aria-hidden="true">
        <div className={styles.rail} data-el="rail" />
        <div className={styles.orb} data-el="orb"><span /></div>
        <div className={styles.chips}>
          {WORKFLOW_STEPS.map((step, i) => (
            <div className={styles.chip} data-chip={i} key={step} style={{ "--lift": `${[0, -16, 10, -12, 8, -14, 0][i]}px` } as React.CSSProperties}>
              <span className={styles.chipGlow} data-chipglow={i} />
              <span className={styles.chipNo}>{String(i + 1).padStart(2, "0")}</span>
              {step}
            </div>
          ))}
        </div>
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
              <span className={styles.projName}>Forge &amp; Sons</span>
              <span className={styles.projField}>Construction</span>
              <span className={styles.projServices}>Website · Quote system · CRM</span>
              <span className={styles.projNote}>Harcourt Rd extension, D06 — 84 m², 14 weeks. Survey → Build → Handover.</span>
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
              {/* Forge home */}
              <div className={`${styles.projLayer} ${styles.forge}`} data-proj="b">
                <div className={styles.pNav}><span className={styles.pBrand}>FORGE &amp; SONS</span><span className={styles.pNavLinks}>Projects · Services · Process · About</span><span className={styles.pNavCta}>Quote</span></div>
                <div className={styles.pHero}>
                  <div>
                    <span className={styles.pEyebrow}>Build · Renovate · Deliver</span>
                    <span className={styles.pHeadline}>Master builders.<br />Modern standards.</span>
                    <span className={styles.pSub}>Residential &amp; commercial projects delivered with discipline.</span>
                    <span className={styles.pCta}>Get a quote</span>
                    <span className={styles.pTrust}>25 yrs combined · Fully insured</span>
                  </div>
                  <div className={styles.pVisual}><span className={styles.pBeam} /><span className={styles.pBlock} /></div>
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
              {/* Forge quote */}
              <div className={`${styles.projLayer} ${styles.forge}`} data-proj="b">
                <span className={styles.pBrand}>FORGE</span>
                <span className={styles.pTitleSm}>Get a quote</span>
                <div className={styles.pField}>Extension</div>
                <div className={styles.pField}>D04 · Dublin</div>
                <span className={styles.pCta}>Send request</span>
                <span className={styles.pConfirm}>Reply within 4 hrs</span>
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
          <span className={styles.projCaption} data-proj="b">Forge &amp; Sons — construction · concept build</span>
          <span className={styles.projCaption} data-proj="c">Olive &amp; Ash — restaurant · concept build</span>
        </div>
      </div>
    </div>
  );
}
