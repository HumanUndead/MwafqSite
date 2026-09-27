/**
 * Developer mode is opted into per-request with `?mode=developer`. It reveals
 * in-progress or internal-only UI (for example the direct OTP login form)
 * without shipping it to regular visitors.
 */

export const DEV_MODE_PARAM = 'mode';
export const DEV_MODE_VALUE = 'developer';

/** Whether a `mode` query value opts into developer mode. */
export function isDeveloperMode(
  mode: string | string[] | undefined | null
): boolean {
  if (Array.isArray(mode)) return mode.includes(DEV_MODE_VALUE);
  return mode === DEV_MODE_VALUE;
}
