import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';

export const HOME_CONTENT_API_BASE_URL = MWAFQ_API_BASE_URL;

export const HOME_CONTENT_ROOT_CATEGORY_ID = 159;
export const COMPANIES_CATEGORY_ID = 197;
export const STEPS_HEADING_PARENT_CATEGORY_ID = 210;
export const HOME_CONTENT_REVALIDATE_SECONDS = 1;
export const HOME_CONTENT_CACHE_TAG = `home-content-${HOME_CONTENT_ROOT_CATEGORY_ID}`;

export const HOME_SECTION_IDS = {
  hero: 161,
  services: 162,
  why: 163,
  booking: 164,
  steps: 165,
  app: 166,
  academy: 167,
  stats: 168,
  testimonial: 170,
} as const;

export const HERO_CHILD_CATEGORY_IDS = {
  words: 177,
  actions: 183,
  metrics: 188,
  phoneUi: 191,
  phoneTiles: 193,
  floatingCards: 194,
} as const;

export const BOOKING_CHILD_CATEGORY_IDS = {
  fields: 174,
  options: 180,
} as const;

export const STEPS_CHILD_CATEGORY_IDS = {
  first: 178,
  second: 184,
  third: 189,
} as const;

export const APP_CHILD_CATEGORY_IDS = {
  schedule: 173,
  status: 179,
  reports: 185,
  points: 190,
  links: 192,
} as const;

// These categories were removed from the home API tree but their mapping
// functions are kept for reuse in other areas (e.g. layout, dedicated pages).
export const HEADER_CATEGORY_ID = 160;
export const FINAL_CTA_CATEGORY_ID = 171;
export const FOOTER_CATEGORY_ID = 172;

export const FOOTER_CHILD_CATEGORY_IDS = {
  pages: 176,
  help: 182,
  contact: 187,
} as const;

export const HEADER_ARTICLE_RANKS = {
  brand: 1,
  primaryAction: 80,
  signInIndividual: 90,
  localeSwitch: 100,
  signInBusiness: 110,
} as const;

export const FINAL_CTA_ARTICLE_RANKS = {
  content: 1,
  primaryAction: 10,
  secondaryAction: 20,
} as const;

export const FOOTER_ARTICLE_RANKS = {
  brand: 1,
  newsletter: 2,
  copyright: 3,
} as const;

export const HERO_WORDS_ARTICLE_RANKS = {
  rotatingWords: 1,
  content: 2,
  statsHeading: 50,
} as const;

export const SERVICES_ARTICLE_RANKS = {
  header: 1,
} as const;

export const WHY_ARTICLE_RANKS = {
  header: 1,
} as const;

export const BOOKING_ARTICLE_RANKS = {
  header: 1,
} as const;

export const BOOKING_OPTIONS_ARTICLE_RANKS = {
  header: 1,
} as const;

export const STEPS_ARTICLE_RANKS = {
  header: 1,
  cta: 2,
} as const;

export const APP_ARTICLE_RANKS = {
  header: 1,
} as const;

// CMS data quirk: article 374 (the App section's title/eyebrow/body) is
// filed under the schedule child category (173) at rank 1, the same rank
// as the real schedule label article (375). Disambiguate by id.
export const APP_HEADER_FALLBACK_ARTICLE_ID = 374;
export const APP_SCHEDULE_LABEL_ARTICLE_ID = 375;

export const ACADEMY_ARTICLE_RANKS = {
  header: 1,
  cta: 2,
} as const;

export const STATS_ARTICLE_RANKS = {
  header: 1,
} as const;

export const TESTIMONIAL_ARTICLE_RANKS = {
  content: 1,
} as const;
