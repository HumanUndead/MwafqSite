import 'server-only';

import {
  authCookieName,
  authCookieOptions,
  authTokenCookieOptions,
} from './authService';
import {
  SSO_ACCESS_EXPIRES_COOKIE,
  SSO_REFRESH_EXPIRES_COOKIE,
  SSO_REFRESH_TOKEN_COOKIE,
  SSO_TOKEN_TYPE_COOKIE,
  type SsoTokenResult,
} from '../sso.shared';

interface CookieWriter {
  set: (
    name: string,
    value: string,
    options: typeof authCookieOptions | typeof authTokenCookieOptions
  ) => unknown;
  delete: (name: string) => unknown;
}

/**
 * Persist tokens from a Token/Refresh exchange.
 * - Access token: readable cookie (so the `http` client can attach Bearer).
 * - Refresh token + metadata: httpOnly (never exposed to client JS).
 * Called on both initial login and every refresh (token rotation).
 */
export function setSsoTokenCookies(cookies: CookieWriter, token: SsoTokenResult) {
  cookies.set(authCookieName, token.accessToken, authTokenCookieOptions);

  if (token.refreshToken) {
    cookies.set(SSO_REFRESH_TOKEN_COOKIE, token.refreshToken, authCookieOptions);
  }
  cookies.set(SSO_TOKEN_TYPE_COOKIE, token.tokenType, authCookieOptions);

  if (token.accessTokenExpiresAtUtc) {
    cookies.set(
      SSO_ACCESS_EXPIRES_COOKIE,
      token.accessTokenExpiresAtUtc,
      authCookieOptions
    );
  }
  if (token.refreshTokenExpiresAtUtc) {
    cookies.set(
      SSO_REFRESH_EXPIRES_COOKIE,
      token.refreshTokenExpiresAtUtc,
      authCookieOptions
    );
  }
}

/** Clear every SSO auth cookie — used when a refresh fails (force re-login). */
export function clearSsoAuthCookies(cookies: CookieWriter) {
  cookies.delete(authCookieName);
  cookies.delete(SSO_REFRESH_TOKEN_COOKIE);
  cookies.delete(SSO_TOKEN_TYPE_COOKIE);
  cookies.delete(SSO_ACCESS_EXPIRES_COOKIE);
  cookies.delete(SSO_REFRESH_EXPIRES_COOKIE);
}
