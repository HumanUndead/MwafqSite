/** True when TipTap HTML has no meaningful text */
export function isRichTextEmpty(html: string): boolean {
  if (!html.trim()) return true;
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return text.length === 0;
}

export type CompanyLangTab = 'en' | 'ar';

export function getLangTabWithErrors(errors: {
  nameEn?: string;
  addressEn?: string;
  nameAr?: string;
  addressAr?: string;
}): CompanyLangTab | undefined {
  if (errors.nameEn || errors.addressEn) return 'en';
  if (errors.nameAr || errors.addressAr) return 'ar';
  return undefined;
}
