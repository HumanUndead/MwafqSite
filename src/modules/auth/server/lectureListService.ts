import 'server-only';

import queryString from 'query-string';

import type { LectureListItem } from '../lecture.types';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
import type { PaginatedResponse } from '@/shared/types/api.types';

export type FetchLectureListParams = {
  lessonId: number;
};

export async function fetchLectureList(
  params: FetchLectureListParams
): Promise<PaginatedResponse<LectureListItem>> {
  const query = queryString.stringify(
    { LessonId: params.lessonId },
    { skipNull: true }
  );
  return fetchWithErrorHandling<PaginatedResponse<LectureListItem>>(
    `/api/Academy/Lecture/List?${query}`
  );
}
