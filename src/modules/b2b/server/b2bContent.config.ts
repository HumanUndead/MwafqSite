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
//   rank 3+ → items: title (name), body (shortDescription)
export const B2B_SERVICES_ARTICLE_RANKS = {
  header: 1,
  body: 2,
} as const;

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

// Business section (category 169 — formerly part of home, now owned by b2b):
//   rank 1      → header: eyebrow (shortDescription), title (name), accent (extraInfo), body (description)
//   ranks 10–49 → bullet points (name)
//   rank 50     → primary CTA (name / path)
//   rank 60     → secondary CTA (name / path)
//   child tabs category     → tabs article rank 1: name / shortDescription / extraInfo
//   child metrics category  → metric articles: value (name), label (description)
//   child employees category → employee articles: name (name), exam (description), status (shortDescription)
export const B2B_BUSINESS_CATEGORY_ID = 169;

export const B2B_BUSINESS_CHILD_CATEGORY_IDS = {
  tabs: 175,
  metrics: 181,
  employees: 186,
} as const;

export const B2B_BUSINESS_ARTICLE_RANKS = {
  header: 1,
  pointStart: 10,
  primaryAction: 50,
  secondaryAction: 60,
} as const;
