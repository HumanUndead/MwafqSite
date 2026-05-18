import 'server-only';

import queryString from 'query-string';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type {
  CourseCategoryListItem,
  CourseCategoryListResponse,
} from '../courseCategory.types';

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
  const url = new URL(
    `/api/Academy/CourseCategory/List?${query}`,
    MWAFQ_API_BASE_URL
  );

  const response = await fetch(url.toString(), {
    cache: 'force-cache',
    next: { revalidate: 300, tags: [`course-category-list-${query}`] },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch course category list: ${response.status}`);
  }

  const body = (await response.json()) as CourseCategoryListResponse;
  return body.value;
}
