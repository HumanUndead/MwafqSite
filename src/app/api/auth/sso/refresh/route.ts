import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requestSsoRefresh } from '@/modules/auth/server/ssoToken';
import {
  clearSsoAuthCookies,
  setSsoTokenCookies,
} from '@/modules/auth/server/ssoCookies';
import { SSO_REFRESH_TOKEN_COOKIE } from '@/modules/auth/sso.shared';
import { SSO_CLIENT_SECRET } from '@/shared/constants/config';

/** Fresh tokens rejected → clear session and tell the client to re-authenticate. */
function sessionExpired(message: string) {
  const response = NextResponse.json(
    { success: false, message, data: null },
    { status: 401 }
  );
  clearSsoAuthCookies(response.cookies);
  return response;
}

export async function POST(request: NextRequest) {
  try {
    if (!SSO_CLIENT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'SSO client secret is not configured', data: null },
        { status: 500 }
      );
    }

    const refreshToken = request.cookies.get(SSO_REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) {
      return sessionExpired('No refresh token');
    }

    const refresh = await requestSsoRefresh(refreshToken);

    if (refresh.status >= 400 || !refresh.result) {
      // Refresh token invalid/expired — force a clean re-login.
      return sessionExpired('Refresh failed');
    }

    const token = refresh.result;
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed',
      data: {
        tokenType: token.tokenType,
        accessTokenExpiresAtUtc: token.accessTokenExpiresAtUtc,
      },
    });

    // Rotate: overwrite access + refresh cookies with the new pair.
    setSsoTokenCookies(response.cookies, token);

    return response;
  } catch (error) {
    console.error('[auth/sso/refresh] Token refresh failed.', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
