import 'server-only';

import type { Locale } from '@/i18n/config';
import type { HomeHeaderContent } from '@/modules/home/home.types';
import { ROUTES } from '@/shared/constants/routes';
import type { User } from '../types/auth.types';

function getFirstName(user: User): string | null {
  const fromField = user.firstName?.trim();
  if (fromField) {
    return fromField;
  }

  const trimmed = user.name.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.split(/\s+/)[0] ?? null;
}

function getAvatarInitials(user: User): string {
  const { firstName, lastName } = user;

  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function withAuthenticatedHeaderState(
  content: HomeHeaderContent,
  user: User | null,
  locale: Locale
): HomeHeaderContent {
  if (!user) {
    return { ...content, userMenu: null };
  }

  const firstName = getFirstName(user);
  const greeting = firstName
    ? locale === 'ar'
      ? `مرحبًا، ${firstName}`
      : `Hi, ${firstName}`
    : locale === 'ar'
      ? 'مرحبًا بعودتك!'
      : 'Welcome back!';

  const avatarSrc = user.img?.trim() || null;

  return {
    ...content,
    primaryAction: null,
    signInAction: null,
    userMenu: {
      greeting,
      avatarSrc,
      avatarInitials: getAvatarInitials(user),
      profileLabel: locale === 'ar' ? 'المعلومات الشخصية' : 'Personal Info',
      profilePath: ROUTES.PERSONAL_INFO,
      signOutLabel: locale === 'ar' ? 'تسجيل الخروج' : 'Sign out',
    },
  };
}
