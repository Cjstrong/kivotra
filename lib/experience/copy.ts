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

/** Hero film: rim-lit K at landing → the reveal → statement → pass-through. */
export const FILM_LINES: FilmLine[] = [
  {
    id: "ch01-noise",
    text: "Most businesses disappear into the noise.",
    role: "line",
    window: [0.03, 0.08, 0.18, 0.24],
  },
  {
    id: "ch02-hero",
    text: "Built to stand apart.",
    role: "hero",
    window: [0.36, 0.43, 0.56, 0.63],
  },
  {
    id: "ch02-support",
    text: "We engineer software, systems and digital experiences\nfor businesses that refuse to blend in.",
    role: "support",
    window: [0.66, 0.71, 0.79, 0.84],
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
