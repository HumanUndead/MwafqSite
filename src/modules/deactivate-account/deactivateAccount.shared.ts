const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailIdentifier(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}
