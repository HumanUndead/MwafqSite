import { notFound } from 'next/navigation';
import { getDictionary } from '@/i18n/dictionaries';
import { hasLocale } from '@/i18n/config';
import { LoginForm } from '@/modules/auth';
import { AuthSplitShell } from '@/modules/auth/components/AuthSplitShell';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <AuthSplitShell
      locale={locale}
      title={dictionary.auth.login.welcomeTitle}
      subtitle={dictionary.auth.login.welcomeBack}
      centered
    >
      <LoginForm />
    </AuthSplitShell>
  );
}
