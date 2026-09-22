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

/**
 * Credential gate only — never issues a token or session. A caller must still
 * follow up with `send-otp` + `verify-otp` before anything is authenticated.
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password, culture } = await request.json();
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const normalizedCulture = hasLocale(culture) ? culture : 'en';

    if (!normalizedUsername || typeof password !== 'string' || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required', data: null },
        { status: 400 }
      );
    }

    const endpoint = new URL('/api/Authenticate/Auth/Login', MWAFQ_API_BASE_URL);
    endpoint.searchParams.set('culture', normalizedCulture);

    const upstreamResponse = await performUpstreamTextRequest({
      method: 'POST',
      url: endpoint,
      authorization: null,
      body: { username: normalizedUsername, password },
    });

    const payload = parseJsonSafe(upstreamResponse.body);
    const upstreamCode = extractUpstreamCode(payload);

    if (upstreamResponse.status >= 400 || hasUpstreamFailure(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(payload, 'Invalid credentials'),
          code: upstreamCode,
          data: null,
        },
        { status: normalizeUpstreamStatus(upstreamResponse.status) }
      );
    }

    return NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'Credentials valid'),
      data: { isSuccess: true },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
