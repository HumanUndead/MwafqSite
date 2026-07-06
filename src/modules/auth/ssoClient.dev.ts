'use client';

/**
 * DEV-ONLY SSO path — runs the PKCE + Authorize request from the browser so the
 * `curl` shows up in the Network tab for debugging. In production the flow goes
 * through the server route (`authApi.ssoAuthorize`) and never touches the client.
 *
 * Toggle with `NEXT_PUBLIC_SSO_DEV_NETWORK` (set to '1' to enable). Requires
 * `NEXT_PUBLIC_CLIENT_ID` + `NEXT_PUBLIC_INFRASTRUCTURE_URL` to be exposed.
 */

import {
  SSO_AUTHORIZE_PATH,
  SSO_CODE_CHALLENGE_METHOD,
  SSO_CODE_VERIFIER_COOKIE,
  SSO_STATE_COOKIE,
  SSO_STATE_VALUE,
  type SsoAuthorizeRequest,
} from './sso.shared';

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

/** Runs the authorize request directly from the browser and returns the redirect URL. */
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

  const codeVerifier = randomBase64Url(32);
  const codeChallenge = await deriveCodeChallenge(codeVerifier);
  const state = SSO_STATE_VALUE;

  setCookie(SSO_CODE_VERIFIER_COOKIE, codeVerifier);
  setCookie(SSO_STATE_COOKIE, state);

  const body: SsoAuthorizeRequest = {
    clientId,
    redirectUri: window.location.origin,
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

  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const url =
      parsed.redirectUrl ?? parsed.url ?? parsed.location ?? parsed.value;
    return typeof url === 'string' ? url : null;
  } catch {
    return text.trim() || null;
  }
}
