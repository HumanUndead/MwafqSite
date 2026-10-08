'use client';

import { Heart, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType } from 'react';
import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute, getPathnameWithoutLocale } from '@/i18n/routing';
import {
  GraduationCapIcon,
  PersonalInfoIcon,
  ReservationsChartIcon,
} from '@/shared/components/icons/profile';
import { ROUTES, type Route } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';

type NavKey = 'personalInfo' | 'academyCourses' | 'myReservations' | 'family' | 'favorites';

const ITEMS: { key: NavKey; route: Route; Icon: ComponentType<{ className?: string }> }[] = [
  { key: 'personalInfo', route: ROUTES.PERSONAL_INFO, Icon: PersonalInfoIcon },
  { key: 'myReservations', route: ROUTES.MY_RESERVATIONS, Icon: ReservationsChartIcon },
  { key: 'academyCourses', route: ROUTES.ACADEMY_COURSES, Icon: GraduationCapIcon },
  { key: 'family', route: ROUTES.FAMILY, Icon: Users },
  { key: 'favorites', route: ROUTES.FAVORITES, Icon: Heart },
];

function routeActive(pathWithoutLocale: string, segment: string): boolean {
  return pathWithoutLocale === segment || pathWithoutLocale.startsWith(`${segment}/`);
}

export function ProfileNavLinks({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const pathWithoutLocale = getPathnameWithoutLocale(pathname);
  const t = useTranslations('profileLayout').nav;

  return (
    <>
      {ITEMS.map(({ key, route, Icon }) => {
        const active = routeActive(pathWithoutLocale, route);
        return (
          <Link
            key={key}
            href={getLocalizedRoute(locale, route)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex h-10 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 text-[14px] font-semibold transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]',
              'lg:h-11 lg:w-full lg:px-3',
              active
                ? 'bg-[#1e2364] text-white'
                : 'border border-[#e5e7f0] bg-white text-[#4a5078] hover:text-[#1e2364] lg:border-transparent lg:bg-transparent lg:hover:bg-white'
            )}
          >
            <Icon className='hidden size-[18px] shrink-0 lg:block' />
            {t[key]}
          </Link>
        );
      })}
    </>
  );
}
