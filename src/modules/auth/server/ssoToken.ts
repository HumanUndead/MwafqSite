import 'server-only';

import {
  INFRASTRUCTURE_URL,
  SSO_CLIENT_ID,
  SSO_CLIENT_SECRET,
} from '@/shared/constants/config';
import {
  SSO_REFRESH_PATH,
  SSO_TOKEN_PATH,
  type SsoTokenResult,
} from '../sso.shared';

export interface SsoTokenExchangeParams {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

interface TokenExchangeBody {
  clientId: string;
  clientSecret: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

function buildTokenBody(params: SsoTokenExchangeParams): TokenExchangeBody {
  return {
    clientId: SSO_CLIENT_ID,
    clientSecret: SSO_CLIENT_SECRET,
    code: params.code,
    codeVerifier: params.codeVerifier,
    redirectUri: params.redirectUri,
  };
}

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

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

/** Parse the `ExternalSso/Token` payload (tolerant of casing + `value`/`data` envelope). */
export function extractTokenResult(payload: unknown): SsoTokenResult | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const envelope = record.value ?? record.data;
  const source =
    envelope && typeof envelope === 'object'
      ? (envelope as Record<string, unknown>)
      : record;

  const accessToken = asString(readCaseInsensitive(source, 'accessToken'));
  if (!accessToken) {
    return null;
  }

  return {
    tokenType: asString(readCaseInsensitive(source, 'tokenType')) ?? 'Bearer',
    accessToken,
    refreshToken: asString(readCaseInsensitive(source, 'refreshToken')) ?? '',
    refreshTokenExpiresAtUtc: asString(
      readCaseInsensitive(source, 'refreshTokenExpiresAtUtc')
    ),
    accessTokenExpiresInSeconds: asNumber(
      readCaseInsensitive(source, 'accessTokenExpiresInSeconds')
    ),
    accessTokenExpiresAtUtc: asString(
      readCaseInsensitive(source, 'accessTokenExpiresAtUtc')
    ),
  };
}

export interface TokenExchangeResponse {
  status: number;
  result: SsoTokenResult | null;
  payload: unknown;
}

/** Server-side POST to `ExternalSso/Token` — exchanges the auth code for tokens. */
export async function requestSsoToken(
  params: SsoTokenExchangeParams
): Promise<TokenExchangeResponse> {
  const endpoint = `${INFRASTRUCTURE_URL}${SSO_TOKEN_PATH}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildTokenBody(params)),
    cache: 'no-store',
  });

  const text = await response.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text
  }

  return {
    status: response.status,
    result: extractTokenResult(payload),
    payload,
  };
}

/**
 * Server-side POST to `ExternalSso/Refresh` — exchanges a refresh token for a
 * fresh access + refresh token pair (token rotation). Same response shape as
 * the initial token exchange.
 */
export async function requestSsoRefresh(
  refreshToken: string
): Promise<TokenExchangeResponse> {
  const endpoint = `${INFRASTRUCTURE_URL}${SSO_REFRESH_PATH}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId: SSO_CLIENT_ID,
      clientSecret: SSO_CLIENT_SECRET,
      refreshToken,
    }),
    cache: 'no-store',
  });

  const text = await response.text();
  let payload: unknown = text;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text
  }

  return {
    status: response.status,
    result: extractTokenResult(payload),
    payload,
  };
}
