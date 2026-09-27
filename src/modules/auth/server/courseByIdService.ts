import 'server-only';

import queryString from 'query-string';

import type { CourseListItem, CourseViewItem } from '../course.types';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';

export async function fetchCourseById(
  id: number,
  /** Academy content language. */
  locale?: string
): Promise<CourseListItem> {
  const params = queryString.stringify({ id, culture: locale });
  return fetchWithErrorHandling<CourseListItem>(
    `/api/Academy/Course/GetById?${params}`
  );
}

export async function fetchCourseViewById(
  id: number,
  /** Academy content language. */
  locale?: string
): Promise<CourseViewItem> {
  const params = queryString.stringify({ courseId: id, culture: locale });
  return fetchWithErrorHandling<CourseViewItem>(
    `/api/Academy/Course/View?${params}`
  );
}
