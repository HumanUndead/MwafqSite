import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required', data: null },
        { status: 400 }
      )
    }

    // TODO: Look up stored OTP in DB/Redis, check TTL, invalidate after use
    const isValid = otp === '123456'

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
