import { getCurrentUser } from '@/modules/auth/server/authSession';
import { PersonalInfoView } from '@/modules/profile-personal/PersonalInfoView';

export default async function PersonalInfoPage() {
  const sessionUser = await getCurrentUser();
  return <PersonalInfoView sessionUser={sessionUser} />;
}
