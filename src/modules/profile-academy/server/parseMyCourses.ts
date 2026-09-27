import 'server-only';

import { courseAmountOwed } from '@/shared/lib/coursePlan.shared';
import type { AcademyCourse, AcademyCourseRow } from '../types/academy.types';

/** MyCourses `payment.status` for an unfinished checkout. */
const PAYMENT_STATUS_PENDING = 1;

export function mapAcademyCourseToRow(
  course: AcademyCourse,
  index: number
): AcademyCourseRow {
  const awaitingPayment = course.payment?.status === PAYMENT_STATUS_PENDING;
  return {
    id: String(course.id),
    enrollmentId: course.id,
    courseId: course.courseId,
    title: course.courseName,
    description: course.courseDescription ?? '',
    progress: Math.max(0, Math.min(100, Math.round(course.progressPercent || 0))),
    transitionDelay: Math.min(index * 0.08, 0.24),
    companyName: course.companyName,
    isCourseCompleted: course.isCourseCompleted,
    isLocked: course.isLocked === true,
    totalLectures: course.totalLectures,
    totalHours: course.totalHours,
    rank: course.rank,
    lastLectureName: course.lastLecture?.name ?? null,
    awaitingPayment,
    amountOwed: awaitingPayment && course.payment ? courseAmountOwed(course.payment) : 0,
  };
}
