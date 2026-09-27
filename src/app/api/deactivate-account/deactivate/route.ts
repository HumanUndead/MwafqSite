import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasLocale } from '@/i18n/config';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
  hasUpstreamFailure,
  normalizeUpstreamStatus,
} from '@/modules/auth/server/upstreamAuthResult';
import { performUpstreamTextRequest } from '@/modules/auth/server/upstreamRequest';
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

function resolveBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')?.trim();
  if (!authorization) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  const token = (match?.[1] ?? authorization).trim();
  return token || null;
}

/**
 * The token here comes only from this flow's own verify-otp/get-user steps —
 * never from the site-wide `token` cookie — so a visitor's own logged-in
 * session can never be used to deactivate a different identified account.
 */
export async function POST(request: NextRequest) {
  try {
    const token = resolveBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', data: null },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const culture = hasLocale(body?.culture) ? body.culture : 'en';

    const endpoint = new URL('/api/Authenticate/Auth/DeactivateAccount', MWAFQ_API_BASE_URL);
    endpoint.searchParams.set('culture', culture);

    const upstreamResponse = await performUpstreamTextRequest({
      method: 'POST',
      url: endpoint,
      authorization: token,
    });

    const payload = parseJsonSafe(upstreamResponse.body);
    const upstreamCode = extractUpstreamCode(payload);

    if (upstreamResponse.status >= 400 || hasUpstreamFailure(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(payload, 'Failed to delete account'),
          code: upstreamCode,
          data: null,
        },
        { status: normalizeUpstreamStatus(upstreamResponse.status) }
      );
    }

    return NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'Account deleted'),
      data: { deactivated: true },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
