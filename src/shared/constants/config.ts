const DEFAULT_MWAFQ_API_BASE_URL = 'https://stagingapi.mwafq.com/';

/** B2B dashboard — navbar "Business sign in" destination. */
export const MWAFQ_BUSINESS_PORTAL_URL = 'https://www.mwafq.com/';

export const MWAFQ_API_BASE_URL =
  process.env.MWAFQ_API_BASE_URL ?? DEFAULT_MWAFQ_API_BASE_URL;

/** Canonical production origin — used for metadataBase, sitemap, robots, canonical/hreflang tags. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://site.mwafq.com'
).replace(/\/$/, '');

export const GOOGLE_SITE_VERIFICATION =
  'tAeGn-m3s7LkysW2OAr8gYCgP05UN4-1r9GrkTeNGDY';

export const config = {
  appName: 'Mwafq',
  appDescription: 'Your trusted platform',
  apiBaseUrl: MWAFQ_API_BASE_URL,
} as const;
