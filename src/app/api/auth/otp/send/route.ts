import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
  hasUpstreamFailure,
  normalizeUpstreamStatus,
} from '@/modules/auth/server/upstreamAuthResult';
import { createEmailOtp } from '@/modules/auth/server/otpStore';
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
    const { email, userName } = await request.json();

    if (typeof userName === 'string' && userName.trim()) {
      const endpoint = new URL(
        '/api/Authenticate/Auth/SendOtp',
        MWAFQ_API_BASE_URL
      );
      endpoint.searchParams.set('UserName', userName.trim());

      const upstreamResponse = await performUpstreamTextRequest({
        method: 'POST',
        url: endpoint,
      });

      const responseText = upstreamResponse.body;
      const payload = parseJsonSafe(responseText);

      const upstreamCode = extractUpstreamCode(payload);

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
          userName: userName.trim(),
          raw: payload,
        },
      });
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required', data: null },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    createEmailOtp(otp, email);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      data: null,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
