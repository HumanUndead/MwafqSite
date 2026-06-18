import { notFound } from 'next/navigation';
import { getDictionary } from '@/i18n/dictionaries';
import { hasLocale } from '@/i18n/config';
import { LoginForm } from '@/modules/auth';
import { AuthSplitShell } from '@/modules/auth/components/AuthSplitShell';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirect?: string }>;
}

// Only allow internal, single-slash relative paths to avoid open redirects.
function sanitizeRedirect(redirect?: string): string | undefined {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return undefined;
  }
  return redirect;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const [{ locale }, { redirect }] = await Promise.all([params, searchParams]);

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
      <LoginForm redirectTo={sanitizeRedirect(redirect)} />
    </AuthSplitShell>
  );
}
