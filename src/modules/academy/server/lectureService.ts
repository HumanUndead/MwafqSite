import 'server-only';

import type { LectureDetail } from '../types/lecture.types';
import { academyAuthedRequest } from './academyUpstream';

/** Lecture detail (with video + attachments) for an enrolled user. */
export async function fetchLectureByUserIdWithToken(
  token: string,
  lectureId: number,
  userCourseId: number,
  locale: string
): Promise<LectureDetail> {
  const params = new URLSearchParams({
    Id: String(lectureId),
    UserCourseId: String(userCourseId),
    culture: locale,
  });

  return academyAuthedRequest<LectureDetail>({
    method: 'GET',
    path: `/api/Academy/Lecture/GetByUserId?${params.toString()}`,
    token,
    fallbackMessage: 'Failed to load lecture',
  });
}

/** Mark a lecture complete for the user course. */
export async function setLectureProgressWithToken(
  token: string,
  lectureId: number,
  userCourseId: number
): Promise<number> {
  const params = new URLSearchParams({
    userCourseId: String(userCourseId),
    LectureId: String(lectureId),
  });

  return academyAuthedRequest<number>({
    method: 'POST',
    path: `/api/Academy/Lecture/SetProgress?${params.toString()}`,
    token,
    body: {},
    fallbackMessage: 'Failed to update progress',
  });
}
