import 'server-only';

import { randomBytes, createHash } from 'node:crypto';
import { INFRASTRUCTURE_URL, SSO_CLIENT_ID } from '@/shared/constants/config';
import {
  SSO_AUTHORIZE_PATH,
  SSO_CODE_CHALLENGE_METHOD,
  type SsoAuthorizeRequest,
  type SsoAuthorizeResult,
} from '../sso.shared';

function base64Url(input: Buffer): string {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Random high-entropy PKCE code verifier (unhashed — stored securely server-side). */
export function generateCodeVerifier(): string {
  return base64Url(randomBytes(32));
}

/**
 * Code challenge derived using `SSO_CODE_CHALLENGE_METHOD`.
 * 'S256' → base64url(SHA-256(verifier)); 'plain' → the verifier itself.
 * Kept in lockstep with the method so the sent hash always matches what we declare.
 */
export function deriveCodeChallenge(codeVerifier: string): string {
  if (SSO_CODE_CHALLENGE_METHOD === 'S256') {
    return base64Url(createHash('sha256').update(codeVerifier).digest());
  }
  return codeVerifier;
}

export function buildAuthorizeBody(params: {
  redirectUri: string;
  codeChallenge: string;
  state: string;
}): SsoAuthorizeRequest {
  return {
    clientId: SSO_CLIENT_ID,
    redirectUri: params.redirectUri,
    responseType: 'code',
    codeChallenge: params.codeChallenge,
    codeChallengeMethod: SSO_CODE_CHALLENGE_METHOD,
    state: params.state,
  };
}

export interface AuthorizeUpstreamResult {
  status: number;
  payload: unknown;
}

/** Server-side POST to the external SSO Authorize endpoint (hidden from the browser). */
export async function requestSsoAuthorize(
  body: SsoAuthorizeRequest
): Promise<AuthorizeUpstreamResult> {
  const endpoint = `${INFRASTRUCTURE_URL}${SSO_AUTHORIZE_PATH}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await response.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // upstream may return a bare URL string — keep the raw text.
  }

  return { status: response.status, payload };
}

/** Read a key from an object case-insensitively. */
function readCaseInsensitive(
  record: Record<string, unknown>,
  key: string
): unknown {
  const target = key.toLowerCase();
  for (const [k, v] of Object.entries(record)) {
    if (k.toLowerCase() === target) {
      return v;
    }
  }
  return undefined;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/**
 * Extract `{ authorizationRequestId, expiresAtUtc }` from the authorize payload.
 * Tolerant of casing and a `value`/`data` envelope wrapper.
 */
export function extractAuthorizeResult(
  payload: unknown
): SsoAuthorizeResult | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const envelope = record.value ?? record.data;
  const source =
    envelope && typeof envelope === 'object'
      ? (envelope as Record<string, unknown>)
      : record;

  const authorizationRequestId = asString(
    readCaseInsensitive(source, 'authorizationRequestId')
  );

  if (!authorizationRequestId) {
    return null;
  }

  return {
    authorizationRequestId,
    expiresAtUtc: asString(readCaseInsensitive(source, 'expiresAtUtc')),
  };
}
