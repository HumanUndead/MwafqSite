import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required', data: null },
        { status: 400 }
      )
    }

    // TODO: Send email notification via Resend / SendGrid / etc.
    console.log('[DEV] Contact form:', { name, email, message })

    return NextResponse.json({ success: true, message: 'Message received', data: null })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}
