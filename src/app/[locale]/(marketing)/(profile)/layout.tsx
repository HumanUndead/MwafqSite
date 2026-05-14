import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { ProfileSidebar } from '@/modules/profile/ProfileSidebar';

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ProfileLayout({
  children,
  params,
}: ProfileLayoutProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;

  return (
    <div className="mx-auto my-[66px] grid min-h-[500px] max-w-[90%] grid-cols-12 gap-6 py-20">
      <ProfileSidebar locale={locale} />
      <div className="col-span-9 flex flex-col gap-6">{children}</div>
    </div>
  );
}
