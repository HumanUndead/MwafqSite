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
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';

const navBase =
  'flex w-full min-h-[48px] items-center gap-3 rounded-[14px] px-4 py-3 text-start text-[14.5px] font-semibold no-underline transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] max-[1100px]:px-3.5';

const navActive =
  'bg-[#1e2364] text-white shadow-sm hover:bg-[#1e2364] hover:text-white';

const navIdle = 'text-[#6b7196] hover:bg-[#f2f2f2] hover:text-[#1e2364]';

function routeActive(pathWithoutLocale: string, segment: string): boolean {
  return (
    pathWithoutLocale === segment || pathWithoutLocale.startsWith(`${segment}/`)
  );
}

export function ProfileNavLinks({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const pathWithoutLocale = getPathnameWithoutLocale(pathname);
  const t = useTranslations('profileLayout').nav;

  const personalActive = routeActive(pathWithoutLocale, ROUTES.PERSONAL_INFO);
  const academyActive = routeActive(pathWithoutLocale, ROUTES.ACADEMY_COURSES);
  const reservationsActive = routeActive(
    pathWithoutLocale,
    ROUTES.MY_RESERVATIONS
  );

  return (
    <>
      <Link
        href={`/${locale}${ROUTES.PERSONAL_INFO}`}
        className={cn(navBase, personalActive ? navActive : navIdle)}
        aria-current={personalActive ? 'page' : undefined}
        data-cursor
      >
        <PersonalInfoIcon className='size-[18px] shrink-0 text-current' />
        {t.personalInfo}
      </Link>
      <Link
        href={`/${locale}${ROUTES.ACADEMY_COURSES}`}
        className={cn(navBase, academyActive ? navActive : navIdle)}
        aria-current={academyActive ? 'page' : undefined}
        data-cursor
      >
        <GraduationCapIcon className='size-[18px] shrink-0 text-current' />
        {t.academyCourses}
      </Link>
      <Link
        href={`/${locale}${ROUTES.MY_RESERVATIONS}`}
        className={cn(navBase, reservationsActive ? navActive : navIdle)}
        aria-current={reservationsActive ? 'page' : undefined}
        data-cursor
      >
        <ReservationsChartIcon className='size-[18px] shrink-0 text-current' />
        {t.myReservations}
      </Link>
    </>
  );
}
