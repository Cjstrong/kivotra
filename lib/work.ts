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
      "Twenty years of flawless work, invisible outside its own client list. Googling the founder returned a directory listing.",
    solution:
      "Founder positioning, one national editorial feature — paid placement, disclosed — and a distributed press record for every milestone.",
    result: "Page one for the founder's name is now their own story. Concept build.",
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
      "Patients chose the clinic on trust alone — and every proof point lived in a waiting-room folder.",
    solution:
      "Executive positioning for the lead clinician, authority pages for the practice, and one editorial feature — paid placement, disclosed.",
    result: "The first thing patients find is the clinician, in their own words. Concept build.",
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
      "Exceptional buildings, anonymous partners. The studio's name carried no story of its own.",
    solution:
      "Founder positioning for both partners, a distributed press record, and one national feature — paid placement, disclosed.",
    result: "The work now has named authors. Concept build.",
    plate: "/film/work-arla.png",
    accent: "#8b87c6",
    note: "Concept build",
    href: "#",
  },
];
