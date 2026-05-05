import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required', data: null },
        { status: 400 }
      )
    }

    // TODO: Replace with real DB lookup + bcrypt comparison
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: '1', email, name: 'User', role: 'user', createdAt: new Date().toISOString() },
        token: 'placeholder-token',
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}
