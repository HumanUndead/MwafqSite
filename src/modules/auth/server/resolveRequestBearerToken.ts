import 'server-only';

import type { NextRequest } from 'next/server';
import { authCookieName } from './authService';

export function resolveRequestBearerToken(
  request: NextRequest,
  cookieToken?: string | null
): string | null {
  const authorization = request.headers.get('authorization')?.trim();

  if (authorization) {
    const match = /^Bearer\s+(.+)$/i.exec(authorization);
    const token = (match?.[1] ?? authorization).trim();
    if (token) {
      return token;
    }
  }

  const fromCookie = cookieToken?.trim();
  return fromCookie || null;
}

export function resolveRequestBearerTokenFromCookieStore(
  request: NextRequest,
  getCookie: (name: string) => { value: string } | undefined
): string | null {
  return resolveRequestBearerToken(
    request,
    getCookie(authCookieName)?.value
  );
}
