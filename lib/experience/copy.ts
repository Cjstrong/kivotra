/**
 * Every narrative line on the site, chapter-keyed. Single source of truth
 * for both the film's TextLayer and the static edition.
 *
 * Windows are film-progress values [fadeInStart, holdStart, holdEnd, fadeOutEnd].
 * Build rule: no two windows within the film may overlap.
 */

export type TextWindow = [number, number, number, number];

export interface FilmLine {
  id: string;
  text: string;
  /** visual role → maps to a TextLayer style */
  role: "line" | "hero" | "support";
  window: TextWindow;
}

/** Prototype film: Chapter 01 (Signal) → Chapter 02 (Formation) → pass-through. */
export const FILM_LINES: FilmLine[] = [
  {
    id: "ch01-noise",
    text: "Most businesses disappear into the noise.",
    role: "line",
    window: [0.05, 0.1, 0.22, 0.28],
  },
  {
    id: "ch02-hero",
    text: "Built to stand apart.",
    role: "hero",
    window: [0.46, 0.52, 0.62, 0.68],
  },
  {
    id: "ch02-support",
    text: "We engineer software, systems and digital experiences\nfor businesses that refuse to blend in.",
    role: "support",
    window: [0.69, 0.74, 0.82, 0.87],
  },
];

export const BRAND = {
  name: "Kivotra",
  statement: "Built to stand apart.",
  support:
    "We engineer software, systems and digital experiences for businesses that refuse to blend in.",
  ctaPrimary: "Start a project",
  ctaSecondary: "Explore our work",
};

export const CAPABILITIES = [
  "Custom business software",
  "SaaS platforms",
  "Customer & employee portals",
  "Dashboards & internal tools",
  "Workflow automation",
  "System integrations",
  "Premium websites",
  "Interactive digital experiences",
  "Ongoing technical development",
];

export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Contact", href: "#contact" },
];
