import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  authCookieName,
  authTokenCookieOptions,
  buildAuthResponseFromToken,
} from '@/modules/auth/server/authService'
import {
  extractUpstreamCode,
  extractUpstreamMessage,
  hasUpstreamFailure,
  normalizeUpstreamStatus,
} from '@/modules/auth/server/upstreamAuthResult'
import { performUpstreamTextRequest } from '@/modules/auth/server/upstreamRequest'
import { consumeEmailOtp } from '@/modules/auth/server/otpStore'
import { setAuthSessionCookie } from '@/modules/auth/server/authSession'
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config'

function parseJsonSafe(value: string): unknown {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const TOKEN_KEYS = ['token', 'accessToken', 'jwt'] as const

function getNestedTokenCandidate(value: unknown, key: (typeof TOKEN_KEYS)[number]): string | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const candidate = record[key]

  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null
}

function extractTokenFromPayload(payload: unknown): string | null {
  if (typeof payload === 'string') {
    return payload.trim() || null
  }

  if (!payload || typeof payload !== 'object') {
    return null
  }

  for (const key of TOKEN_KEYS) {
    const directCandidate = getNestedTokenCandidate(payload, key)
    if (directCandidate) {
      return directCandidate
    }
  }

  if ('data' in payload) {
    const nestedData = (payload as Record<string, unknown>).data
    for (const key of TOKEN_KEYS) {
      const nestedCandidate = getNestedTokenCandidate(nestedData, key)
      if (nestedCandidate) {
        return nestedCandidate
      }
    }
  }

  if ('value' in payload && typeof payload.value === 'string' && payload.value.trim()) {
    return payload.value.trim()
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required', data: null },
        { status: 400 }
      )
    }

    const isValid =
      typeof email === 'string' &&
      typeof otp === 'string' &&
      consumeEmailOtp(email, otp)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP', data: null },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified',
      data: { verified: true },
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userName = request.nextUrl.searchParams.get('UserName')?.trim()
    const otp = request.nextUrl.searchParams.get('OTP')?.trim()

    if (!userName || !otp) {
      return NextResponse.json(
        { success: false, message: 'UserName and OTP are required', data: null },
        { status: 400 }
      )
    }

    const endpoint = new URL('/api/Authenticate/Auth/VerifyOTP', MWAFQ_API_BASE_URL)
    endpoint.searchParams.set('UserName', userName)
    endpoint.searchParams.set('OTP', otp)

    const upstreamResponse = await performUpstreamTextRequest({
      method: 'GET',
      url: endpoint,
    })

    const responseText = upstreamResponse.body
    const payload = parseJsonSafe(responseText)

    const upstreamCode = extractUpstreamCode(payload)

    console.log('[auth/otp/verify] Upstream response:', {
      status: upstreamResponse.status,
      payload,
    })
    if (upstreamResponse.status >= 400 || hasUpstreamFailure(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(payload, 'Invalid or expired OTP'),
          code: upstreamCode,
          data: null,
        },
        { status: normalizeUpstreamStatus(upstreamResponse.status) }
      )
    }

    const token = extractTokenFromPayload(payload)

    if (!token) {
      if (upstreamCode) {
        return NextResponse.json(
          {
            success: false,
            message: extractUpstreamMessage(payload, 'Invalid or expired OTP'),
            code: upstreamCode,
            data: null,
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: false, message: 'OTP verified but no token was returned', data: null },
        { status: 502 }
      )
    }

    const authResponse = buildAuthResponseFromToken(token, userName)
    const response = NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'OTP verified'),
      data: {
        ...authResponse,
        raw: payload,
      },
    })

    response.cookies.set(authCookieName, authResponse.token, authTokenCookieOptions)
    setAuthSessionCookie(response.cookies, authResponse)

    return response
  } catch (error) {
    console.error('[auth/otp/verify] OTP verification failed.', error)

    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}
