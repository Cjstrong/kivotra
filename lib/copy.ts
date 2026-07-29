// All homepage copy. Written for busy business owners. One headline, one
// supporting line, one CTA per scene. No jargon.

export const NAV = {
  links: [
    { label: "Websites", href: "#website" },
    { label: "Automation", href: "#automation" },
    { label: "Industries", href: "#industries" },
    { label: "Work", href: "#work" },
  ],
  cta: "Book a Call",
};

/** Scene copy, keyed to the master timeline stages. */
export const SCENES = {
  arrival: {
    headline: ["Websites that", "win attention."],
    sub: "AI systems that run the business. Built for companies that refuse to look average.",
    primary: "Book a Call",
    secondary: "See the Work",
  },
  website: {
    headline: "Your website should do more than look good.",
    sub: "It should attract attention, build trust and turn visitors into enquiries.",
  },
  interaction: {
    headline: "Attention becomes action.",
  },
  lead: {
    headline: ["Every enquiry handled.", "Every follow-up sent."],
    sub: "Kivotra builds the systems that keep opportunities moving.",
  },
  automation: {
    headline: ["The work keeps moving.", "Even when you are not."],
  },
  control: {
    headline: "One clear view of everything that matters.",
    sub: "Your website, leads and workflows — connected.",
  },
  industries: {
    headline: "Built around your business.",
  },
  showcase: {
    headline: ["Built to be remembered.", "Designed to convert."],
    cta: "View Website Projects",
  },
  proof: {
    headline: "Slow website in. Booked job out.",
    label: "Illustrative Kivotra workflow",
  },
  cta: {
    headline: ["The future of local business."],
    sub: "Beautiful websites attract customers. Automation turns them into revenue.",
    primary: "Book a Call",
    secondary: "See Our Services",
  },
} as const;

/** Pipeline stations — the lead visits each, in order. */
export const WORKFLOW_STEPS = [
  "AI Receptionist",
  "CRM",
  "Follow-up",
  "Booking",
  "Invoice",
  "Review",
  "Revenue",
];

/** Automation events — the living system in scene 5. */
export const AUTOMATION_EVENTS = [
  "Missed call answered by AI",
  "Enquiry replied to instantly",
  "Lead added to CRM",
  "Appointment booked",
  "Reminder sent",
  "Quote follow-up triggered",
  "Invoice reminder delivered",
  "Review request sent",
  "Task assigned to staff",
];

/** Command centre tiles — owner-facing numbers only. */
export const COMMAND_TILES = [
  { label: "Website visits", value: "1,284" },
  { label: "New enquiries", value: "37" },
  { label: "Lead conversion", value: "42%" },
  { label: "Automations run", value: "612" },
  { label: "Appointments booked", value: "28" },
  { label: "Follow-ups due", value: "5" },
];

/** Industry variants — same command centre, different content. */
export const INDUSTRIES = [
  {
    key: "restaurant",
    label: "Restaurant",
    rows: ["New reservation", "Missed call answered", "Review request sent", "Menu enquiry handled"],
  },
  {
    key: "gym",
    label: "Gym",
    rows: ["Trial lead captured", "Consultation booked", "Follow-up sequence started", "Membership enquiry answered"],
  },
  {
    key: "clinic",
    label: "Clinic",
    rows: ["Patient enquiry", "Appointment scheduled", "Reminder delivered", "Intake form completed"],
  },
  {
    key: "trades",
    label: "Trades",
    rows: ["Quote request", "Lead qualified", "Job booked", "Follow-up sent"],
  },
  {
    key: "salon",
    label: "Salon",
    rows: ["Booking request", "Cancellation slot filled", "Reminder sent", "Review requested"],
  },
  {
    key: "estate",
    label: "Estate agency",
    rows: ["Property enquiry", "Viewing booked", "Lead assigned", "Follow-up automated"],
  },
];

/** Showcase concept builds. Clearly labelled — no fabricated clients. */
export const SHOWCASE = [
  { key: "restaurant", name: "Restaurant", note: "Concept build" },
  { key: "clinic", name: "Clinic", note: "Concept build" },
  { key: "trades", name: "Trades", note: "Concept build" },
  { key: "property", name: "Property", note: "Concept build" },
];

export const PROOF = {
  before: ["Slow website", "Missed enquiries", "Manual follow-up"],
  after: ["Fast website", "Every enquiry captured", "Follow-up automated"],
  testimonial: "Client testimonial will appear here once our first projects complete.",
  caseStudy: "Case study placeholder — real numbers, published when we have them.",
};

export const FOOTER = {
  tagline: "Websites and automation for modern businesses.",
};
