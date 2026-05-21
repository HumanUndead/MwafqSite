import { getTranslations } from '@/i18n/server';
import { getCurrentUser } from '@/modules/auth/server/authSession';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const currentUser = await getCurrentUser();
  const greeting = currentUser
    ? t.greeting.replace('{{name}}', currentUser.name)
    : t.welcome;

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-900'>{t.title}</h1>
      <p className='mt-2 text-gray-600'>{greeting}</p>
    </div>
  );
}
