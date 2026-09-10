import {
  ANDROID_PACKAGE_NAME,
  IOS_APP_STORE_ID,
} from '@/modules/deep-linking/config';

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

/** `null` until `NEXT_PUBLIC_IOS_APP_STORE_ID` is set — never render a dead store link. */
export const APP_STORE_URL: string | null = IOS_APP_STORE_ID
  ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`
  : null;

/**
 * Query flag the automatic handoff bounces back to when the app did not open.
 * It is the attempt guard: present means "already tried, stay on the page".
 */
const HANDOFF_TRIED_PARAM = 'applink';
const HANDOFF_TRIED_VALUE = 'web';

export type MobilePlatform = 'ios' | 'android' | 'other';

/** iPadOS 13+ reports a desktop Safari UA, so touch points disambiguate it. */
export function detectMobilePlatform(
  userAgent: string,
  maxTouchPoints = 0
): MobilePlatform {
  if (/android/i.test(userAgent)) return 'android';
  if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return 'ios';
  return 'other';
}

/**
 * Android `intent://` handoff for the current URL. `scheme=https` reuses the
 * App Link, so no custom URL scheme is needed.
 *
 * `fallbackUrl` is where Chrome goes when the intent does not launch — which
 * happens with an installed app too (no user gesture, or a manifest that does
 * not claim this exact path), so only the manual button points it at the store.
 */
export function buildAndroidIntentUrl(
  currentUrl: string,
  fallbackUrl: string = PLAY_STORE_URL
): string {
  const { host, pathname, search } = withoutHandoffMarker(currentUrl);

  return [
    `intent://${host}${pathname}${search}#Intent`,
    'scheme=https',
    `package=${ANDROID_PACKAGE_NAME}`,
    `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)}`,
    'end',
  ].join(';');
}

/**
 * Where an `/app/*` page should send the visitor the moment it loads. Reaching
 * the page at all means the OS did not intercept the link, so the browser tries
 * the handoff itself:
 *
 * - Android — `intent://`, falling back to this same page rather than the store,
 *   so an attempt that fails while the app *is* installed does not strand the
 *   visitor on Play Store. The card then offers the store explicitly.
 * - iOS — `null`. A Universal Link that failed cannot be retried, and bouncing
 *   to the App Store would punish visitors who already have the app.
 * - Desktop / unknown — `null`, stay on the page and show the store links.
 *
 * `null` once the fallback marker is present: the attempt already happened.
 */
export function resolveAppHandoffUrl(
  platform: MobilePlatform,
  currentUrl: string
): string | null {
  if (platform !== 'android' || hasHandoffMarker(currentUrl)) return null;

  return buildAndroidIntentUrl(currentUrl, buildHandoffFallbackUrl(currentUrl));
}

/** The current page, flagged so the returning load does not attempt again. */
function buildHandoffFallbackUrl(currentUrl: string): string {
  const url = new URL(currentUrl);
  url.searchParams.set(HANDOFF_TRIED_PARAM, HANDOFF_TRIED_VALUE);
  return url.toString();
}

function hasHandoffMarker(currentUrl: string): boolean {
  return (
    new URL(currentUrl).searchParams.get(HANDOFF_TRIED_PARAM) ===
    HANDOFF_TRIED_VALUE
  );
}

/** The app must receive the shared link, not our bookkeeping flag. */
function withoutHandoffMarker(currentUrl: string): URL {
  const url = new URL(currentUrl);
  url.searchParams.delete(HANDOFF_TRIED_PARAM);
  return url;
}
