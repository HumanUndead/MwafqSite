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
    const { identifier, phone } = await request.json();

    if (!identifier || !phone) {
      return NextResponse.json(
        { success: false, message: 'identifier and phone are required', data: null },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(authTokenCookieName)?.value;

    const endpoint = new URL('/api/Company/Company/SendPhoneOtp', MWAFQ_API_BASE_URL);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const upstreamResponse = await fetch(endpoint.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ identifier, phone }),
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
          message: extractUpstreamMessage(payload, 'Failed to send OTP'),
          code: extractUpstreamCode(payload),
          data: null,
        },
        { status: normalizeUpstreamStatus(upstreamResponse.status) }
      );
    }

    return NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'OTP sent successfully'),
      data: payload,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
