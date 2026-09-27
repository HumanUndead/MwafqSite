import { PUBLIC_MEDIA_BASE_URL } from '@/shared/constants/config';

/**
 * Derivative sizes the backend renders for every uploaded image.
 * Asking for another size is a 404.
 */
export const ImageSize = {
  thumb: '_200x200.png',
  banner: '_500x250.webp',
  full: '_1920x1080.webp',
  card: '_1000x600.webp',
} as const;

export type ImageSize = (typeof ImageSize)[keyof typeof ImageSize];

export const MEDIA_FALLBACK_IMAGE = '/demo-assets/logo.svg';

function joinMedia(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${PUBLIC_MEDIA_BASE_URL}${path.replace(/^\/+/, '')}`;
}

/** Full URL for an uploaded image id/path, or the logo fallback. */
export function imageUrl(
  imageId: string | null | undefined,
  size: ImageSize = ImageSize.card
): string {
  const trimmed = imageId?.trim();
  if (!trimmed) return MEDIA_FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const hasExtension = /\.[a-z0-9]{2,5}$/i.test(trimmed);
  return joinMedia(hasExtension ? trimmed : `${trimmed}${size}`);
}

/**
 * Service / service-group icon. Icons are uploaded as SVG and served at
 * `<path>.svg` (the raster size variants 404 for them).
 */
export function serviceIconUrl(icon: string | null | undefined): string {
  const trimmed = icon?.trim();
  if (!trimmed) return MEDIA_FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const hasExtension = /\.[a-z0-9]{2,5}$/i.test(trimmed);
  return joinMedia(hasExtension ? trimmed : `${trimmed}.svg`);
}

/** Full URL for an attachment path (downloads, PDFs, results). */
export function attachmentUrl(path: string): string {
  return joinMedia(path.trim());
}

/** Split a comma-separated attachment list into trimmed paths. */
export function splitAttachments(list: string | null | undefined): string[] {
  return (list ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Decoded file name of an attachment path, e.g. `report.pdf`. */
export function attachmentFileName(path: string): string {
  const last = path.split('/').pop() ?? path;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}
