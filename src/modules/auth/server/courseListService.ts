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
  culture,
}: {
  categoryId?: number;
  featured?: boolean;
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
  /** Academy content language. */
  culture?: string;
}): Promise<PaginatedResponse<CourseListItem>> {
  const params = queryString.stringify(
    {
      categoryId,
      featured,
      keyword,
      pageNumber,
      pageSize,
      status: true,
      // CourseTarget.B2C (2) + CourseTarget.Both (4), like mobile.
      Target: 6,
      culture,
    },
    { skipNull: true, skipEmptyString: true }
  );
  return fetchWithErrorHandling<PaginatedResponse<CourseListItem>>(
    `/api/Academy/Course/List?${params}`
  );
}
