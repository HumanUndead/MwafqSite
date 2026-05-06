import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { AuthResponse } from '@/modules/auth/types/auth.types'
import {
  authCookieName,
  authCookieOptions,
} from '@/modules/auth/server/authService'
import { setAuthSessionCookie } from '@/modules/auth/server/authSession'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required', data: null },
        { status: 400 }
      )
    }

    // TODO: Check for existing user, hash password, insert into DB
    const data: AuthResponse = {
      user: { id: '1', email, name, role: 'user', createdAt: new Date().toISOString() },
      token: 'placeholder-token',
    }

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      data,
    })
    response.cookies.set(authCookieName, data.token, authCookieOptions)
    setAuthSessionCookie(response.cookies, data)

    return response
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}
