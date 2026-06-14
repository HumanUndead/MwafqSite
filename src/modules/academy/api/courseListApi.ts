import { http } from '@/shared/lib/http';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { CourseListItem } from '@/modules/auth/course.types';

export type FetchCourseListParams = {
  categoryId?: number;
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
};

export async function fetchCourseListClient(
  params: FetchCourseListParams = {}
): Promise<PaginatedResponse<CourseListItem>> {
  const query = new URLSearchParams();
  if (params.categoryId) query.set('categoryId', String(params.categoryId));
  if (params.keyword) query.set('keyword', params.keyword);
  if (params.pageNumber) query.set('pageNumber', String(params.pageNumber));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));

  const res = await http.get<PaginatedResponse<CourseListItem>>(
    `/api/academy/courses?${query.toString()}`
  );
  return res.data;
}
