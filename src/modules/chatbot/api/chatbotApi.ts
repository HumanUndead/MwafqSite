import { createSseParser } from '@/modules/chatbot/sse.shared';
import type { AskStreamEvent } from '@/modules/chatbot/types/chatbot.types';

const CHATBOT_ENDPOINT = '/api/chatbot/query';

/**
 * Streams an answer from the local proxy route.
 * `onEvent` fires per parsed SSE event; resolves once the stream closes.
 */
export async function askChatbot(
  text: string,
  onEvent: (event: AskStreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(CHATBOT_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error('CHAT_UNAVAILABLE');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const push = createSseParser();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    for (const event of push(decoder.decode(value, { stream: true }))) {
      onEvent(event);
    }
  }
}
