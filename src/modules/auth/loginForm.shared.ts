export type LoginFieldName = 'userName'
export type LoginFieldErrorCode = 'identityRequired'
export type LoginFormErrorCode = 'loginFailed'

export interface LoginValues {
  userName: string
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

  if (!values.userName.trim()) {
    fieldErrors.userName = 'identityRequired'
  }

  return fieldErrors
}
