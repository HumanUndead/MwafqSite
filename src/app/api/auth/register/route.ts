import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { id: '1', email, name, role: 'user', createdAt: new Date().toISOString() },
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
