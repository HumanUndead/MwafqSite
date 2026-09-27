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

function extractToken(payload: unknown): string | null {
  if (typeof payload === 'string') {
    return payload.trim() || null;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const candidate = record.value ?? record.Value ?? record.token ?? record.Token;

  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
}

/**
 * Isolated from `/api/auth/otp/verify` on purpose: this flow's token is a
 * short-lived credential for the deactivate-account screen only and must
 * never be written to the site-wide `token`/`mwafq-session` cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const { userName, otp, culture } = await request.json();
    const normalizedUserName = typeof userName === 'string' ? userName.trim() : '';
    const normalizedOtp = typeof otp === 'string' ? otp.trim() : '';
    const normalizedCulture = hasLocale(culture) ? culture : 'en';

    if (!normalizedUserName || !normalizedOtp) {
      return NextResponse.json(
        { success: false, message: 'Identifier and OTP are required', data: null },
        { status: 400 }
      );
    }

    const endpoint = new URL('/api/Authenticate/Auth/VerifyOTP', MWAFQ_API_BASE_URL);
    endpoint.searchParams.set('culture', normalizedCulture);

    const upstreamResponse = await performUpstreamTextRequest({
      method: 'POST',
      url: endpoint,
      authorization: null,
      body: { userName: normalizedUserName, otp: normalizedOtp },
    });

    const payload = parseJsonSafe(upstreamResponse.body);
    const upstreamCode = extractUpstreamCode(payload);

    if (upstreamResponse.status >= 400 || hasUpstreamFailure(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(payload, 'Invalid or expired OTP'),
          code: upstreamCode,
          data: null,
        },
        { status: normalizeUpstreamStatus(upstreamResponse.status) }
      );
    }

    const token = extractToken(payload);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'OTP verified but no token was returned', data: null },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'OTP verified'),
      data: { token },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
