import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  AuthInputError,
  authenticateUser,
  authCookieName,
  authCookieOptions,
} from '@/modules/auth/server/authService'
import { setAuthSessionCookie } from '@/modules/auth/server/authSession'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const data = await authenticateUser({
      email: typeof email === 'string' ? email : '',
      password: typeof password === 'string' ? password : '',
    })
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data,
    })
    response.cookies.set(authCookieName, data.token, authCookieOptions)
    setAuthSessionCookie(response.cookies, data)

    return response
  } catch (error) {
    if (error instanceof AuthInputError) {
      return NextResponse.json(
        { success: false, message: error.message, data: null },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}
