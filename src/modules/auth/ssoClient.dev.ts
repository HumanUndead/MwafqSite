'use client';

/**
 * DEV-ONLY SSO path — runs the Authorize + Token requests from the browser so
 * the `curl`s show up in the Network tab for debugging. In production the flow
 * goes through the server routes and never touches the client.
 *
 * Toggle with `NEXT_PUBLIC_SSO_DEV_NETWORK` (set to '1' to enable). Requires
 * `NEXT_PUBLIC_CLIENT_ID` + `NEXT_PUBLIC_INFRASTRUCTURE_URL` (and
 * `NEXT_PUBLIC_CLIENT_SECRET` for the token step) to be exposed.
 */

import {
  buildSsoApiRedirectUri,
  buildSsoLoginUrl,
  SSO_AUTHORIZE_PATH,
  SSO_CODE_CHALLENGE_METHOD,
  SSO_CODE_VERIFIER_COOKIE,
  SSO_STATE_COOKIE,
  SSO_STATE_VALUE,
  SSO_TOKEN_PATH,
  type SsoAuthorizeRequest,
  type SsoTokenResult,
} from './sso.shared';

const SSO_LOGIN_URL =
  process.env.NEXT_PUBLIC_MWAFQ_SSO_LOGIN_URL ?? 'https://www.mwafq.com/auth';

function readAuthorizeResult(
  text: string
): { authorizationRequestId: string; expiresAtUtc: string | null } | null {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }

  const envelope = parsed.value ?? parsed.data;
  const source =
    envelope && typeof envelope === 'object'
      ? (envelope as Record<string, unknown>)
      : parsed;

  const find = (key: string): unknown => {
    const target = key.toLowerCase();
    for (const [k, v] of Object.entries(source)) {
      if (k.toLowerCase() === target) return v;
    }
    return undefined;
  };

  const id = find('authorizationRequestId');
  if (typeof id !== 'string' || !id.trim()) return null;

  const expires = find('expiresAtUtc');
  return {
    authorizationRequestId: id.trim(),
    expiresAtUtc: typeof expires === 'string' ? expires : null,
  };
}

export const SSO_DEV_NETWORK_ENABLED =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_SSO_DEV_NETWORK === '1';

function base64Url(bytes: Uint8Array): string {
  let str = '';
  for (const byte of bytes) {
    str += String.fromCharCode(byte);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return base64Url(new Uint8Array(digest));
}

/** Derive the challenge with the shared method so it matches `codeChallengeMethod`. */
async function deriveCodeChallenge(codeVerifier: string): Promise<string> {
  if (SSO_CODE_CHALLENGE_METHOD === 'S256') {
    return sha256Base64Url(codeVerifier);
  }
  return codeVerifier;
}

function setCookie(name: string, value: string) {
  // Client-visible dev cookie only — server path uses an httpOnly cookie.
  document.cookie = `${name}=${value}; path=/; max-age=600; samesite=lax`;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Runs the authorize request from the browser and returns the hosted SSO login URL. */
export async function runSsoAuthorizeInBrowser(): Promise<string | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID ?? '';
  const infraUrl = (process.env.NEXT_PUBLIC_INFRASTRUCTURE_URL ?? '').replace(
    /\/$/,
    ''
  );

  if (!clientId || !infraUrl) {
    throw new Error(
      'Dev SSO requires NEXT_PUBLIC_CLIENT_ID and NEXT_PUBLIC_INFRASTRUCTURE_URL'
    );
  }

  // Dev: use the current origin (localhost) so the flow can be tested locally.
  const callbackUrl = buildSsoApiRedirectUri(window.location.origin);
  const codeVerifier = randomBase64Url(32);
  const codeChallenge = await deriveCodeChallenge(codeVerifier);
  const state = SSO_STATE_VALUE;

  setCookie(SSO_CODE_VERIFIER_COOKIE, codeVerifier);
  setCookie(SSO_STATE_COOKIE, state);

  const body: SsoAuthorizeRequest = {
    clientId,
    redirectUri: callbackUrl,
    responseType: 'code',
    codeChallenge,
    codeChallengeMethod: SSO_CODE_CHALLENGE_METHOD,
    state,
  };

  const response = await fetch(`${infraUrl}${SSO_AUTHORIZE_PATH}`, {
    method: 'POST',
    headers: { accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = readAuthorizeResult(await response.text());
  if (!result) {
    return null;
  }

  return buildSsoLoginUrl({
    authUrl: SSO_LOGIN_URL,
    authorizationRequestId: result.authorizationRequestId,
    callbackUrl,
  });
}

function readTokenResult(text: string): SsoTokenResult | null {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }

  const envelope = parsed.value ?? parsed.data;
  const source =
    envelope && typeof envelope === 'object'
      ? (envelope as Record<string, unknown>)
      : parsed;

  const find = (key: string): unknown => {
    const target = key.toLowerCase();
    for (const [k, v] of Object.entries(source)) {
      if (k.toLowerCase() === target) return v;
    }
    return undefined;
  };

  const accessToken = find('accessToken');
  if (typeof accessToken !== 'string' || !accessToken.trim()) {
    return null;
  }

  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null);
  const num = (v: unknown) =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;

  return {
    tokenType: str(find('tokenType')) ?? 'Bearer',
    accessToken: accessToken.trim(),
    refreshToken: str(find('refreshToken')) ?? '',
    refreshTokenExpiresAtUtc: str(find('refreshTokenExpiresAtUtc')),
    accessTokenExpiresInSeconds: num(find('accessTokenExpiresInSeconds')),
    accessTokenExpiresAtUtc: str(find('accessTokenExpiresAtUtc')),
  };
}

/**
 * Runs the token exchange directly from the browser (dev only) so the request
 * shows in the Network tab. Reads the client-side `codeVerifier` cookie set by
 * `runSsoAuthorizeInBrowser`. WARNING: sends the client secret from the browser.
 */
export async function runSsoTokenInBrowser(
  code: string
): Promise<SsoTokenResult | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID ?? '';
  const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET ?? '';
  const infraUrl = (process.env.NEXT_PUBLIC_INFRASTRUCTURE_URL ?? '').replace(
    /\/$/,
    ''
  );

  if (!clientId || !clientSecret || !infraUrl) {
    throw new Error(
      'Dev SSO token requires NEXT_PUBLIC_CLIENT_ID, NEXT_PUBLIC_CLIENT_SECRET and NEXT_PUBLIC_INFRASTRUCTURE_URL'
    );
  }

  const codeVerifier = readCookie(SSO_CODE_VERIFIER_COOKIE);
  if (!codeVerifier) {
    throw new Error('Missing code verifier — start the login again.');
  }

  const body = {
    clientId,
    clientSecret,
    code,
    codeVerifier,
    // Must match the redirectUri sent in Authorize (dev = current origin).
    redirectUri: buildSsoApiRedirectUri(window.location.origin),
  };

  const response = await fetch(`${infraUrl}${SSO_TOKEN_PATH}`, {
    method: 'POST',
    headers: { accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return readTokenResult(await response.text());
}
