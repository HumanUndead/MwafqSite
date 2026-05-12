export type LoginFieldName = 'email' | 'password'
export type LoginFieldErrorCode = 'invalidEmail' | 'passwordMin'
export type LoginFormErrorCode = 'loginFailed'

export interface LoginValues {
  email: string
  password: string
}

export interface LoginActionState {
  fieldErrors: Partial<Record<LoginFieldName, LoginFieldErrorCode>>
  formError?: LoginFormErrorCode
}

export const initialLoginActionState: LoginActionState = {
  fieldErrors: {},
}

export function validateLoginValues(values: LoginValues): LoginActionState['fieldErrors'] {
  const fieldErrors: LoginActionState['fieldErrors'] = {}

  if (!values.email.includes('@')) {
    fieldErrors.email = 'invalidEmail'
  }

  if (values.password.length < 8) {
    fieldErrors.password = 'passwordMin'
  }

  return fieldErrors
}
