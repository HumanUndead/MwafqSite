import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  buildAuthorizeBody,
  deriveCodeChallenge,
  extractAuthorizeResult,
  generateCodeVerifier,
  requestSsoAuthorize,
} from '@/modules/auth/server/ssoAuthorize';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
  hasUpstreamFailure,
} from '@/modules/auth/server/upstreamAuthResult';
import {
  buildSsoApiRedirectUri,
  buildSsoLoginUrl,
  resolveSsoRedirectOrigin,
  SSO_CODE_VERIFIER_COOKIE,
  SSO_REDIRECT_URI_COOKIE,
  SSO_STATE_COOKIE,
  SSO_STATE_VALUE,
} from '@/modules/auth/sso.shared';
import {
  INFRASTRUCTURE_URL,
  MWAFQ_SSO_LOGIN_URL,
  SITE_URL,
  SSO_CLIENT_ID,
} from '@/shared/constants/config';

const PKCE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 10, // 10 minutes to complete the SSO round-trip.
};

export async function POST(request: NextRequest) {
  try {
    if (!SSO_CLIENT_ID || !INFRASTRUCTURE_URL || !MWAFQ_SSO_LOGIN_URL) {
      return NextResponse.json(
        { success: false, message: 'SSO is not configured', data: null },
        { status: 500 }
      );
    }

    // Fixed `en` page — the backend echoes this exact URL back and rejects
    // anything different. Prod uses the canonical site URL; dev uses the current
    // origin (localhost) so the flow can be tested locally.
    const origin = resolveSsoRedirectOrigin(request.nextUrl.origin, SITE_URL);
    const redirectUri = buildSsoApiRedirectUri(origin);

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = deriveCodeChallenge(codeVerifier);
    const state = SSO_STATE_VALUE;

    const body = buildAuthorizeBody({ redirectUri, codeChallenge, state });
    const upstream = await requestSsoAuthorize(body);

    const result = extractAuthorizeResult(upstream.payload);

    if (
      upstream.status >= 400 ||
      hasUpstreamFailure(upstream.payload) ||
      !result
    ) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(
            upstream.payload,
            'Failed to start SSO login'
          ),
          code: extractUpstreamCode(upstream.payload),
          data: upstream.payload,
        },
        { status: 502 }
      );
    }

    const loginUrl = buildSsoLoginUrl({
      authUrl: MWAFQ_SSO_LOGIN_URL,
      authorizationRequestId: result.authorizationRequestId,
      callbackUrl: redirectUri,
    });

    const response = NextResponse.json({
      success: true,
      message: 'SSO authorize started',
      data: {
        loginUrl,
        authorizationRequestId: result.authorizationRequestId,
        expiresAtUtc: result.expiresAtUtc,
      },
    });

    // Store the unhashed verifier + state + redirectUri securely for the token step.
    response.cookies.set(SSO_CODE_VERIFIER_COOKIE, codeVerifier, PKCE_COOKIE_OPTIONS);
    response.cookies.set(SSO_STATE_COOKIE, state, PKCE_COOKIE_OPTIONS);
    response.cookies.set(SSO_REDIRECT_URI_COOKIE, redirectUri, PKCE_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
