/**
 * Debug logging of the real upstream API calls (server side), printed as a
 * runnable curl command followed by the response. Browser → local `/api/*`
 * proxy calls are not logged; the upstream call they make is.
 * On in development; elsewhere set `NEXT_PUBLIC_API_DEBUG_LOG=true`.
 * CMS content calls are skipped. Installed from `src/instrumentation.ts`.
 */

export const API_DEBUG_LOG_ENABLED =
  process.env.NEXT_PUBLIC_API_DEBUG_LOG === 'true' ||
  (process.env.NEXT_PUBLIC_API_DEBUG_LOG !== 'false' &&
    process.env.NODE_ENV === 'development');

/** CMS endpoints (articles/content). Matched case-insensitively on the path. */
const CMS_PATH_PATTERNS = [/\/General\/ArticleCategory\//i, /\/General\/Article\//i];

/** The app's own routes (local `/api/*` proxies), not the upstream API. */
function isLocalUrl(url: URL): boolean {
  return /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/i.test(url.hostname);
}

export function isCmsUrl(url: URL): boolean {
  return CMS_PATH_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

/** Should this URL be logged? Upstream `/api/` calls only, no CMS. */
export function shouldLogApiUrl(url: URL): boolean {
  return (
    API_DEBUG_LOG_ENABLED &&
    /\/api\//i.test(url.pathname) &&
    !isLocalUrl(url) &&
    !isCmsUrl(url)
  );
}

const MAX_BODY_CHARS = 20_000;

function truncate(text: string): string {
  return text.length > MAX_BODY_CHARS
    ? `${text.slice(0, MAX_BODY_CHARS)}… (${text.length - MAX_BODY_CHARS} more chars)`
    : text;
}

function headersToObject(headers: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headers) return out;
  new Headers(headers).forEach((value, name) => {
    out[name] = value;
  });
  return out;
}

/** Pretty JSON when possible, raw text otherwise. */
function readableBody(text: string): string {
  if (!text) return '(empty)';
  try {
    return truncate(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    return truncate(text);
  }
}

/** Single-quote for a POSIX shell. */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

type CurlBody =
  | { kind: 'text'; value: string }
  | { kind: 'form'; fields: [string, string][] }
  | { kind: 'other'; label: string };

function curlBodyOf(body: BodyInit | null | undefined): CurlBody | undefined {
  if (body === null || body === undefined) return undefined;
  if (typeof body === 'string') return { kind: 'text', value: body };
  if (body instanceof URLSearchParams) return { kind: 'text', value: body.toString() };
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const fields: [string, string][] = [];
    body.forEach((value, key) => {
      fields.push([key, typeof value === 'string' ? value : `@${value.name}`]);
    });
    return { kind: 'form', fields };
  }
  return { kind: 'other', label: Object.prototype.toString.call(body).slice(8, -1) };
}

export function toCurl(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: CurlBody
): string {
  const lines = [`curl -X ${method} ${shellQuote(url)}`];
  for (const [name, value] of Object.entries(headers)) {
    lines.push(`  -H ${shellQuote(`${name}: ${value}`)}`);
  }
  if (body?.kind === 'text') lines.push(`  --data-raw ${shellQuote(body.value)}`);
  if (body?.kind === 'form') {
    for (const [key, value] of body.fields) lines.push(`  -F ${shellQuote(`${key}=${value}`)}`);
  }
  if (body?.kind === 'other') lines.push(`  # body: ${body.label} (not printable)`);
  return lines.join(' \\\n');
}

export interface ApiLogEntry {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: CurlBody;
  status?: number;
  durationMs: number;
  responseText?: string;
  error?: unknown;
}

export function logApiCall(entry: ApiLogEntry): void {
  const outcome = entry.error ? 'FAILED' : String(entry.status);
  console.log(
    [
      `\n[api] ${entry.method} ${entry.url} → ${outcome} (${entry.durationMs}ms)`,
      toCurl(entry.method, entry.url, entry.headers, entry.body),
      entry.error
        ? `[api] error: ${entry.error instanceof Error ? entry.error.message : String(entry.error)}`
        : `[api] response ${entry.status}:\n${readableBody(entry.responseText ?? '')}`,
    ].join('\n')
  );
}

const INSTALLED = Symbol.for('mwafq.apiDebugLog.installed');

/** Wrap the server's `globalThis.fetch` once to log upstream calls. */
export function installFetchApiLogger(): void {
  if (!API_DEBUG_LOG_ENABLED) return;
  const g = globalThis as typeof globalThis & { [INSTALLED]?: boolean };
  if (g[INSTALLED] || typeof g.fetch !== 'function') return;
  g[INSTALLED] = true;

  const originalFetch = g.fetch.bind(g);

  g.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url: URL;
    try {
      url = new URL(
        typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      );
    } catch {
      return originalFetch(input, init);
    }
    if (!shouldLogApiUrl(url)) return originalFetch(input, init);

    const request = input instanceof Request ? input : null;
    const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
    const headers = headersToObject(init?.headers ?? request?.headers);
    const body = curlBodyOf(init?.body);
    if (body?.kind === 'form') delete headers['content-type']; // curl sets the boundary
    const started = Date.now();

    try {
      const response = await originalFetch(input, init);
      // Read a clone so the caller still gets an unread body.
      const responseText = await response
        .clone()
        .text()
        .catch(() => '[unreadable body]');
      logApiCall({
        method,
        url: url.href,
        headers,
        body,
        status: response.status,
        durationMs: Date.now() - started,
        responseText,
      });
      return response;
    } catch (error) {
      logApiCall({ method, url: url.href, headers, body, durationMs: Date.now() - started, error });
      throw error;
    }
  };
}
