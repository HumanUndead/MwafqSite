import type { Route } from '@/shared/constants/routes'
import { defaultLocale, hasLocale, type Locale } from './config'

export function getLocalizedRoute(locale: Locale, route: Route): string {
  return route === '/' ? `/${locale}` : `/${locale}${route}`
}

export function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split('/')
  const maybeLocale = segments[1]

  if (!maybeLocale || !hasLocale(maybeLocale)) {
    return pathname || '/'
  }

  const nextPath = `/${segments.slice(2).join('/')}`.replace(/\/+/g, '/')
  return nextPath === '/' ? '/' : nextPath.replace(/\/$/, '') || '/'
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const maybeLocale = pathname.split('/')[1]
  return maybeLocale && hasLocale(maybeLocale) ? maybeLocale : null
}

export function localizePathname(pathname: string, locale: Locale): string {
  const basePath = getPathnameWithoutLocale(pathname)
  return basePath === '/' ? `/${locale}` : `/${locale}${basePath}`
}

export function resolveLocale(value?: string | null): Locale {
  return value && hasLocale(value) ? value : defaultLocale
}
