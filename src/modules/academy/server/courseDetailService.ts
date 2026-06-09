import 'server-only';

import type { EnrolledCourseDetail } from '../types/course.types';
import { academyAuthedRequest } from './academyUpstream';

/** Enrolled course detail (the learning view) for a userCourse. */
export async function fetchEnrolledCourseWithToken(
  token: string,
  userCourseId: number,
  courseId: number,
  locale: string
): Promise<EnrolledCourseDetail> {
  const params = new URLSearchParams({
    UserCourseId: String(userCourseId),
    CourseId: String(courseId),
    culture: locale,
  });

  return academyAuthedRequest<EnrolledCourseDetail>({
    method: 'GET',
    path: `/api/Academy/Course/GetCourseByUserId?${params.toString()}`,
    token,
    fallbackMessage: 'Failed to load course',
  });
}
