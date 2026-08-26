import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { authTokenCookieName } from '@/modules/auth/session.shared';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
  hasUpstreamFailure,
  normalizeUpstreamStatus,
} from '@/modules/auth/server/upstreamAuthResult';

export async function POST(request: NextRequest) {
  try {
    const { identifier, phone, otp } = await request.json();

    if (!identifier || !phone || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: 'identifier, phone and otp are required',
          data: null,
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(authTokenCookieName)?.value;

    const endpoint = new URL('/api/Company/Company/VerifyPhoneOtp', MWAFQ_API_BASE_URL);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const upstreamResponse = await fetch(endpoint.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ identifier, phone, otp }),
      cache: 'no-store',
    });

    let payload: unknown = null;
    try {
      payload = await upstreamResponse.json();
    } catch {
      payload = null;
    }

    if (!upstreamResponse.ok || hasUpstreamFailure(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(payload, 'Invalid or expired OTP'),
          code: extractUpstreamCode(payload),
          data: null,
        },
        { status: normalizeUpstreamStatus(upstreamResponse.status) }
      );
    }

    return NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'OTP verified'),
      data: { verified: true, raw: payload },
    });
  } catch (error) {
    console.error('[company/otp/verify] Failed', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
