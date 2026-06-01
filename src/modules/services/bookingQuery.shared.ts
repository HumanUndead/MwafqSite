import { FetchResponseError } from '@/shared/lib/fetchWithErrorHandling.shared';

export function toBookingQueryErrorMessage(error: unknown): string {
  if (error instanceof FetchResponseError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Request failed';
}
