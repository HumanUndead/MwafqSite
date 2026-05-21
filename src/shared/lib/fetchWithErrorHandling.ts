import 'server-only';

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { authTokenCookieName } from '@/modules/auth/session.shared';
import {
  fetchWithErrorHandlingCore,
  type FetchWithErrorHandlingInit,
} from '@/shared/lib/fetchWithErrorHandling.shared';

async function attachBearerFromNextCookies(headers: Headers) {
  if (headers.has('Authorization')) {
    return;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(authTokenCookieName)?.value;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
}

export async function fetchWithErrorHandling<T>(
  url: string,
  options?: FetchWithErrorHandlingInit
): Promise<T> {
  return fetchWithErrorHandlingCore<T>(url, options, {
    attachAuth: attachBearerFromNextCookies,
    onNotFound: () => notFound(),
  });
}
