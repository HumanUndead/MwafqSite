import { MWAFQ_API_BASE_URL } from '@/shared/constants/config'

const parsedRegisterPageCategoryId = Number(process.env.MWAFQ_REGISTER_PAGE_CATEGORY_ID ?? 137)

export const REGISTER_PAGE_CONTENT_API_BASE_URL = MWAFQ_API_BASE_URL
export const REGISTER_PAGE_CONTENT_ROOT_CATEGORY_ID = Number.isFinite(parsedRegisterPageCategoryId)
  ? parsedRegisterPageCategoryId
  : null
export const REGISTER_PAGE_CONTENT_REVALIDATE_SECONDS = 60 * 10
export const REGISTER_PAGE_CONTENT_CACHE_TAG = 'register-page-content'

export const REGISTER_PAGE_ARTICLE_RANKS = {
  hero: 1,
} as const

export const REGISTER_PAGE_CHILD_CATEGORY_RANKS = {
  steps: 10,
  stats: 20,
} as const
