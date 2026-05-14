'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { getPathnameWithoutLocale } from '@/i18n/routing';
import {
  GraduationCapIcon,
  PersonalInfoIcon,
  ReservationsChartIcon,
} from '@/shared/components/icons/profile';
import { cn } from '@/shared/lib/cn';

const navBase =
  'flex w-full items-center gap-3 rounded-[18px] px-4 py-[14px] text-left text-[14.5px] font-semibold no-underline transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]';

const navActive = 'bg-[#1e2364] text-white hover:bg-[#1e2364] hover:text-white';

const navIdle = 'text-[#6b7196] hover:bg-[#f2f2f2] hover:text-[#1e2364]';

function routeActive(pathWithoutLocale: string, segment: string): boolean {
  return (
    pathWithoutLocale === segment ||
    pathWithoutLocale.startsWith(`${segment}/`)
  );
}

export function ProfileNavLinks({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const pathWithoutLocale = getPathnameWithoutLocale(pathname);
  const t = useTranslations('profileLayout').nav;

  const personalActive = routeActive(pathWithoutLocale, '/personal-info');
  const academyActive = routeActive(pathWithoutLocale, '/academy-courses');
  const reservationsActive = routeActive(
    pathWithoutLocale,
    '/my-reservations',
  );

  return (
    <>
      <Link
        href={`/${locale}/personal-info`}
        className={cn(navBase, personalActive ? navActive : navIdle)}
        aria-current={personalActive ? 'page' : undefined}
        data-cursor
      >
        <PersonalInfoIcon className="size-[18px] shrink-0 text-current" />
        {t.personalInfo}
      </Link>
      <Link
        href={`/${locale}/academy-courses`}
        className={cn(navBase, academyActive ? navActive : navIdle)}
        aria-current={academyActive ? 'page' : undefined}
        data-cursor
      >
        <GraduationCapIcon className="size-[18px] shrink-0 text-current" />
        {t.academyCourses}
      </Link>
      <Link
        href={`/${locale}/my-reservations`}
        className={cn(
          navBase,
          reservationsActive ? navActive : navIdle,
        )}
        aria-current={reservationsActive ? 'page' : undefined}
        data-cursor
      >
        <ReservationsChartIcon className="size-[18px] shrink-0 text-current" />
        {t.myReservations}
      </Link>
    </>
  );
}
