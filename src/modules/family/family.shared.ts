/** Mobile convention: a local `05…` mobile number is looked up as `00966…`. */
export function normalizeFamilyUsername(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith('05') ? `00966${trimmed.slice(1)}` : trimmed;
}

const SAUDI_MOBILE = /^(05\d{8}|\+?9665\d{8}|009665\d{8})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email or Saudi mobile, like the mobile signup schema. */
export function isEmailOrSaudiMobile(value: string): boolean {
  const trimmed = value.trim();
  return EMAIL.test(trimmed) || SAUDI_MOBILE.test(trimmed.replace(/\s/g, ''));
}
