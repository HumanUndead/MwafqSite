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
const PAGE_SIZE = 20;
/** Safety cap: 10 pages × 20 courses. */
const MAX_PAGES = 10;

function fetchMyCoursesPage(
  pageNumber: number,
  culture?: string
): Promise<AcademyMyCoursesPage | null> {
  const query = queryString.stringify(
    { pageNumber, pageSize: PAGE_SIZE, culture },
    { skipNull: true, skipEmptyString: true }
  );
  return fetchWithErrorHandling<AcademyMyCoursesPage | null>(
    `${MY_COURSES_ENDPOINT}?${query}`
  );
}

/** Every enrolled course (all pages). */
export async function fetchMyCourses(culture?: string): Promise<AcademyCourse[]> {
  const first = await fetchMyCoursesPage(1, culture);
  const courses = Array.isArray(first?.data) ? [...first.data] : [];
  const totalPages = Math.min(first?.totalPages ?? 1, MAX_PAGES);
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchMyCoursesPage(page, culture);
    if (Array.isArray(next?.data)) courses.push(...next.data);
  }
  return courses;
}

/** UI rows for `AcademyCoursesView`. */
export async function getMyCourses(culture?: string): Promise<AcademyCourseRow[]> {
  const courses = await fetchMyCourses(culture);
  return courses.map((course, index) => mapAcademyCourseToRow(course, index));
}
