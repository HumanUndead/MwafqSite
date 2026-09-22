import { notFound } from 'next/navigation';
import { getDictionary } from '@/i18n/dictionaries';
import { hasLocale } from '@/i18n/config';
import { AuthSplitShell } from '@/modules/auth/components/AuthSplitShell';
import { DeactivateAccountView } from '@/modules/deactivate-account';

interface DeactivateAccountPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ identifier?: string }>;
}

export default async function DeactivateAccountPage({
  params,
  searchParams,
}: DeactivateAccountPageProps) {
  const [{ locale }, { identifier }] = await Promise.all([params, searchParams]);

  if (!hasLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <AuthSplitShell
      locale={locale}
      title={dictionary.auth.deactivateAccount.title}
      subtitle={dictionary.auth.deactivateAccount.description}
      centered
    >
      <DeactivateAccountView initialIdentifier={identifier ?? ''} />
    </AuthSplitShell>
  );
}
