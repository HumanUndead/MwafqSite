import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setAuthSessionCookie } from '@/modules/auth/server/authSession';
import {
  authCookieName,
  authTokenCookieOptions,
} from '@/modules/auth/server/authService';
import { resolveRequestBearerTokenFromCookieStore } from '@/modules/auth/server/resolveRequestBearerToken';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
  hasUpstreamFailure,
  normalizeUpstreamStatus,
} from '@/modules/auth/server/upstreamAuthResult';
import { performUpstreamTextRequest } from '@/modules/auth/server/upstreamRequest';
import { parseUpstreamUser } from '@/modules/auth/server/upstreamUser';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';

function parseJsonSafe(value: string): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = resolveRequestBearerTokenFromCookieStore(request, (name) =>
      cookieStore.get(name)
    );

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', data: null },
        { status: 401 }
      );
    }

    const endpoint = new URL(
      '/api/Authenticate/Auth/GetUserByToken',
      MWAFQ_API_BASE_URL
    );

    const upstreamResponse = await performUpstreamTextRequest({
      method: 'POST',
      url: endpoint,
      authorization: token,
    });

    const responseText = upstreamResponse.body;
    const payload = parseJsonSafe(responseText);
    const upstreamCode = extractUpstreamCode(payload);

    if (upstreamResponse.status >= 400 || hasUpstreamFailure(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(payload, 'Failed to load user'),
          code: upstreamCode,
          data: null,
        },
        { status: normalizeUpstreamStatus(upstreamResponse.status) }
      );
    }

    const user = parseUpstreamUser(payload, token);
    const { otp: _otp, ...userForSession } = user;

    const response = NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'User loaded successfully'),
      data: userForSession,
    });

    response.cookies.set(authCookieName, token, authTokenCookieOptions);
    setAuthSessionCookie(response.cookies, { token, user: userForSession });

    return response;
  } catch (error) {
    console.error('[auth/get-user-by-token] Request failed.', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
