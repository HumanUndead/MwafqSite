export const ABOUT_CONTENT_ROOT_CATEGORY_ID = 146;
export const ABOUT_CONTENT_REVALIDATE_SECONDS = 60 * 10;
export const ABOUT_CONTENT_CACHE_TAG = `about-content-${ABOUT_CONTENT_ROOT_CATEGORY_ID}`;

export const ABOUT_SECTION_RANKS = {
  hero: 1,
  story: 2,
  mv: 3,
  stats: 4,
  what: 5,
  why: 6,
  values: 7,
  how: 8,
  // Both milestones (id 155) and b2bSnippet (id 156) share rank 9.
  // sortByRank breaks ties by id, so index 0 = milestones, index 1 = b2bSnippet.
  rankWithMilestonesAndB2b: 9,
  finalCta: 10,
} as const;

// Hero articles (category rank 1):
//   rank 1 → headingTop (name), headingMidLead (extraInfo), headingMidAccent (shortDescription)
//   rank 2 → leadLabel (name), lead (shortDescription)
export const ABOUT_HERO_ARTICLE_RANKS = {
  heading: 1,
  lead: 2,
} as const;

// Mission/Vision articles (category rank 3):
//   rank 1 → mission: label (name), headline (extraInfo), body (shortDescription)
//   rank 2 → vision:  label (name), headline (extraInfo), body (shortDescription)
export const ABOUT_MV_ARTICLE_RANKS = {
  mission: 1,
  vision: 2,
} as const;

// Stats (category rank 4):
//   CMS provides only the label (name field). Value & suffix are static.
//   CMS article ranks are 2–5; rank 1 is absent.
export const ABOUT_STATS_CONFIG = [
  { rank: 5, value: 50000, suffix: 'K+' }, // Completed Exams
  { rank: 2, value: 100, suffix: '+' }, // Clinics & Labs
  { rank: 3, value: 10, suffix: '+' }, // Certified Partners
  { rank: 4, value: 500, suffix: '+' }, // Corporate Users
] as const;

// What we do (category rank 5):
//   rank 1 → eyebrow (name), titleLead (extraInfo)
//   rank 2+ → items: title (name), body (shortDescription)
export const ABOUT_WHAT_ARTICLE_RANKS = {
  header: 1,
} as const;

// Why Mwafq (category rank 6):
//   rank 1 → eyebrow (name)
//   rank 2 → titleLead (name), titleAccent (extraInfo), body (shortDescription)
//   rank 3+ → items: title (name), body (shortDescription)
export const ABOUT_WHY_ARTICLE_RANKS = {
  eyebrow: 1,
  content: 2,
} as const;

// Values (category rank 7, published: false in CMS — still included):
//   rank 1 → eyebrow (name)
//   rank 2+ → items: title (name), body (shortDescription)
export const ABOUT_VALUES_ARTICLE_RANKS = {
  header: 1,
} as const;

// How it works (category rank 8):
//   rank 1 → eyebrow (name), titleLead (extraInfo)
//   rank 2+ → items: title (name), body (shortDescription)
export const ABOUT_HOW_ARTICLE_RANKS = {
  header: 1,
} as const;

// Milestones (rank-9 category, index 0 after sort by id):
//   rank 1 → eyebrow (name), titleLead (extraInfo)
//   rank 2+ → items: title (name), body (shortDescription)
//   Years are static — CMS does not store them.
export const ABOUT_MILESTONES_ARTICLE_RANKS = {
  header: 1,
} as const;

export const ABOUT_MILESTONE_YEARS = ['2023', '2024', '2025', '2026'] as const;

// B2B snippet (rank-9 category, index 1 after sort by id):
//   rank 1 → eyebrow (name), titleLead (extraInfo), titleAccent (shortDescription)
//   rank 2 → body (name), cta (extraInfo)
//   rank 3+ → points: each article's name is a bullet point
export const ABOUT_B2B_ARTICLE_RANKS = {
  header: 1,
  content: 2,
} as const;
