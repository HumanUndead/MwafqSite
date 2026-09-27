/** Replace `{{token}}` placeholders in dictionary copy. */
export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}
