import 'server-only';

import { upstreamRequest, UpstreamError } from '@/shared/lib/upstream';
import type { UpstreamRequestOptions } from '@/shared/lib/upstream';

/** Error from an Academy upstream call (alias of the shared upstream error). */
export { UpstreamError as AcademyError };

/**
 * Authenticated Academy upstream request that returns the unwrapped
 * `value` of the upstream envelope, throwing `AcademyError` on failure.
 */
export function academyAuthedRequest<T>(
  options: UpstreamRequestOptions & { token: string }
): Promise<T> {
  return upstreamRequest<T>(options);
}
