/**
 * Selected work — placeholder concept builds, clearly labelled.
 * Structured for drop-in replacement by real case studies later:
 * swap the entries, keep the shape.
 */

export interface CaseStudy {
  key: string;
  name: string;
  industry: string;
  challenge: string;
  solution: string;
  result: string;
  /** background plate in /public/film/ */
  plate: string;
  /** accent hue for the panel's atmosphere */
  accent: string;
  note: string;
  href: string;
}

export const WORK: CaseStudy[] = [
  {
    key: "meridian",
    name: "Meridian Logistics",
    industry: "Freight & logistics",
    challenge:
      "Dispatch, tracking and invoicing lived in four disconnected tools, reconciled by hand every week.",
    solution:
      "One operations platform: live job board, driver portal, automated invoicing and a single source of record.",
    result: "Weekly reconciliation reduced to zero. Concept build.",
    plate: "/film/work-meridian.png",
    accent: "#9bb8d4",
    note: "Concept build",
    href: "#",
  },
  {
    key: "halewood",
    name: "Halewood Clinics",
    industry: "Private healthcare",
    challenge:
      "Patients booked by phone; records, referrals and follow-ups moved through inboxes.",
    solution:
      "A patient portal with scheduling, intake and secure messaging, integrated with the clinic's existing record system.",
    result: "Front-desk call volume cut by half. Concept build.",
    plate: "/film/work-halewood.png",
    accent: "#c4cdd8",
    note: "Concept build",
    href: "#",
  },
  {
    key: "arla-frost",
    name: "Arla & Frost",
    industry: "Architecture studio",
    challenge:
      "A portfolio indistinguishable from every other studio's template site.",
    solution:
      "An interactive experience where each project is presented as a navigable spatial environment.",
    result: "Average session length tripled. Concept build.",
    plate: "/film/work-arla.png",
    accent: "#8b87c6",
    note: "Concept build",
    href: "#",
  },
];
