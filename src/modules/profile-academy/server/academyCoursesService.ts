import 'server-only';

import { cookies } from 'next/headers';
import { authCookieName } from '@/modules/auth/server/authService';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
} from '@/modules/auth/server/upstreamAuthResult';
import { performUpstreamTextRequest } from '@/modules/auth/server/upstreamRequest';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import type {
  AcademyCourse,
  AcademyCourseRow,
  AcademyMyCoursesPage,
} from '../types/academy.types';
import {
  mapAcademyCourseToRow,
  parseMyCoursesPage,
  parseMyCoursesPayload,
} from './parseMyCourses';

function parseJsonSafe(value: string): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export class AcademyCoursesError extends Error {
  code: string | null;
  status: number;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = 'AcademyCoursesError';
    this.status = status;
    this.code = code;
  }
}

async function fetchMyCoursesPayloadWithToken(token: string): Promise<unknown> {
  const endpoint = new URL(
    '/api/Academy/UserServices/MyCourses',
    MWAFQ_API_BASE_URL
  );

  const upstreamResponse = await performUpstreamTextRequest({
    method: 'GET',
    url: endpoint,
    authorization: token,
  });

  const payload = parseJsonSafe(upstreamResponse.body);
  const upstreamCode = extractUpstreamCode(payload);

  if (upstreamResponse.status >= 400) {
    throw new AcademyCoursesError(
      extractUpstreamMessage(payload, 'Failed to load courses'),
      upstreamResponse.status,
      upstreamCode
    );
  }

  return payload;
}

/** Fetches courses from `payload.value.data`. */
export async function fetchMyCoursesWithToken(
  token: string
): Promise<AcademyCourse[]> {
  const payload = await fetchMyCoursesPayloadWithToken(token);
  return parseMyCoursesPayload(payload);
}

/** Paginated MyCourses result (`payload.value`). */
export async function fetchMyCoursesPageWithToken(
  token: string
): Promise<AcademyMyCoursesPage | null> {
  const payload = await fetchMyCoursesPayloadWithToken(token);
  return parseMyCoursesPage(payload);
}

/** UI rows for `AcademyCoursesView`. */
export async function fetchMyCourseRowsWithToken(
  token: string
): Promise<AcademyCourseRow[]> {
  const courses = await fetchMyCoursesWithToken(token);
  return courses.map((course, index) => mapAcademyCourseToRow(course, index));
}

/** Server Components: reads `token` cookie and loads course rows for the view. */
export async function getMyCourses(): Promise<AcademyCourseRow[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value?.trim();

  if (!token) {
    return [];
  }

  return fetchMyCourseRowsWithToken(token);
}
