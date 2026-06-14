import 'server-only';

import type { UpstreamApiResponse } from '@/shared/types/api.types';
import type {
  AcademyCourse,
  AcademyCourseRow,
  AcademyMyCoursesPage,
} from '../types/academy.types';

function resolveImageSrc(course: AcademyCourse): string {
  const path =
    course.fullAttachmentsPath || course.lastLecture?.fullAttachmentsPath || '';

  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

export function parseMyCoursesPayload(payload: unknown): AcademyCourse[] {
  const data = (payload as UpstreamApiResponse<AcademyMyCoursesPage>).value
    ?.data;
  return Array.isArray(data) ? data : [];
}

export function parseMyCoursesPage(
  payload: unknown
): AcademyMyCoursesPage | null {
  const value = (payload as UpstreamApiResponse<AcademyMyCoursesPage>).value;
  if (!value) {
    return null;
  }
  return {
    ...value,
    data: parseMyCoursesPayload(payload),
  };
}

export function mapAcademyCourseToRow(
  course: AcademyCourse,
  index: number
): AcademyCourseRow {
  return {
    id: String(course.id),
    enrollmentId: course.id,
    courseId: course.courseId,
    title: course.courseName,
    description: course.courseDescription,
    imageSrc: resolveImageSrc(course),
    imageAlt: course.courseName,
    progress: course.progressPercent,
    rating: 4.5,
    reviewCount: 0,
    transitionDelay: Math.min(index * 0.08, 0.24),
    companyName: course.companyName,
    isCourseCompleted: course.isCourseCompleted,
    isLocked: course.isLocked,
    totalLectures: course.totalLectures,
    totalHours: course.totalHours,
  };
}
