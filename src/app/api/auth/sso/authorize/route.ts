import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  buildAuthorizeBody,
  deriveCodeChallenge,
  extractAuthorizeRedirectUrl,
  generateCodeVerifier,
  requestSsoAuthorize,
} from '@/modules/auth/server/ssoAuthorize';
import {
  SSO_CODE_VERIFIER_COOKIE,
  SSO_STATE_COOKIE,
  SSO_STATE_VALUE,
} from '@/modules/auth/sso.shared';
import { SITE_URL, SSO_CLIENT_ID } from '@/shared/constants/config';

const PKCE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 10, // 10 minutes to complete the SSO round-trip.
};

/** Current site origin — where SSO returns after login. */
function resolveRedirectUri(request: NextRequest): string {
  const origin = request.nextUrl.origin;
  if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    return origin;
  }
  return origin || SITE_URL;
}

export async function POST(request: NextRequest) {
  try {
    if (!SSO_CLIENT_ID) {
      return NextResponse.json(
        { success: false, message: 'SSO client id is not configured', data: null },
        { status: 500 }
      );
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = deriveCodeChallenge(codeVerifier);
    const state = SSO_STATE_VALUE;
    const redirectUri = resolveRedirectUri(request);

    const body = buildAuthorizeBody({ redirectUri, codeChallenge, state });
    const upstream = await requestSsoAuthorize(body);

    if (upstream.status >= 400) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to start SSO login',
          data: upstream.payload,
        },
        { status: 502 }
      );
    }

    const redirectUrl = extractAuthorizeRedirectUrl(upstream.payload);

    const response = NextResponse.json({
      success: true,
      message: 'SSO authorize started',
      data: { redirectUrl, raw: upstream.payload },
    });

    // Store the unhashed verifier + state securely for the callback step.
    response.cookies.set(SSO_CODE_VERIFIER_COOKIE, codeVerifier, PKCE_COOKIE_OPTIONS);
    response.cookies.set(SSO_STATE_COOKIE, state, PKCE_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('[auth/sso/authorize] SSO authorize failed.', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
