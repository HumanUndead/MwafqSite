import type { PersonalStatistics } from '@/modules/profile-personal/types/personalStats.types';

export type PersonalInfoStats = {
  reservationsCount: string;
  coursesOngoingCount: string;
  coursesFinishedCount: string;
};

export function personalStatisticsToInfoStats(
  data: PersonalStatistics
): PersonalInfoStats {
  return {
    reservationsCount: String(data.totalReservations),
    coursesOngoingCount: String(data.ongoingCoursesCount),
    coursesFinishedCount: String(data.finishedCoursesCount),
  };
}
