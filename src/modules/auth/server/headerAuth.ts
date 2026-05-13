import 'server-only'

import type { Locale } from '@/i18n/config'
import type { HomeHeaderContent } from '@/modules/home/home.types'
import { logoutActionPath } from '../headerActions.shared'
import type { User } from '../types/auth.types'

function getFirstName(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return null
  }

  return trimmed.split(/\s+/)[0] ?? null
}

export function withAuthenticatedHeaderState(
  content: HomeHeaderContent,
  user: User | null,
  locale: Locale,
): HomeHeaderContent {
  if (!user) {
    return content
  }

  const firstName = getFirstName(user.name)
  const label = firstName
    ? locale === 'ar'
      ? `مرحبًا، ${firstName}`
      : `Hi, ${firstName}`
    : locale === 'ar'
      ? 'مرحبًا بعودتك!'
      : 'Welcome back!'

  return {
    ...content,
    primaryAction: {
      label: locale === 'ar' ? 'تسجيل الخروج' : 'Logout',
      path: logoutActionPath,
    },
    signInAction: {
      label,
      path: null,
    },
  }
}
