import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requestSsoToken } from '@/modules/auth/server/ssoToken';
import { setSsoTokenCookies } from '@/modules/auth/server/ssoCookies';
import { buildAuthResponseFromToken } from '@/modules/auth/server/authService';
import { setAuthSessionCookie } from '@/modules/auth/server/authSession';
import {
  extractUpstreamMessage,
  hasUpstreamFailure,
} from '@/modules/auth/server/upstreamAuthResult';
import {
  buildSsoApiRedirectUri,
  resolveSsoRedirectOrigin,
  SSO_CODE_VERIFIER_COOKIE,
  SSO_REDIRECT_URI_COOKIE,
  SSO_STATE_COOKIE,
} from '@/modules/auth/sso.shared';
import {
  INFRASTRUCTURE_URL,
  SITE_URL,
  SSO_CLIENT_SECRET,
} from '@/shared/constants/config';

export async function POST(request: NextRequest) {
  try {
    if (!SSO_CLIENT_SECRET || !INFRASTRUCTURE_URL) {
      return NextResponse.json(
        { success: false, message: 'SSO is not configured', data: null },
        { status: 500 }
      );
    }

    const { code } = await request.json().catch(() => ({}));
    if (typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { success: false, message: 'Authorization code is required', data: null },
        { status: 400 }
      );
    }

    const codeVerifier = request.cookies.get(SSO_CODE_VERIFIER_COOKIE)?.value;
    const storedRedirectUri = request.cookies.get(
      SSO_REDIRECT_URI_COOKIE
    )?.value;

    if (!codeVerifier || !storedRedirectUri) {
      return NextResponse.json(
        {
          success: false,
          message: 'SSO session expired. Please sign in again.',
          data: null,
        },
        { status: 400 }
      );
    }

    // Security: the stored redirectUri must be the exact value we sent.
    const expectedRedirectUri = buildSsoApiRedirectUri(
      resolveSsoRedirectOrigin(request.nextUrl.origin, SITE_URL)
    );
    if (storedRedirectUri !== expectedRedirectUri) {
      return NextResponse.json(
        { success: false, message: 'Redirect URI mismatch', data: null },
        { status: 400 }
      );
    }

    const exchange = await requestSsoToken({
      code: code.trim(),
      codeVerifier,
      redirectUri: storedRedirectUri,
    });

    if (
      exchange.status >= 400 ||
      hasUpstreamFailure(exchange.payload) ||
      !exchange.result
    ) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(
            exchange.payload,
            'Token exchange failed'
          ),
          data: exchange.payload,
        },
        { status: 502 }
      );
    }

    const token = exchange.result;
    // Build the user session from the JWT claims (name, phone, etc.).
    // Empty fallback — the identifier comes from the token's `name` claim.
    const authResponse = buildAuthResponseFromToken(token.accessToken, '');

    const response = NextResponse.json({
      success: true,
      message: 'Signed in',
      data: {
        tokenType: token.tokenType,
        accessTokenExpiresAtUtc: token.accessTokenExpiresAtUtc,
        user: authResponse.user,
      },
    });

    setSsoTokenCookies(response.cookies, token);
    setAuthSessionCookie(response.cookies, authResponse);

    // One-time PKCE cookies are consumed — clear them.
    response.cookies.delete(SSO_CODE_VERIFIER_COOKIE);
    response.cookies.delete(SSO_STATE_COOKIE);
    response.cookies.delete(SSO_REDIRECT_URI_COOKIE);

    return response;
  } catch (error) {
    console.error('[auth/sso/token] Token exchange failed.', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
