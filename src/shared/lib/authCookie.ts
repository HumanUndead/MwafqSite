import { authTokenCookieName } from '@/modules/auth/session.shared';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Reads a cookie value in the browser (`document.cookie`). Returns null on the server. */
export function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${escapeRegExp(name)}=([^;]*)`)
  );

  if (!match?.[1]) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]).trim() || null;
  } catch {
    return match[1].trim() || null;
  }
}

export function getAuthTokenFromDocumentCookie(): string | null {
  return getCookieValue(authTokenCookieName);
}
