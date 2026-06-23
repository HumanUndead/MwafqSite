import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { RegisterFlow } from '@/modules/auth';
import { AuthSplitShell } from '@/modules/auth/components/AuthSplitShell';
import { getCurrentUser } from '@/modules/auth/server/authSession';
import { getRegisterPageContent } from '@/modules/auth/server/registerPageContentService';

interface RegisterPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const [content, currentUser] = await Promise.all([
    getRegisterPageContent(locale, dictionary),
    getCurrentUser(),
  ]);

  const isCompanyOnly = Boolean(currentUser);

  return (
    <AuthSplitShell
      locale={locale}
      aside={{ ...content, stats: [] }}
      title={
        isCompanyOnly
          ? dictionary.company.create.title
          : dictionary.auth.register.title
      }
      subtitle={
        isCompanyOnly
          ? dictionary.company.create.subtitle
          : dictionary.auth.register.description
      }
      wideForm
    >
      <RegisterFlow initialStep={isCompanyOnly ? 'company' : 'register'} />
    </AuthSplitShell>
  );
}
