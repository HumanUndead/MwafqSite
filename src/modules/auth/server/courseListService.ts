import 'server-only';

import queryString from 'query-string';

import type { CourseListItem } from '../course.types';
import type { PaginatedResponse } from '@/shared/types/api.types';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';

export async function fetchCourseList({
  categoryId,
  featured,
  keyword,
  pageNumber = 1,
  pageSize = 10,
}: {
  categoryId?: number;
  featured?: boolean;
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<CourseListItem>> {
  const params = queryString.stringify(
    { categoryId, featured, keyword, pageNumber, pageSize, status: true },
    { skipNull: true, skipEmptyString: true }
  );
  return fetchWithErrorHandling<PaginatedResponse<CourseListItem>>(
    `/api/Academy/Course/List?${params}`
  );
}
