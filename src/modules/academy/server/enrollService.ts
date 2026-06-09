import 'server-only';

import { academyAuthedRequest } from './academyUpstream';

/** Register the user for a course; returns the created userCourseId. */
export async function createUserCourseWithToken(
  token: string,
  courseId: number,
  selectedService: number
): Promise<number> {
  const formData = new FormData();
  formData.append('CourseId', String(courseId));
  formData.append('SelectedService', String(selectedService));

  return academyAuthedRequest<number>({
    method: 'POST',
    path: '/api/Academy/UserServices/CreateUserCourse',
    token,
    body: formData,
    fallbackMessage: 'Failed to create user course',
  });
}
