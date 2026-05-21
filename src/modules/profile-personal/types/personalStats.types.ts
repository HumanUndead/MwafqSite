import type { UpstreamApiResponse } from '@/shared/types/api.types';

/** Course row in `finishedCourses` / `ongoingCourses` from GetMyStats. */
export interface PersonalStatsCourse {
  userCourseId: number;
  courseId: number;
  courseName: string;
  status: number;
  isArkanBooked: boolean;
  isSadadBooked: boolean;
  isUserPassExam: boolean;
  isCourseCompleted: boolean;
  progressPercent: number;
  courseStartTime: string | null;
  courseCompleteTime: string | null;
}

/**
 * Reservation row in GetMyStats `reservations`.
 * Refine when the API returns non-empty samples.
 */
export type PersonalStatsReservation = Record<string, unknown>;

/** `value` from `GET /api/Academy/UserServices/GetMyStats`. */
export interface PersonalStatistics {
  totalReservations: number;
  finishedCoursesCount: number;
  ongoingCoursesCount: number;
  finishedCourses: PersonalStatsCourse[];
  ongoingCourses: PersonalStatsCourse[];
  reservations: PersonalStatsReservation[];
}

/** Full upstream JSON envelope for GetMyStats. */
export type PersonalStatisticsResponse =
  UpstreamApiResponse<PersonalStatistics>;
