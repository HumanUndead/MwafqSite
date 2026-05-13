import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  extractUpstreamCode,
  extractUpstreamMessage,
  hasUpstreamFailure,
  normalizeUpstreamStatus,
} from '@/modules/auth/server/upstreamAuthResult'
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config'

function toStringOrNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeSaudiPhoneNumber(value: string | null): string | null {
  if (!value) {
    return null
  }

  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('966')) {
    return `0${digits.slice(3, 12)}`.slice(0, 10)
  }

  if (digits.startsWith('0')) {
    return digits.slice(0, 10)
  }

  if (digits.startsWith('5')) {
    return `0${digits}`.slice(0, 10)
  }

  return digits.slice(0, 10) || null
}

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

export async function POST(request: NextRequest) {
  try {
    const incomingForm = await request.formData()
    const phoneNumber = normalizeSaudiPhoneNumber(toStringOrNull(incomingForm.get('PhoneNumber')))
    const firstName = toStringOrNull(incomingForm.get('FirstName'))
    const lastName = toStringOrNull(incomingForm.get('LastName'))
    const identityNumber = toStringOrNull(incomingForm.get('IdentityNumber'))
    const dateOfBirth = toStringOrNull(incomingForm.get('DateOfBirth'))
    const id = toStringOrNull(incomingForm.get('Id'))
    const image = incomingForm.get('Img')

    if (!phoneNumber || !firstName || !lastName || !identityNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number, first name, last name, and identity number are required.',
          data: null,
        },
        { status: 400 }
      )
    }

    const upstreamForm = new FormData()
    upstreamForm.set('PhoneNumber', phoneNumber)
    upstreamForm.set('FirstName', firstName)
    upstreamForm.set('LastName', lastName)
    upstreamForm.set('CountryID', '14')
    upstreamForm.set('IdentityNumber', identityNumber)
    upstreamForm.set('Id', '')

    if (dateOfBirth) {
      upstreamForm.set('DateOfBirth', dateOfBirth)
    }

    if (id) {
      upstreamForm.set('Id', id)
    }

    if (image instanceof File && image.size > 0) {
      upstreamForm.set('Img', image)
    }

    const endpoint = new URL('/api/Authenticate/Auth/Register', MWAFQ_API_BASE_URL)
    const upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      body: upstreamForm,
      cache: 'no-store',
    })

    const responseText = await upstreamResponse.text()
    const payload = parseJsonSafe(responseText)

    const upstreamCode = extractUpstreamCode(payload)

    if (!upstreamResponse.ok || hasUpstreamFailure(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(payload, 'Registration failed'),
          code: upstreamCode,
          data: null,
        },
        { status: upstreamResponse.ok ? 400 : normalizeUpstreamStatus(upstreamResponse.status) }
      )
    }

    return NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'Registration successful'),
      data: {
        phoneNumber,
        userName: identityNumber,
        registrationId:
          payload && typeof payload === 'object' && 'id' in payload && typeof payload.id === 'string'
            ? payload.id
            : null,
        raw: payload,
      },
    })
  } catch (error) {
    console.error('[auth/register] Registration request failed.', error)

    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    )
  }
}
