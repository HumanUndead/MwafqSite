import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';

export const B2B_CONTENT_API_BASE_URL = MWAFQ_API_BASE_URL;
export const B2B_CONTENT_ROOT_CATEGORY_ID = 140;
export const B2B_COMPANIES_CATEGORY_ID = 197;
export const B2B_CONTENT_REVALIDATE_SECONDS = 60 * 10;
export const B2B_CONTENT_CACHE_TAG = `b2b-content-${B2B_CONTENT_ROOT_CATEGORY_ID}`;

export const B2B_SECTION_RANKS = {
  hero: 1,
  why: 2,
  services: 3,
  steps: 4,
  finalCta: 6,
} as const;

// Article added later in the CMS (hero category, rank 55) that overrides
// the hero eyebrow/heading/lead: name -> eyebrow, extraInfo -> heading,
// shortDescription -> lead.
export const B2B_HERO_OVERRIDE_ARTICLE_ID = 535;

// Hero articles (in category rank 1):
//   rank 1  → eyebrow (description field contains HTML — strip tags)
//   rank 2  → headingLead (name) / headingAccent (extraInfo, linked)
//   rank 3  → lead (name)
//   rank 4  → primaryCta (name)
//   rank 5  → secondaryCta (name)
//   rank 6  → phone.greeting (name)
//   rank 7  → phone.name (name)
//   rank 8  → phone.bulkTitle (name) / phone.bulkSubtitle (extraInfo)
//   rank 9  → phone.sectionTitle (name)
//   ranks 10–13 → employees
//   ranks 14+   → floatingCards
export const B2B_HERO_ARTICLE_RANKS = {
  eyebrow: 1,
  heading: 2,
  lead: 3,
  primaryCta: 4,
  secondaryCta: 5,
  phoneGreeting: 6,
  phoneName: 7,
  phoneBulk: 8,
  phoneSectionTitle: 9,
  employeeStart: 10,
  employeeEnd: 13,
  floatingCardStart: 14,
} as const;

// Why articles (in category rank 2):
//   rank 1 → header: titleLead (name), titleAccent (extraInfo)
//   rank 2+ → items: title (name), body (shortDescription)
export const B2B_WHY_ARTICLE_RANKS = {
  header: 1,
} as const;

// Services articles (in category rank 3):
//   rank 1 → header: titleLead (name), titleAccent (extraInfo)
//   rank 2 → body (name)
//   ranks 3/4/6 → older thin placeholder items, no longer used
//   ranks 123/323/3211 → current products (ids 536/538/537), selected by id
export const B2B_SERVICES_ARTICLE_RANKS = {
  header: 1,
  body: 2,
} as const;

// Current product articles, in display order — matches the 3 hand-written
// fallback items in en.ts/ar.ts (Medical Examinations, Occupational Health,
// Academy Training).
export const B2B_SERVICES_PRODUCT_ARTICLE_IDS = [536, 538, 537] as const;

// Steps articles (in category rank 4):
//   rank 1 → header: titleLead (name), titleAccent (shortDescription, linked)
//   rank 2+ → items: title (name), body (shortDescription)
export const B2B_STEPS_ARTICLE_RANKS = {
  header: 1,
} as const;

// FinalCta articles (in category rank 6):
//   CMS stores two articles at rank 2 (ids 325, 326) — use index-based access.
//   index 0 → content: titleLead (name), titleAccent (extraInfo), body (shortDescription)
//   index 1 → primary CTA (name)
//   index 2 → secondary CTA (name)

// Business section (category 169 — formerly part of home, now owned by b2b).
// Articles are flat under the category and ranks overlap across piece types,
// so each piece is referenced by explicit article id (not rank).
//   header           → eyebrow (shortDescription), title (name), accent (extraInfo), body (description)
//   tabs             → name / shortDescription / extraInfo (one article, three tab labels)
//   points           → bullet points (name)
//   metrics          → value (name), label (description)
//   employees        → name (name), exam (description), status (shortDescription)
//   primaryAction    → name / path
//   secondaryAction  → name / path
export const B2B_BUSINESS_CATEGORY_ID = 169;

export const B2B_BUSINESS_ARTICLE_IDS = {
  header: 396,
  tabs: 409,
  points: [397, 398, 399, 400],
  metrics: [406, 407, 408],
  employees: [403, 404, 405],
  primaryAction: 401,
  secondaryAction: 402,
} as const;

// Journey section (category 216, "journey" — direct child of root 140).
// 5 stage articles; CMS ranks are not sequential, so display order is fixed
// by explicit article id: name -> title, extraInfo -> body.
export const B2B_JOURNEY_CATEGORY_ID = 216;

export const B2B_JOURNEY_STAGE_ARTICLE_IDS = [
  539, // Registration & Governance
  540, // Set Up the Organizational Structure
  541, // Booking & Service Issuance
  542, // Real-Time Tracking & Control
  543, // Scale with Confidence
] as const;

// FAQ section (category 217, "faq" — direct child of root 140).
// 3 question articles; CMS ranks are not sequential, so display order is
// fixed by explicit article id: name -> question, shortDescription -> answer.
export const B2B_FAQ_CATEGORY_ID = 217;

export const B2B_FAQ_ARTICLE_IDS = [
  544, // How to Register
  545, // Payment Method
  546, // How to Receive Results
] as const;
