import {
  ANDROID_PACKAGE_NAME,
  ANDROID_SHA256_CERT_FINGERPRINTS,
  DEEP_LINK_PATH_PATTERNS,
  IOS_APP_ID,
} from '@/modules/deep-linking/config';

/** Payload served at `/.well-known/apple-app-site-association` (iOS Universal Links). */
export const appleAppSiteAssociation = {
  applinks: {
    apps: [],
    details: [
      {
        appID: IOS_APP_ID,
        paths: DEEP_LINK_PATH_PATTERNS,
      },
    ],
  },
};

/** Payload served at `/.well-known/assetlinks.json` (Android App Links). */
export const androidAssetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: ANDROID_PACKAGE_NAME,
      sha256_cert_fingerprints: ANDROID_SHA256_CERT_FINGERPRINTS,
    },
  },
];

/**
 * Both platforms refuse a redirected, HTML-typed or cached-stale association
 * file — always answer with `application/json` and a short max-age.
 */
export function jsonAssociationResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600, must-revalidate',
    },
  });
}
