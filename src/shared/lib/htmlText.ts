const HTML_ENTITIES: Record<string, string> = {
  '&middot;': '·',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&mdash;': '—',
  '&ndash;': '–',
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&[a-zA-Z]+;/g, (entity) => HTML_ENTITIES[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

/** Strips HTML tags and decodes entities from CMS-authored rich text, for use in plain-text UI. */
export function stripHtmlTags(html: string | null | undefined): string | null {
  const trimmed = html?.trim();
  if (!trimmed) return null;
  const stripped = decodeHtmlEntities(trimmed.replace(/<[^>]*>/g, '')).trim();
  return stripped.length > 0 ? stripped : null;
}
