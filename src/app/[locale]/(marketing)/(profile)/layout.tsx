import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { ProfileSidebar } from '@/modules/profile/ProfileSidebar';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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
      <div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 pb-20 pt-4 sm:px-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pt-8'>
        <ProfileSidebar locale={locale} />
        <div className='flex min-w-0 flex-col gap-6'>{children}</div>
      </div>
    </MarketingStickyHeaderOffset>
  );
}
