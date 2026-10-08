import 'server-only';

import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { authCookieName } from './authService';
import { cookies } from 'next/headers';
import { MWAFQ_UPSTREAM_ORIGIN } from '@/shared/constants/config';
import { logApiCall, shouldLogApiUrl } from '@/shared/lib/apiDebugLog.shared';
interface UpstreamTextRequestOptions {
  method: 'GET' | 'POST';
  url: URL;
  /**
   * Raw token or `Bearer <token>` — forwarded as `Authorization` when set.
   * Falls back to the `token` cookie when omitted. Pass this explicitly for
   * flows that must not depend on (or leak into) the site-wide auth cookie.
   */
  authorization?: string | null;
  /** Send no `Authorization` at all (login / OTP). Ignores the cookie. */
  anonymous?: boolean;
  /** JSON-serialized and sent as the request body when set (e.g. `Login`). */
  body?: unknown;
}

export async function performUpstreamTextRequest({
  method,
  url,
  authorization,
  anonymous = false,
  body,
}: UpstreamTextRequestOptions): Promise<{ status: number; body: string }> {
  let bearer = authorization?.trim() || null;

  if (anonymous) {
    bearer = null;
  } else if (!bearer) {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(authCookieName)?.value;
    bearer = cookieToken ? `Bearer ${cookieToken}` : null;
  } else if (!/^Bearer\s+/i.test(bearer)) {
    bearer = `Bearer ${bearer}`;
  }

  const requestImpl = url.protocol === 'https:' ? httpsRequest : httpRequest;
  const serializedBody = body !== undefined ? JSON.stringify(body) : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Origin: MWAFQ_UPSTREAM_ORIGIN,
    // An empty or stale Authorization makes the backend answer Forbidden.
    ...(bearer ? { Authorization: bearer } : {}),
  };

  // node:https bypasses the fetch logger, so log here (see apiDebugLog.shared).
  const started = Date.now();
  const log = (result: { status?: number; body?: string; error?: unknown }) => {
    if (!shouldLogApiUrl(url)) return;
    logApiCall({
      method,
      url: url.toString(),
      headers,
      body: serializedBody ? { kind: 'text', value: serializedBody } : undefined,
      status: result.status,
      durationMs: Date.now() - started,
      responseText: result.body,
      error: result.error,
    });
  };

  return new Promise((resolve, reject) => {
    const req = requestImpl(
      url,
      {
        method,
        headers,
      },
      (res) => {
        const status =
          typeof res.statusCode === 'number' ? res.statusCode : 500;
        const chunks: Buffer[] = [];

        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          log({ status, body: text });
          resolve({ status, body: text });
        });
      }
    );
    req.on('error', (error) => {
      log({ error: error.message });
      reject(error);
    });

    if (serializedBody) {
      req.end(serializedBody);
    } else {
      req.end();
    }
  });
}
