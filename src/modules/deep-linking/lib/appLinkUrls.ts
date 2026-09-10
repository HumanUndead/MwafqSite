import {
  ANDROID_PACKAGE_NAME,
  IOS_APP_STORE_ID,
} from '@/modules/deep-linking/config';

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

/** `null` until `NEXT_PUBLIC_IOS_APP_STORE_ID` is set — never render a dead store link. */
export const APP_STORE_URL: string | null = IOS_APP_STORE_ID
  ? `https://apps.apple.com/app/id${IOS_APP_STORE_ID}`
  : null;

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
 * Android `intent://` handoff for the current URL: opens the app when it is
 * installed, and Chrome sends the user to `browser_fallback_url` when it isn't.
 * `scheme=https` reuses the App Link — no custom URL scheme needed.
 */
export function buildAndroidIntentUrl(currentUrl: string): string {
  const { host, pathname, search } = new URL(currentUrl);

  return [
    `intent://${host}${pathname}${search}#Intent`,
    'scheme=https',
    `package=${ANDROID_PACKAGE_NAME}`,
    `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)}`,
    'end',
  ].join(';');
}
