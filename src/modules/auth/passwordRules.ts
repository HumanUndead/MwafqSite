export const PASSWORD_MIN_LENGTH = 8

export interface PasswordChecks {
  minLength: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

export function isStrongPassword(password: string): boolean {
  const checks = getPasswordChecks(password)

  return Object.values(checks).every(Boolean)
}
