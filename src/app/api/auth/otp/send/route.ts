import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required', data: null },
        { status: 400 }
      )
    }

    // TODO: Generate OTP, store in DB/Redis with TTL, send via email service
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`[DEV] OTP for ${email}: ${otp}`)

    return NextResponse.json({ success: true, message: 'OTP sent successfully', data: null })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}
