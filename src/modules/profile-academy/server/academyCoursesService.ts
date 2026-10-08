import 'server-only';

import queryString from 'query-string';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import type {
  AcademyCourse,
  AcademyCourseRow,
  AcademyMyCoursesPage,
} from '../types/academy.types';
import { mapAcademyCourseToRow } from './parseMyCourses';

const MY_COURSES_ENDPOINT = '/api/Academy/UserServices/MyCourses';
/** Same shape as `MyCourses`, for a family member (Accepted link only). */
const USER_COURSES_ENDPOINT = '/api/Academy/UserServices/UserCourses';
const PAGE_SIZE = 20;
/** Safety cap: 10 pages × 20 courses. */
const MAX_PAGES = 10;

function fetchMyCoursesPage(
  pageNumber: number,
  culture?: string,
  userId?: string
): Promise<AcademyMyCoursesPage | null> {
  const query = queryString.stringify(
    { pageNumber, pageSize: PAGE_SIZE, culture, userId },
    { skipNull: true, skipEmptyString: true }
  );
  const endpoint = userId ? USER_COURSES_ENDPOINT : MY_COURSES_ENDPOINT;
  return fetchWithErrorHandling<AcademyMyCoursesPage | null>(
    `${endpoint}?${query}`
  );
}

/** Every enrolled course (all pages). Pass `userId` for a family member. */
export async function fetchMyCourses(
  culture?: string,
  userId?: string
): Promise<AcademyCourse[]> {
  const first = await fetchMyCoursesPage(1, culture, userId);
  const courses = Array.isArray(first?.data) ? [...first.data] : [];
  const totalPages = Math.min(first?.totalPages ?? 1, MAX_PAGES);
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchMyCoursesPage(page, culture, userId);
    if (Array.isArray(next?.data)) courses.push(...next.data);
  }
  return courses;
}

/** UI rows for `AcademyCoursesView`. */
export async function getMyCourses(
  culture?: string,
  userId?: string
): Promise<AcademyCourseRow[]> {
  const courses = await fetchMyCourses(culture, userId);
  return courses.map((course, index) => mapAcademyCourseToRow(course, index));
}
