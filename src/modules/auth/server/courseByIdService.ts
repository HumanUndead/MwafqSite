import 'server-only';

import queryString from 'query-string';

import type { CourseListItem, CourseViewItem } from '../course.types';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';

export async function fetchCourseById(id: number): Promise<CourseListItem> {
  const params = queryString.stringify({ id });
  return fetchWithErrorHandling<CourseListItem>(
    `/api/Academy/Course/GetById?${params}`
  );
}

export async function fetchCourseViewById(id: number): Promise<CourseViewItem> {
  const params = queryString.stringify({ courseId: id });
  return fetchWithErrorHandling<CourseViewItem>(
    `/api/Academy/Course/View?${params}`
  );
}
