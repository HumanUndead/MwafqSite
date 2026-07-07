/** Shared SSO constants — safe for both server and client (no `server-only`). */

export const SSO_AUTHORIZE_PATH = '/api/Authenticate/ExternalSso/Authorize';

export const SSO_TOKEN_PATH = '/api/Authenticate/ExternalSso/Token';

export const SSO_REFRESH_PATH = '/api/Authenticate/ExternalSso/Refresh';

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

/** Cookie holding the `redirectUri` sent in Authorize — reused/validated at token exchange. */
export const SSO_REDIRECT_URI_COOKIE = 'mwafq-sso-redirect';

/** Token cookies set after a successful `ExternalSso/Token` exchange. */
export const SSO_REFRESH_TOKEN_COOKIE = 'mwafq-refresh-token';
export const SSO_TOKEN_TYPE_COOKIE = 'mwafq-token-type';
export const SSO_ACCESS_EXPIRES_COOKIE = 'mwafq-access-expires';
export const SSO_REFRESH_EXPIRES_COOKIE = 'mwafq-refresh-expires';

/** Parsed result of a successful `ExternalSso/Token` exchange. */
export interface SsoTokenResult {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string | null;
  accessTokenExpiresInSeconds: number | null;
  accessTokenExpiresAtUtc: string | null;
}

export interface SsoAuthorizeRequest {
  clientId: string;
  redirectUri: string;
  responseType: 'code';
  codeChallenge: string;
  codeChallengeMethod: SsoCodeChallengeMethod;
  state: string;
}

/** Parsed result of a successful Authorize request. */
export interface SsoAuthorizeResult {
  authorizationRequestId: string;
  expiresAtUtc: string | null;
}

/** Path (relative to a locale) where SSO returns the user after login. */
export const SSO_LOGIN_CALLBACK_PATH = '/ssologin';

/**
 * Locale used in the `redirectUri` sent to the SSO API. ALWAYS `en` — the
 * backend returns to exactly the URL we send and rejects any other value.
 * (User-facing locale is handled separately, on the landing page.)
 */
export const SSO_REDIRECT_LOCALE = 'en';

/** Build a callback URL: `<origin>/<locale>/ssologin`. */
export function buildSsoCallbackUrl(origin: string, locale: string): string {
  const base = origin.replace(/\/$/, '');
  return `${base}/${locale}${SSO_LOGIN_CALLBACK_PATH}`;
}

/**
 * Origin used for the SSO `redirectUri`. In development we use the current
 * request origin (e.g. http://localhost:3000) so the flow can be tested locally.
 * In production we always use the canonical site URL.
 */
export function resolveSsoRedirectOrigin(
  requestOrigin: string,
  siteUrl: string
): string {
  return process.env.NODE_ENV === 'production' ? siteUrl : requestOrigin;
}

/**
 * The exact `redirectUri` we send to the SSO API — `<origin>/en/ssologin`.
 * Must be byte-for-byte identical on Authorize and Token.
 */
export function buildSsoApiRedirectUri(origin: string): string {
  return buildSsoCallbackUrl(origin, SSO_REDIRECT_LOCALE);
}

/**
 * Build the hosted SSO login URL the browser is sent to:
 * `<authUrl>?requestId=<AuthorizationRequestId>&callbackUrl=<encoded callback>&from=b2c`.
 * `from=b2c` marks this site (the B2C consumer site) as the request origin.
 */
export function buildSsoLoginUrl(params: {
  authUrl: string;
  authorizationRequestId: string;
  callbackUrl: string;
}): string {
  const url = new URL(params.authUrl);
  url.searchParams.set('requestId', params.authorizationRequestId);
  url.searchParams.set('callbackUrl', params.callbackUrl);
  url.searchParams.set('from', 'b2c');
  return url.toString();
}
