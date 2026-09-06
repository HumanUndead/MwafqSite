'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { askChatbot } from '@/modules/chatbot/api/chatbotApi';
import type { ChatMessage } from '@/modules/chatbot/types/chatbot.types';

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface UseChatbotOptions {
  /** Localized copy shown when the stream fails. */
  errorMessage: string;
}

export function useChatbot({ errorMessage }: UseChatbotOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPending, setIsPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const patch = useCallback((id: string, update: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, ...update } : message
      )
    );
  }, []);

  const send = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      // One question at a time — the upstream takes a few seconds per answer.
      if (!text || abortRef.current) return;

      const controller = new AbortController();
      abortRef.current = controller;

      const replyId = createId();
      const now = Date.now();

      setMessages((prev) => [
        ...prev,
        { id: createId(), role: 'user', text, status: 'done', createdAt: now },
        {
          id: replyId,
          role: 'assistant',
          text: '',
          status: 'pending',
          createdAt: now,
        },
      ]);
      setIsPending(true);

      // Deltas are successive paragraphs; upstream joins them with a blank line.
      const chunks: string[] = [];
      let receivedDelta = false;

      try {
        await askChatbot(
          text,
          (event) => {
            if (event.type === 'delta' && event.data.text) {
              receivedDelta = true;
              chunks.push(event.data.text);
              patch(replyId, { text: chunks.join('\n\n') });
              return;
            }

            if (event.type === 'final') {
              patch(replyId, {
                text: receivedDelta ? chunks.join('\n\n') : event.data.answer,
                status: 'done',
              });
            }
          },
          controller.signal
        );

        patch(replyId, { status: 'done' });
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          setMessages((prev) => prev.filter((m) => m.id !== replyId));
        } else {
          patch(replyId, { text: errorMessage, status: 'error' });
        }
      } finally {
        abortRef.current = null;
        setIsPending(false);
      }
    },
    [errorMessage, patch]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    setMessages([]);
  }, [stop]);

  return { messages, isPending, send, stop, reset };
}
