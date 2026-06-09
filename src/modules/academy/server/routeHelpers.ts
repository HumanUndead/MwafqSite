import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveRequestBearerTokenFromCookieStore } from '@/modules/auth/server/resolveRequestBearerToken';
import { AcademyError } from './academyUpstream';

/** Resolve the bearer token from the request cookies, or null. */
export async function resolveAcademyToken(
  request: NextRequest
): Promise<string | null> {
  const cookieStore = await cookies();
  return resolveRequestBearerTokenFromCookieStore(request, (name) =>
    cookieStore.get(name)
  );
}

export function academyUnauthorized(): NextResponse {
  return NextResponse.json(
    { success: false, message: 'Authentication required', data: null },
    { status: 401 }
  );
}

export function academyOk<T>(data: T, message = 'OK'): NextResponse {
  return NextResponse.json({ success: true, message, data });
}

/** Convert a thrown error into a JSON error response. */
export function academyRouteError(error: unknown, label: string): NextResponse {
  if (error instanceof AcademyError) {
    return NextResponse.json(
      { success: false, message: error.message, code: error.code, data: null },
      {
        status: error.status >= 400 && error.status <= 599 ? error.status : 400,
      }
    );
  }

  console.error(`${label} Request failed.`, error);
  return NextResponse.json(
    { success: false, message: 'Internal server error', data: null },
    { status: 500 }
  );
}
