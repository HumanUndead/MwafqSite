/** Shared SSO constants — safe for both server and client (no `server-only`). */

export const SSO_AUTHORIZE_PATH = '/api/Authenticate/ExternalSso/Authorize';

/**
 * PKCE challenge method. Single source of truth — the code challenge MUST be
 * hashed with the algorithm this names. Both the server and dev-browser paths
 * derive the challenge from this so the hash and `codeChallengeMethod` can never
 * drift apart. Changing this to 'plain' also changes the derivation.
 */
export const SSO_CODE_CHALLENGE_METHOD = 'S256' as const;

export type SsoCodeChallengeMethod = typeof SSO_CODE_CHALLENGE_METHOD;

/**
 * `state` value sent on the authorize request. Sent as the literal string
 * "null" per the SSO spec. NOTE: this is not a per-request CSRF token, so the
 * callback cannot verify state against the browser session.
 */
export const SSO_STATE_VALUE = 'null';

/** Cookie holding the unhashed PKCE code verifier (httpOnly, read back at callback). */
export const SSO_CODE_VERIFIER_COOKIE = 'mwafq-sso-verifier';

/** Cookie holding the CSRF `state` value (httpOnly, verified at callback). */
export const SSO_STATE_COOKIE = 'mwafq-sso-state';

export interface SsoAuthorizeRequest {
  clientId: string;
  redirectUri: string;
  responseType: 'code';
  codeChallenge: string;
  codeChallengeMethod: SsoCodeChallengeMethod;
  state: string;
}
