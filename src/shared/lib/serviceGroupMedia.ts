import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';

export function serviceGroupImageFallback(id: number): string {
  return `https://picsum.photos/seed/mwafq-service-${id}/800/600`;
}

/** Resolves a service group icon path from the API to a full image URL. */
export function serviceGroupImageSrc(
  icon: string | null | undefined,
  id: number,
  apiBase: string = MWAFQ_API_BASE_URL
): string {
  const trimmed = icon?.trim();
  if (!trimmed) return serviceGroupImageFallback(id);
  if (trimmed.startsWith('http')) return trimmed;

  const path = trimmed.replace(/^\//, '');
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(path.split('/').pop() ?? '');
  return `${apiBase}/${hasExtension ? path : `${path}.png`}`;
}

export function lowestServiceGroupPrice(
  pricings: { price: number }[]
): number | null {
  if (!pricings.length) return null;
  return Math.min(...pricings.map((p) => p.price));
}
