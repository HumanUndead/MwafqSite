const DEFAULT_MWAFQ_API_BASE_URL = 'https://stagingapi.mwafq.com/';

/** B2B dashboard — navbar "Business sign in" destination. */
export const MWAFQ_BUSINESS_PORTAL_URL = 'https://www.mwafq.com/';

export const MWAFQ_API_BASE_URL =
  process.env.MWAFQ_API_BASE_URL ?? DEFAULT_MWAFQ_API_BASE_URL;

/** Canonical production origin — used for metadataBase, sitemap, robots, canonical/hreflang tags. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://site.mwafq.com'
).replace(/\/$/, '');

/**
 * Mwafq infrastructure origin (external SSO). No `/api` suffix — paths include it.
 * SERVER-ONLY, required — must be set in the environment (no default).
 */
export const INFRASTRUCTURE_URL = (process.env.INFRASTRUCTURE_URL ?? '').replace(
  /\/$/,
  ''
);

/**
 * OAuth client id for the external SSO flow. SERVER-ONLY — never expose via
 * NEXT_PUBLIC_. Read only by the server SSO routes.
 */
export const SSO_CLIENT_ID = process.env.CLIENT_ID ?? '';

/**
 * OAuth client secret for the token/refresh exchange. SERVER-ONLY — never expose
 * via NEXT_PUBLIC_. Read only by the server SSO routes.
 */
export const SSO_CLIENT_SECRET = process.env.CLIENT_SECRET ?? '';

/**
 * Hosted SSO login page users are sent to after a successful Authorize request.
 * SERVER-ONLY, required — must be set in the environment (no default).
 */
export const MWAFQ_SSO_LOGIN_URL = (
  process.env.MWAFQ_SSO_LOGIN_URL ?? ''
).replace(/\/$/, '');

export const config = {
  appName: 'Mwafq',
  appDescription:
    'Book medical tests, health services, and professional courses online with Mwafq. Trusted providers, certified results, and corporate health solutions across Saudi Arabia.',
  apiBaseUrl: MWAFQ_API_BASE_URL,
} as const;
