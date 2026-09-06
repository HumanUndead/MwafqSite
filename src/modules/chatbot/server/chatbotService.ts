import 'server-only';

const DEFAULT_CHATBOT_API_URL =
  'https://faqragsystem-production-88c2.up.railway.app/query';

export const CHATBOT_API_URL =
  process.env.MWAFQ_CHATBOT_API_URL ?? DEFAULT_CHATBOT_API_URL;

/** Guard before spending an upstream request. */
export const CHATBOT_MAX_INPUT_LENGTH = 1000;

/**
 * Opens the upstream SSE stream (passing `stream: true` switches the same
 * `/query` endpoint from a single buffered JSON reply to incremental
 * `metadata`/`delta`/`final` events). Returns the raw `Response` so the route
 * handler can pipe the body straight through — no buffering, no re-encoding.
 */
export async function askChatbotStream(
  text: string,
  signal?: AbortSignal
): Promise<Response> {
  return fetch(CHATBOT_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ text, stream: true }),
    cache: 'no-store',
    signal,
  });
}
