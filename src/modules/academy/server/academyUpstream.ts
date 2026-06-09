import 'server-only';

import {
  extractUpstreamCode,
  extractUpstreamMessage,
} from '@/modules/auth/server/upstreamAuthResult';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';

/** Error from an Academy upstream call (carries upstream code + HTTP status). */
export class AcademyError extends Error {
  code: string | null;
  status: number;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = 'AcademyError';
    this.status = status;
    this.code = code;
  }
}

function parseJsonSafe(value: string): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

interface UpstreamRequestOptions {
  method: 'GET' | 'POST';
  path: string;
  token: string;
  /** FormData or a JSON-serializable body. */
  body?: FormData | Record<string, unknown>;
  fallbackMessage?: string;
}

/**
 * Authenticated Academy upstream request that returns the unwrapped
 * `value` of the upstream envelope, throwing `AcademyError` on failure.
 */
export async function academyAuthedRequest<T>({
  method,
  path,
  token,
  body,
  fallbackMessage = 'Request failed',
}: UpstreamRequestOptions): Promise<T> {
  const url = new URL(path, MWAFQ_API_BASE_URL);

  const headers: Record<string, string> = {
    accept: '*/*',
    Authorization: `Bearer ${token}`,
  };

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
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
    throw new AcademyError(
      extractUpstreamMessage(payload, fallbackMessage),
      response.status >= 400 ? response.status : 400,
      extractUpstreamCode(payload)
    );
  }

  return (payload?.value as T) ?? (payload as T);
}
