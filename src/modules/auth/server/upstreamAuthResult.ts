import 'server-only'

type PlainObject = Record<string, unknown>

function asRecord(value: unknown): PlainObject | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as PlainObject
    : null
}

function readString(record: PlainObject, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'string') {
      const trimmed = value.trim()

      if (trimmed) {
        return trimmed
      }
    }
  }

  return null
}

export function extractUpstreamErrorDetails(payload: unknown): { code: string | null; message: string | null } {
  const queue: unknown[] = [payload]
  const visited = new Set<unknown>()

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current || visited.has(current)) {
      continue
    }

    visited.add(current)

    if (Array.isArray(current)) {
      queue.push(...current)
      continue
    }

    const record = asRecord(current)

    if (!record) {
      continue
    }

    const code = readString(record, ['code', 'Code'])
    const message = readString(record, ['message', 'Message'])

    if (code || message) {
      return { code, message }
    }

    for (const nestedKey of ['error', 'Error', 'errors', 'Errors', 'data', 'Data', 'result', 'Result']) {
      if (nestedKey in record) {
        queue.push(record[nestedKey])
      }
    }
  }

  return { code: null, message: null }
}

export function extractUpstreamMessage(payload: unknown, fallback: string): string {
  return extractUpstreamErrorDetails(payload).message ?? fallback
}

export function extractUpstreamCode(payload: unknown): string | null {
  return extractUpstreamErrorDetails(payload).code
}

export function extractUpstreamPhoneNumber(payload: unknown): string | null {
  const queue: unknown[] = [payload]
  const visited = new Set<unknown>()

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current || visited.has(current)) {
      continue
    }

    visited.add(current)

    if (Array.isArray(current)) {
      queue.push(...current)
      continue
    }

    const record = asRecord(current)

    if (!record) {
      continue
    }

    const phoneNumber = readString(record, [
      'phoneNumber',
      'PhoneNumber',
      'mobileNumber',
      'MobileNumber',
      'phone',
      'Phone',
      'value',
      'Value',
    ])

    if (phoneNumber) {
      return phoneNumber
    }

    for (const nestedKey of ['error', 'Error', 'errors', 'Errors', 'data', 'Data', 'result', 'Result']) {
      if (nestedKey in record) {
        queue.push(record[nestedKey])
      }
    }
  }

  return null
}

export function normalizeUpstreamStatus(status: number, fallback = 400): number {
  return status >= 400 && status <= 599 ? status : fallback
}

export function hasUpstreamFailure(payload: unknown): boolean {
  const record = asRecord(payload)

  const code = extractUpstreamCode(payload)

  if (code && code.toLowerCase() !== 'none') {
    return true
  }

  if (!record) {
    return false
  }

  for (const key of ['isSuccess', 'IsSuccess', 'success', 'Success']) {
    if (key in record && record[key] === false) {
      return true
    }
  }

  return false
}
