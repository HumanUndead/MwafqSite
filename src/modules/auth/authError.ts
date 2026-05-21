import type { Dictionary } from '@/locales/types';
import { ApiError } from '@/shared/lib/http';

type AuthDictionary = Dictionary['auth'];

function isArabicDictionary(auth: AuthDictionary): boolean {
  return auth.errors.loginFailed !== 'Login failed';
}

function normalizeErrorCode(code: string | null): string {
  return (
    code
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '') ?? ''
  );
}

function getTranslatedErrorText(
  auth: AuthDictionary,
  key: 'wrongOtpCode' | 'userAlreadyExists' | 'invalidIdentityNumber',
  englishFallback: string,
  arabicFallback: string
): string {
  const candidate = (auth.errors as Record<string, string | undefined>)[key];

  if (candidate && candidate !== englishFallback) {
    return candidate;
  }

  return isArabicDictionary(auth) ? arabicFallback : englishFallback;
}

export function getLocalizedAuthErrorMessage(
  error: unknown,
  auth: AuthDictionary,
  fallback: string
): string {
  if (error instanceof ApiError) {
    switch (normalizeErrorCode(error.code)) {
      case 'wrongotpcode':
      case 'wrongotp':
        return getTranslatedErrorText(
          auth,
          'wrongOtpCode',
          'The verification code is incorrect.',
          'رمز التحقق غير صحيح.'
        );
      case 'usercreationfailedcode':
      case 'missingresourceuseralreadyexists':
        return getTranslatedErrorText(
          auth,
          'userAlreadyExists',
          'This user already exists.',
          'هذا المستخدم موجود بالفعل.'
        );
      case 'usernotfound':
      case 'unauthorizedcode':
        return getTranslatedErrorText(
          auth,
          'invalidIdentityNumber',
          'National ID / Iqama is incorrect.',
          'رقم الهوية / الإقامة غير صحيح.'
        );
      default:
        return error.message || fallback;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
