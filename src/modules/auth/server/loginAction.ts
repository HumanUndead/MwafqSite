'use server';

import {
  initialLoginActionState,
  type LoginActionState,
  validateLoginValues,
} from '../loginForm.shared';

export async function submitLogin(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const userName = String(formData.get('userName') ?? '').trim();
  const fieldErrors = validateLoginValues({ userName });

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ...initialLoginActionState,
      fieldErrors,
    };
  }

  return initialLoginActionState;
}
