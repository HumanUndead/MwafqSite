import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveRequestBearerTokenFromCookieStore } from '@/modules/auth/server/resolveRequestBearerToken';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
} from '@/modules/auth/server/upstreamAuthResult';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';

/** Error from an upstream call (carries upstream code + HTTP status). */
export class UpstreamError extends Error {
  code: string | null;
  status: number;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
    this.code = code;
  }
}

export type UpstreamQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly (string | number)[];

export interface UpstreamRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Upstream path starting with `/api/...`. */
  path: string;
  /** Bearer token. Omit for anonymous endpoints. */
  token?: string | null;
  /** Query params. Arrays repeat the key; nullish/empty values are skipped. */
  query?: Record<string, UpstreamQueryValue>;
  /** FormData or a JSON-serializable body. */
  body?: FormData | Record<string, unknown>;
  fallbackMessage?: string;
}

function parseJsonSafe(value: string): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function buildUpstreamUrl(
  path: string,
  query?: Record<string, UpstreamQueryValue>
): URL {
  const url = new URL(path, MWAFQ_API_BASE_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
      continue;
    }
    url.searchParams.set(key, String(value));
  }
  return url;
}

/**
 * Upstream request that returns the unwrapped `value` of the envelope,
 * throwing `UpstreamError` on HTTP failure or `isSuccess: false`.
 * Also handles the bare `{ code, message }` body of payment 600 errors.
 */
export async function upstreamRequest<T>({
  method,
  path,
  token,
  query,
  body,
  fallbackMessage = 'Request failed',
}: UpstreamRequestOptions): Promise<T> {
  const headers: Record<string, string> = { accept: '*/*' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildUpstreamUrl(path, query), {
    method,
    headers,
    body: requestBody,
    cache: 'no-store',
  });

  const text = await response.text();
  const payload = parseJsonSafe(text) as {
    value?: T;
    isSuccess?: boolean;
  } | null;

  if (response.status >= 400 || payload?.isSuccess === false) {
    throw new UpstreamError(
      extractUpstreamMessage(payload, fallbackMessage),
      response.status >= 400 ? response.status : 400,
      extractUpstreamCode(payload)
    );
  }

  if (payload && typeof payload === 'object' && 'value' in payload) {
    return payload.value as T;
  }
  return payload as T;
}

/** Resolve the bearer token from the request header or cookies, or null. */
export async function resolveRouteToken(
  request: NextRequest
): Promise<string | null> {
  const cookieStore = await cookies();
  return resolveRequestBearerTokenFromCookieStore(request, (name) =>
    cookieStore.get(name)
  );
}

export function routeUnauthorized(): NextResponse {
  return NextResponse.json(
    { success: false, message: 'Authentication required', data: null },
    { status: 401 }
  );
}

export function routeBadRequest(message: string): NextResponse {
  return NextResponse.json(
    { success: false, message, code: 'BadRequest', data: null },
    { status: 400 }
  );
}

export function routeOk<T>(data: T, message = 'OK'): NextResponse {
  return NextResponse.json({ success: true, message, data });
}

/** Convert a thrown error into a JSON error response (keeps upstream code). */
export function routeError(error: unknown, label: string): NextResponse {
  if (error instanceof UpstreamError) {
    return NextResponse.json(
      { success: false, message: error.message, code: error.code, data: null },
      {
        // Payment business errors use 600, which is not a valid HTTP status.
        status: error.status >= 400 && error.status <= 599 ? error.status : 422,
      }
    );
  }

  console.error(label, error);
  return NextResponse.json(
    { success: false, message: 'Internal server error', data: null },
    { status: 500 }
  );
}

/** Positive integer from a query/body value, or null. */
export function toPositiveInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}
