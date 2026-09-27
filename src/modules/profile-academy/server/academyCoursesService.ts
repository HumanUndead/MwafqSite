import 'server-only';

import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import type {
  AcademyCourse,
  AcademyCourseRow,
  AcademyMyCoursesPage,
} from '../types/academy.types';
import { mapAcademyCourseToRow } from './parseMyCourses';

const MY_COURSES_ENDPOINT = '/api/Academy/UserServices/MyCourses';

/** Paginated MyCourses result (the upstream envelope's `value`). */
function fetchMyCoursesPage(): Promise<AcademyMyCoursesPage | null> {
  return fetchWithErrorHandling<AcademyMyCoursesPage | null>(
    MY_COURSES_ENDPOINT
  );
}

export async function fetchMyCourses(): Promise<AcademyCourse[]> {
  const page = await fetchMyCoursesPage();
  return Array.isArray(page?.data) ? page.data : [];
}

/** UI rows for `AcademyCoursesView`. */
export async function getMyCourses(): Promise<AcademyCourseRow[]> {
  const courses = await fetchMyCourses();
  return courses.map((course, index) => mapAcademyCourseToRow(course, index));
}
