import type { ApiResponse } from '@/shared/types/api.types';
import { getAuthTokenFromDocumentCookie } from '@/shared/lib/authCookie';

export class ApiError extends Error {
  code: string | null;
  status: number | null;

  constructor(
    message: string,
    code: string | null = null,
    status: number | null = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/** Local server route that refreshes the SSO tokens (rotates the httpOnly cookies). */
const REFRESH_ENDPOINT = '/api/auth/sso/refresh';
/** Where to send the user when the session can no longer be refreshed. */
const LOGIN_PATH = '/login';
/** Clears the auth cookies server-side. */
const LOGOUT_ENDPOINT = '/api/auth/logout';
/** Persisted zustand auth store key (see `useAuthStore`). */
const AUTH_STORAGE_KEY = 'auth-storage';
/** A 401 here means bad credentials / OTP, not an expired session. */
const AUTH_FLOW_PREFIXES = [
  '/api/auth/login',
  '/api/auth/otp',
  REFRESH_ENDPOINT,
];

class HttpClient {
  /**
   * Single-flight refresh: concurrent 401s share ONE refresh call so a rotated
   * refresh token is never spent twice. Null when no refresh is in flight.
   */
  private refreshPromise: Promise<boolean> | null = null;

  private isFormData(value: unknown): value is FormData {
    return typeof FormData !== 'undefined' && value instanceof FormData;
  }

  private extractErrorCode(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const record = payload as Record<string, unknown>;
    const candidate = record.code;

    return typeof candidate === 'string' && candidate.trim()
      ? candidate.trim()
      : null;
  }

  private applyBearerFromCookie(headers: Headers) {
    if (headers.has('Authorization')) {
      return;
    }

    const token = getAuthTokenFromDocumentCookie();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  /**
   * Refresh once for all concurrent callers. Returns true if the session was
   * refreshed (new access-token cookie is set), false if it could not be.
   */
  private refreshSession(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = fetch(REFRESH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: '{}',
      })
        .then((res) => res.ok)
        .catch(() => false)
        .finally(() => {
          this.refreshPromise = null;
        });
    }
    return this.refreshPromise;
  }

  /** True once a logout redirect started, so parallel 401s don't repeat it. */
  private loggingOut = false;

  private isAuthFlow(endpoint: string): boolean {
    return AUTH_FLOW_PREFIXES.some((prefix) => endpoint.startsWith(prefix));
  }

  /** Session is gone: clear cookies + persisted user, then go to login. */
  private async logoutAndRedirect() {
    if (typeof window === 'undefined' || this.loggingOut) {
      return;
    }
    this.loggingOut = true;

    await fetch(LOGOUT_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => undefined);
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Storage blocked; the reload still drops the in-memory user.
    }

    const { pathname, search } = window.location;
    const locale = pathname.split('/')[1] || 'en';
    const loginPath = `/${locale}${LOGIN_PATH}`;
    if (pathname.startsWith(loginPath)) {
      this.loggingOut = false;
      return;
    }
    const redirect = encodeURIComponent(`${pathname}${search}`);
    window.location.assign(`${loginPath}?redirect=${redirect}`);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers);
    if (!this.isFormData(options.body) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    this.applyBearerFromCookie(headers);

    const response = await fetch(endpoint, {
      headers,
      credentials: 'include',
      ...options,
    });

    // Access token likely expired — refresh once, then retry the request.
    const isSessionCall =
      typeof window !== 'undefined' && !this.isAuthFlow(endpoint);

    if (response.status === 401 && retry && isSessionCall) {
      const refreshed = await this.refreshSession();

      if (refreshed) {
        // Drop the stale Authorization so the retry picks up the new cookie.
        const retryHeaders = new Headers(options.headers);
        return this.request<T>(
          endpoint,
          { ...options, headers: retryHeaders },
          false
        );
      }

      // Could not refresh → session is gone. Log out and go to login.
      await this.logoutAndRedirect();
      throw new ApiError('Session expired', 'SESSION_EXPIRED', 401);
    }

    // Still 401 after a successful refresh → treat the session as gone.
    if (response.status === 401 && isSessionCall) {
      await this.logoutAndRedirect();
      throw new ApiError('Session expired', 'SESSION_EXPIRED', 401);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Request failed',
        this.extractErrorCode(data),
        response.status
      );
    }

    return data;
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown, options?: RequestInit) {
    const isFormData = this.isFormData(body);

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: unknown, options?: RequestInit) {
    const isFormData = this.isFormData(body);

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const http = new HttpClient();
