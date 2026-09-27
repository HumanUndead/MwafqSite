import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
  hasUpstreamFailure,
  normalizeUpstreamStatus,
} from '@/modules/auth/server/upstreamAuthResult';
import { performUpstreamTextRequest } from '@/modules/auth/server/upstreamRequest';
import { parseUpstreamUser } from '@/modules/auth/server/upstreamUser';
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
 * Isolated from `/api/auth/get-user-by-token`: takes the token explicitly
 * from the request's own Authorization header (this flow's in-memory token,
 * not the `token` cookie) and never writes any session cookie back.
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

    const endpoint = new URL('/api/Authenticate/Auth/GetUserByToken', MWAFQ_API_BASE_URL);

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
          message: extractUpstreamMessage(payload, 'Failed to load user'),
          code: upstreamCode,
          data: null,
        },
        { status: normalizeUpstreamStatus(upstreamResponse.status) }
      );
    }

    const user = parseUpstreamUser(payload, token);
    const { otp: _otp, ...userForResponse } = user;

    return NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'User loaded successfully'),
      data: userForResponse,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
