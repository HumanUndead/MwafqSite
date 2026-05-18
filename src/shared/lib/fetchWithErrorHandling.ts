import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { authCookieName } from '@/modules/auth/server/authService';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import type { UpstreamApiResponse } from '@/shared/types/api.types';

export type FetchWithErrorHandlingInit = RequestInit;

export class FetchResponseError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = 'FetchResponseError';
    this.status = status;
    this.statusText = statusText;
  }
}

export class FetchNotFoundError extends FetchResponseError {
  readonly url: string;

  constructor(url: string) {
    super('Not Found', 404, 'Not Found');
    this.name = 'FetchNotFoundError';
    this.url = url;
  }
}

async function applyBearerFromCookie(headers: Headers) {
  if (headers.has('Authorization')) {
    return;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
}

function applyContentType(
  headers: Headers,
  methodUpper: string,
  body: RequestInit['body']
) {
  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  if (methodUpper !== 'GET' && !headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (isFormData) {
    headers.delete('Content-Type');
  }
}

function valueFromUpstream<T>(
  body: UpstreamApiResponse<T>,
  httpStatus: number,
  httpStatusText: string
): T {
  if (body.isFailure) {
    throw new FetchResponseError(
      body.error.message || 'Request failed',
      httpStatus,
      httpStatusText
    );
  }
  return body.value;
}

function resolveUpstreamUrl(url: string): string {
  return new URL(url, MWAFQ_API_BASE_URL).toString();
}

export async function fetchWithErrorHandling<T>(
  url: string,
  options?: FetchWithErrorHandlingInit
): Promise<T> {
  const rest = options ?? {};
  const headers = new Headers(rest.headers);

  await applyBearerFromCookie(headers);

  const methodUpper = (rest.method ?? 'GET').toUpperCase();
  applyContentType(headers, methodUpper, rest.body);

  const fetchOptions: RequestInit = {
    ...rest,
    method: rest.method ?? 'GET',
    headers,
    credentials: 'include',
  };

  const resolvedUrl = resolveUpstreamUrl(url);
  const res = await fetch(resolvedUrl, fetchOptions);

  if (res.status === 404) {
    if (typeof window === 'undefined') {
      notFound();
    }

    throw new FetchNotFoundError(resolvedUrl);
  }

  if (!res.ok) {
    let body: UpstreamApiResponse<unknown>;
    try {
      body = (await res.json()) as UpstreamApiResponse<unknown>;
    } catch {
      throw new FetchResponseError(
        `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        res.statusText
      );
    }

    if (body.isFailure) {
      throw new FetchResponseError(
        body.error.message,
        res.status,
        res.statusText
      );
    }

    throw new FetchResponseError(
      `HTTP ${res.status}: ${res.statusText}`,
      res.status,
      res.statusText
    );
  }

  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    let body: UpstreamApiResponse<T>;
    try {
      body = (await res.json()) as UpstreamApiResponse<T>;
    } catch {
      throw new Error('Invalid JSON response');
    }
    return valueFromUpstream(body, res.status, res.statusText);
  }

  if (contentType.includes('text/plain')) {
    try {
      const text = await res.text();
      return { message: text } as unknown as T;
    } catch {
      throw new Error('Invalid text response');
    }
  }

  if (
    contentType.includes('application/pdf') ||
    contentType.includes('application/octet-stream')
  ) {
    return res.blob() as Promise<T>;
  }

  let body: UpstreamApiResponse<T>;
  try {
    body = (await res.json()) as UpstreamApiResponse<T>;
  } catch {
    throw new Error('Invalid JSON response');
  }
  return valueFromUpstream(body, res.status, res.statusText);
}
