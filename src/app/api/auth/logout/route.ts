import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthSessionCookie } from '@/modules/auth/server/authSession';
import { clearSsoAuthCookies } from '@/modules/auth/server/ssoCookies';

export async function POST() {
  const cookieStore = await cookies();
  // Clears access token + refresh token + token metadata cookies.
  clearSsoAuthCookies(cookieStore);
  // Clears the server session payload.
  clearAuthSessionCookie(cookieStore);
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
}
