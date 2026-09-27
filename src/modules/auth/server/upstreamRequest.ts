import 'server-only';

import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { authCookieName } from './authService';
import { cookies } from 'next/headers';
interface UpstreamTextRequestOptions {
  method: 'GET' | 'POST';
  url: URL;
  /**
   * Raw token or `Bearer <token>` — forwarded as `Authorization` when set.
   * Falls back to the `token` cookie when omitted. Pass this explicitly for
   * flows that must not depend on (or leak into) the site-wide auth cookie.
   */
  authorization?: string | null;
  /** JSON-serialized and sent as the request body when set (e.g. `Login`). */
  body?: unknown;
}

export async function performUpstreamTextRequest({
  method,
  url,
  authorization,
  body,
}: UpstreamTextRequestOptions): Promise<{ status: number; body: string }> {
  let bearer = authorization?.trim() || null;

  if (!bearer) {
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
    'User-Agent': 'mwafq-nextjs-staging/1.0',
    Authorization: bearer ?? '',
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
          resolve({
            status,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      }
    );
    req.on('error', reject);

    if (serializedBody) {
      req.end(serializedBody);
    } else {
      req.end();
    }
  });
}
