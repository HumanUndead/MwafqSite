import type { AskStreamEvent } from '@/modules/chatbot/types/chatbot.types';

/**
 * Incremental SSE parser. Feed it raw text chunks; it yields only complete
 * events, buffering anything split across network chunks.
 */
export function createSseParser() {
  let buffer = '';

  return function push(chunk: string): AskStreamEvent[] {
    buffer += chunk;
    const events: AskStreamEvent[] = [];

    // Events are separated by a blank line; keep the trailing partial block.
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const parsed = parseBlock(block);
      if (parsed) events.push(parsed);
    }

    return events;
  };
}

function parseBlock(block: string): AskStreamEvent | null {
  let eventName = 'message';
  const dataLines: string[] = [];

  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith(':')) continue; // comment / keep-alive
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
      continue;
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''));
    }
  }

  if (dataLines.length === 0) return null;

  try {
    const data = JSON.parse(dataLines.join('\n'));
    if (eventName === 'metadata' || eventName === 'delta' || eventName === 'final') {
      return { type: eventName, data } as AskStreamEvent;
    }
  } catch {
    // Malformed payload — skip rather than break the stream.
  }

  return null;
}
