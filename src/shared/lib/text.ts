export function stripHtmlToNull(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  const stripped = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > 0 ? stripped : null;
}
