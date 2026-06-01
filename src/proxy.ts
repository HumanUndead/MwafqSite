import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, hasLocale, localeCookieName } from '@/i18n/config';
import {
  getLocaleFromPathname,
  getPathnameWithoutLocale,
  localizePathname,
} from '@/i18n/routing';
import {
  authSessionCookieName,
  authTokenCookieName,
} from '@/modules/auth/session.shared';
import { ROUTES } from '@/shared/constants/routes';

const PROTECTED_PREFIXES = [
  ROUTES.DASHBOARD,
  ROUTES.PERSONAL_INFO,
  ROUTES.ACADEMY_COURSES,
  ROUTES.MY_RESERVATIONS,
];

const PROTECTED_PATTERNS = [
  /^\/services\/\d+\/buy(\/|$)/,
  /^\/courses\/learn(\/|$)/,
  /^\/courses\/payment\/callback(\/|$)/,
];

const AUTH_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD];
const PUBLIC_FILE = /\.[^/]+$/;

export function proxy(request: NextRequest) {
  const token = request.cookies.get(authTokenCookieName)?.value;
  const authSession = request.cookies.get(authSessionCookieName)?.value;
  const isAuthenticated = Boolean(authSession || token);
  const { pathname } = request.nextUrl;
  const localeFromPath = getLocaleFromPathname(pathname);

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (!localeFromPath) {
    const cookieLocale = request.cookies.get(localeCookieName)?.value;
    const locale =
      cookieLocale && hasLocale(cookieLocale) ? cookieLocale : defaultLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localizePathname(pathname, locale);
    return NextResponse.redirect(redirectUrl);
  }

  const appPathname = getPathnameWithoutLocale(pathname);
  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => appPathname.startsWith(prefix)) ||
    PROTECTED_PATTERNS.some((pattern) => pattern.test(appPathname));
  const isAuthPath = AUTH_PATHS.includes(
    appPathname as (typeof AUTH_PATHS)[number]
  );

  if (isProtected && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localizePathname(ROUTES.LOGIN, localeFromPath);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPath && isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localizePathname(ROUTES.DASHBOARD, localeFromPath);
    return NextResponse.redirect(redirectUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-mwafq-locale', localeFromPath);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.cookies.set(localeCookieName, localeFromPath, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
