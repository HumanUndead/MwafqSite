import { installFetchApiLogger } from '@/shared/lib/apiDebugLog.shared';

/** Runs once per server instance before it handles requests. */
export function register() {
  installFetchApiLogger();
}
