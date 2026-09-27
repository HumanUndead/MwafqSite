import { MEDIA_FALLBACK_IMAGE, serviceIconUrl } from '@/shared/lib/media';

export function serviceGroupImageFallback(): string {
  return MEDIA_FALLBACK_IMAGE;
}

/** Resolves a service group icon path from the API to a full image URL. */
export function serviceGroupImageSrc(icon: string | null | undefined): string {
  return serviceIconUrl(icon);
}

export function lowestServiceGroupPrice(
  pricings: { price: number }[]
): number | null {
  if (!pricings.length) return null;
  return Math.min(...pricings.map((p) => p.price));
}
