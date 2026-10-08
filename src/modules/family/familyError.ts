import type { Dictionary } from '@/locales/types';

type FamilyErrors = Dictionary['family']['errors'];

/** Upstream error code → `family.errors` key. */
const CODE_KEYS: Record<string, keyof FamilyErrors> = {
  'users.relatedusernotallowed': 'waitingApproval',
  'users.relateduserinvalidusertype': 'invalidUserType',
  'users.relateduserselflink': 'selfLink',
  'users.relateduseralreadybelongs': 'alreadyBelongs',
  failedtosetrelatedto: 'alreadyLinked',
  usernotfound: 'userNotFound',
  'users.relateduserrequestalreadyanswered': 'alreadyAnswered',
  'users.relateduserinvalidstatus': 'generic',
  'users.relatedusernotfound': 'relationNotFound',
};

/** Works with `ApiError` (client) and `FetchResponseError`/`UpstreamError` (server). */
export function getFamilyErrorMessage(
  error: unknown,
  t: { errors: FamilyErrors }
): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: unknown }).code ?? '')
          .trim()
          .toLowerCase()
      : '';
  const key = CODE_KEYS[code];
  if (key) return t.errors[key];
  return error instanceof Error && error.message
    ? error.message
    : t.errors.generic;
}
