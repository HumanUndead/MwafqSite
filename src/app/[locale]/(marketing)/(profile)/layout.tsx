import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { ProfileSidebar } from '@/modules/profile/ProfileSidebar';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

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
    <MarketingStickyHeaderOffset variant='detail'>
      <div className='mx-auto mb-[66px] grid min-h-[500px] grid-cols-12 gap-6 py-20 max-w-[1280px]'>
        <ProfileSidebar locale={locale} />
        <div className='col-span-9 flex flex-col gap-6'>{children}</div>
      </div>
    </MarketingStickyHeaderOffset>
  );
}
