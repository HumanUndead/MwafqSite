const DEFAULT_HOME_CONTENT_API_BASE_URL = 'https://productionapi.mwafq.com'
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config'

export const HOME_CONTENT_API_BASE_URL = MWAFQ_API_BASE_URL

export const HOME_CONTENT_ROOT_CATEGORY_ID = 101
export const HOME_CONTENT_REVALIDATE_SECONDS = 60 * 10
export const HOME_CONTENT_CACHE_TAG = `home-content-${HOME_CONTENT_ROOT_CATEGORY_ID}`

export const HOME_SECTION_RANKS = {
  header: 10,
  hero: 20,
  services: 30,
  why: 40,
  booking: 50,
  steps: 60,
  app: 70,
  academy: 80,
  stats: 90,
  business: 100,
  testimonial: 110,
  finalCta: 120,
  footer: 130,
} as const

export const HERO_CHILD_CATEGORY_RANKS = {
  words: 10,
  actions: 20,
  metrics: 30,
  phoneUi: 40,
  phoneTiles: 50,
  floatingCards: 60,
} as const

export const BOOKING_CHILD_CATEGORY_RANKS = {
  fields: 10,
  options: 20,
} as const

export const STEPS_CHILD_CATEGORY_RANKS = {
  first: 10,
  second: 20,
  third: 30,
} as const

export const APP_CHILD_CATEGORY_RANKS = {
  schedule: 10,
  status: 20,
  reports: 30,
  points: 40,
  links: 50,
} as const

export const BUSINESS_CHILD_CATEGORY_RANKS = {
  tabs: 10,
  metrics: 20,
  employees: 30,
} as const

export const FOOTER_CHILD_CATEGORY_RANKS = {
  pages: 10,
  help: 20,
  contact: 30,
} as const

export const HEADER_ARTICLE_RANKS = {
  brand: 1,
  primaryAction: 80,
  signIn: 90,
  localeSwitch: 100,
} as const

export const HERO_ARTICLE_RANKS = {
  content: 1,
} as const

export const SERVICES_ARTICLE_RANKS = {
  header: 1,
} as const

export const WHY_ARTICLE_RANKS = {
  header: 1,
} as const

export const BOOKING_ARTICLE_RANKS = {
  header: 1,
} as const

export const STEPS_ARTICLE_RANKS = {
  header: 1,
  cta: 2,
} as const

export const APP_ARTICLE_RANKS = {
  header: 1,
} as const

export const ACADEMY_ARTICLE_RANKS = {
  header: 1,
  cta: 2,
} as const

export const STATS_ARTICLE_RANKS = {
  header: 1,
} as const

export const BUSINESS_ARTICLE_RANKS = {
  header: 1,
  pointStart: 10,
  primaryAction: 50,
  secondaryAction: 60,
} as const

export const TESTIMONIAL_ARTICLE_RANKS = {
  content: 1,
} as const

export const FINAL_CTA_ARTICLE_RANKS = {
  content: 1,
  primaryAction: 10,
  secondaryAction: 20,
} as const

export const FOOTER_ARTICLE_RANKS = {
  brand: 1,
  newsletter: 2,
  copyright: 3,
} as const
