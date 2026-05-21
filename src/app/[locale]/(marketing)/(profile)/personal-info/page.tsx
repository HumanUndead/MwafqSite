import { getCurrentUser } from '@/modules/auth/server/authSession';
import { getPersonalStatistics } from '@/modules/auth/server/profileService';
import { PersonalInfoView } from '@/modules/profile-personal/PersonalInfoView';
import { personalStatisticsToInfoStats } from '@/modules/profile-personal/personalStats.shared';

export default async function PersonalInfoPage() {
  const [sessionUser, personalStats] = await Promise.all([
    getCurrentUser(),
    getPersonalStatistics(),
  ]);

  const stats =
    personalStats != null
      ? personalStatisticsToInfoStats(personalStats)
      : undefined;

  return <PersonalInfoView sessionUser={sessionUser} stats={stats} />;
}
