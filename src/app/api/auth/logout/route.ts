import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { clearAuthSessionCookie } from '@/modules/auth/server/authSession'
import { authCookieName } from '@/modules/auth/server/authService'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(authCookieName)
  clearAuthSessionCookie(cookieStore)
  return NextResponse.json({ success: true, message: 'Logged out successfully', data: null })
}
