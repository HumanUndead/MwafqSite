'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getLocalizedRoute, resolveLocale } from '@/i18n/routing'
import { ROUTES } from '@/shared/constants/routes'
import {
  initialLoginActionState,
  type LoginActionState,
  validateLoginValues,
} from '../loginForm.shared'
import {
  authenticateUser,
  authCookieName,
  authCookieOptions,
} from './authService'
import { setAuthSessionCookie } from './authSession'

export async function submitLogin(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const locale = resolveLocale(String(formData.get('locale') ?? ''))
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const fieldErrors = validateLoginValues({ email, password })

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ...initialLoginActionState,
      fieldErrors,
    }
  }

  try {
    const data = await authenticateUser({ email, password })
    const cookieStore = await cookies()
    cookieStore.set(authCookieName, data.token, authCookieOptions)
    setAuthSessionCookie(cookieStore, data)
  } catch {
    return {
      ...initialLoginActionState,
      formError: 'loginFailed',
    }
  }

  redirect(getLocalizedRoute(locale, ROUTES.DASHBOARD))
}
