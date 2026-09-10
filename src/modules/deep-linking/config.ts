import { locales } from '@/i18n/config';

/** Play Store application id of the Mwafq Android app. */
export const ANDROID_PACKAGE_NAME = 'com.kensoftware.mwafq';

/** SHA-256 signing-certificate fingerprints Google verifies the app against. */
export const ANDROID_SHA256_CERT_FINGERPRINTS = [
  '39:9C:23:DA:B8:58:FF:72:19:A0:C0:31:B5:C5:18:A1:2A:CB:F2:AE:69:FC:D6:48:B5:FA:ED:28:33:1A:F6:9C',
];

/** `<Apple Team ID>.<bundle identifier>` of the Mwafq iOS app. */
export const IOS_APP_ID = 'MMW8FUN7RD.com.mwafq.b2c';

/** Numeric App Store id of the Mwafq iOS app (App Store Connect). */
const DEFAULT_IOS_APP_STORE_ID = '6806986285';

/**
 * Drives the App Store button and the iOS Smart App Banner. Set
 * `NEXT_PUBLIC_IOS_APP_STORE_ID=''` to hide both — the store URL only resolves
 * once the app is released.
 */
export const IOS_APP_STORE_ID =
  process.env.NEXT_PUBLIC_IOS_APP_STORE_ID ?? DEFAULT_IOS_APP_STORE_ID;

/** Every shared deep link lives under this path. */
export const DEEP_LINK_BASE_PATH = '/app';

/**
 * Path patterns claimed by the iOS app, bare and locale-prefixed. The proxy
 * redirects `/app` to `/<locale>/app`, so both shapes must be claimed.
 */
export const DEEP_LINK_PATH_PATTERNS: string[] = [
  DEEP_LINK_BASE_PATH,
  `${DEEP_LINK_BASE_PATH}/*`,
  ...locales.flatMap((locale) => [
    `/${locale}${DEEP_LINK_BASE_PATH}`,
    `/${locale}${DEEP_LINK_BASE_PATH}/*`,
  ]),
];
