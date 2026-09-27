import 'server-only';

import queryString from 'query-string';

import type { Locale } from '@/i18n/config';
import type { CourseListItem, CourseViewItem } from '../course.types';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';

export async function fetchCourseById(
  id: number,
  locale?: Locale
): Promise<CourseListItem> {
  const params = queryString.stringify({ id, culture: locale });
  return fetchWithErrorHandling<CourseListItem>(
    `/api/Academy/Course/GetById?${params}`
  );
}

export async function fetchCourseViewById(
  id: number,
  locale?: Locale
): Promise<CourseViewItem> {
  const params = queryString.stringify({ courseId: id, culture: locale });
  return fetchWithErrorHandling<CourseViewItem>(
    `/api/Academy/Course/View?${params}`
  );
}
