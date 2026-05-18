import 'server-only';

import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import type { CourseListItem } from '../course.types';
import {
  PaginatedResponse,
  UpstreamApiResponse,
} from '@/shared/types/api.types';
import queryString from 'query-string';

export async function fetchCourseList({
  categoryId,
  featured,
  pageNumber = 1,
  pageSize = 10,
}: {
  categoryId?: number;
  featured?: boolean;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<CourseListItem>> {
  const params = queryString.stringify(
    { categoryId, featured, pageNumber, pageSize },
    { skipNull: true }
  );
  const url = new URL(`/api/Academy/Course/List?${params}`, MWAFQ_API_BASE_URL);
  const response = await fetch(url.toString());
  const body = (await response.json()) as UpstreamApiResponse<
    PaginatedResponse<CourseListItem>
  >;
  return body.value;
}
