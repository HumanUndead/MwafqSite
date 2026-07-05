import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { ProfileSidebar } from '@/modules/profile/ProfileSidebar';
import {
  MarketingStickyHeaderOffset,
  marketingAlignedShellClass,
} from '@/shared/components/marketing';
import { cn } from '@/shared/lib/cn';

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
      <div
        className={cn(
          marketingAlignedShellClass,
          'mb-16.5 grid min-h-125 max-w-7xl grid-cols-12 gap-6 pb-20 pt-6',
          'max-[640px]:mb-10 max-[640px]:w-[calc(100%-32px)] max-[640px]:gap-5 max-[640px]:pb-24 max-[640px]:pt-3'
        )}
      >
        <ProfileSidebar locale={locale} />
        <div className='col-span-9 flex min-w-0 flex-col gap-6 max-[1100px]:col-span-12 max-[640px]:gap-5'>
          {children}
        </div>
      </div>
    </MarketingStickyHeaderOffset>
  );
}
