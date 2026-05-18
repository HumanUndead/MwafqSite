import 'server-only';

import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { getAuthTokenFromDocumentCookie } from '@/shared/lib/authCookie';
import { authCookieName } from './authService';
import { cookies } from 'next/headers';
interface UpstreamTextRequestOptions {
  method: 'GET' | 'POST';
  url: URL;
  /** Raw token or `Bearer <token>` — forwarded as `Authorization` when set. */
  authorization?: string | null;
}

export async function performUpstreamTextRequest({
  method,
  url,
  authorization,
}: UpstreamTextRequestOptions): Promise<{ status: number; body: string }> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(authCookieName)?.value;
  const requestImpl = url.protocol === 'https:' ? httpsRequest : httpRequest;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'mwafq-nextjs-staging/1.0',
    Authorization: cookieToken ? `Bearer ${cookieToken}` : '',
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
    req.end();
  });
}
