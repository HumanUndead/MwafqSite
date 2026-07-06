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
 * Falls back to the NEXT_PUBLIC_ mirror so a single `.env` entry serves both the
 * server and dev-browser paths.
 */
export const INFRASTRUCTURE_URL = (
  process.env.INFRASTRUCTURE_URL ??
  process.env.NEXT_PUBLIC_INFRASTRUCTURE_URL ??
  'https://infrastructure.mwafq.com'
).replace(/\/$/, '');

/**
 * OAuth client id for the external SSO authorize flow. Falls back to the
 * NEXT_PUBLIC_ mirror (the id is already exposed to the browser in the dev path).
 */
export const SSO_CLIENT_ID =
  process.env.CLIENT_ID ?? process.env.NEXT_PUBLIC_CLIENT_ID ?? '';

/**
 * OAuth client secret for the token exchange. Read only by the server
 * token-exchange route.
 *
 * SECURITY: prefer the server-only `CLIENT_SECRET` (e.g. in `.env.local` or the
 * hosting env). The `NEXT_PUBLIC_CLIENT_SECRET` fallback is a convenience for
 * this project's `.env`, but a NEXT_PUBLIC_ value is embedded in the browser
 * bundle and readable by anyone — move it to `CLIENT_SECRET` before production.
 */
export const SSO_CLIENT_SECRET =
  process.env.CLIENT_SECRET ?? process.env.NEXT_PUBLIC_CLIENT_SECRET ?? '';

/** Hosted SSO login page users are sent to after a successful Authorize request. */
export const MWAFQ_SSO_LOGIN_URL = (
  process.env.NEXT_PUBLIC_MWAFQ_SSO_LOGIN_URL ?? 'https://www.mwafq.com/auth'
).replace(/\/$/, '');

export const config = {
  appName: 'Mwafq',
  appDescription:
    'Book medical tests, health services, and professional courses online with Mwafq. Trusted providers, certified results, and corporate health solutions across Saudi Arabia.',
  apiBaseUrl: MWAFQ_API_BASE_URL,
} as const;
