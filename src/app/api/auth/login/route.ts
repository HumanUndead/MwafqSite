import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
  extractUpstreamPhoneNumber,
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

export async function POST(request: NextRequest) {
  try {
    const { userName } = await request.json();
    const normalizedUserName =
      typeof userName === 'string' ? userName.trim() : '';

    if (!normalizedUserName) {
      return NextResponse.json(
        { success: false, message: 'Iqama / Passport is required', data: null },
        { status: 400 }
      );
    }

    const endpoint = new URL(
      '/api/Authenticate/Auth/SendOtp',
      MWAFQ_API_BASE_URL
    );
    endpoint.searchParams.set('UserName', normalizedUserName);

    const upstreamResponse = await performUpstreamTextRequest({
      method: 'POST',
      url: endpoint,
    });

    const responseText = upstreamResponse.body;
    const payload = parseJsonSafe(responseText);

    const upstreamCode = extractUpstreamCode(payload);
    const phoneNumber = extractUpstreamPhoneNumber(payload);

    if (upstreamResponse.status >= 400 || hasUpstreamFailure(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(payload, 'Failed to send OTP'),
          code: upstreamCode,
          data: null,
        },
        { status: normalizeUpstreamStatus(upstreamResponse.status) }
      );
    }

    return NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'OTP sent successfully'),
      data: {
        userName: normalizedUserName,
        phoneNumber,
        raw: payload,
      },
    });
  } catch (error) {
    console.error('[auth/login] SendOtp request failed.', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
