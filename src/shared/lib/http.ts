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

  private redirectToLogin() {
    if (typeof window === 'undefined') {
      return;
    }
    const segments = window.location.pathname.split('/');
    const locale = segments[1] || 'en';
    window.location.assign(`/${locale}${LOGIN_PATH}`);
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
    if (
      response.status === 401 &&
      retry &&
      endpoint !== REFRESH_ENDPOINT &&
      typeof window !== 'undefined'
    ) {
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

      // Could not refresh → session is gone. Send the user to login.
      this.redirectToLogin();
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
