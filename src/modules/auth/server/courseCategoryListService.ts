import 'server-only';

import queryString from 'query-string';

import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { CourseCategoryListItem } from '../courseCategory.types';

export type FetchCourseCategoryListParams = {
  pageNumber?: number;
  pageSize?: number;
  parentId?: number | null;
};

export async function fetchCourseCategoryList(
  params: FetchCourseCategoryListParams = {}
): Promise<PaginatedResponse<CourseCategoryListItem>> {
  const query = queryString.stringify(
    {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      parentId: params.parentId,
    },
    { skipNull: true }
  );
  return fetchWithErrorHandling<PaginatedResponse<CourseCategoryListItem>>(
    `/api/Academy/CourseCategory/List?${query}`,
    {
      cache: 'no-store',
    }
  );
}
