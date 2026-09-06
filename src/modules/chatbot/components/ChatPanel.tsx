'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/shared/lib/cn';
import { ChatBrandMark } from '@/modules/chatbot/components/ChatBrandMark';
import { ChatComposer } from '@/modules/chatbot/components/ChatComposer';
import { ChatGreeting } from '@/modules/chatbot/components/ChatGreeting';
import { ChatMessageBubble } from '@/modules/chatbot/components/ChatMessageBubble';
import { ChatTypingIndicator } from '@/modules/chatbot/components/ChatTypingIndicator';
import type { ChatMessage } from '@/modules/chatbot/types/chatbot.types';
import type { Dictionary } from '@/locales/types';

interface ChatPanelProps {
  copy: Dictionary['chatbot'];
  dir: 'ltr' | 'rtl';
  messages: ChatMessage[];
  isPending: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  onReset: () => void;
  onClose: () => void;
}

export function ChatPanel({
  copy,
  dir,
  messages,
  isPending,
  onSend,
  onStop,
  onReset,
  onClose,
}: ChatPanelProps) {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [reduceMotion]);

  // The panel mounts fresh every time it opens (AnimatePresence unmounts it on
  // close), so the first render should always land at the top of the thread;
  // only later updates (a new message arriving) should chase the bottom. The
  // streaming bubble's own word-drip grows independently of `messages`, so it
  // calls `scrollToBottom` itself via `onGrow` instead of relying on this.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      el.scrollTop = 0;
      return;
    }

    scrollToBottom();
  }, [messages, isPending, scrollToBottom]);

  const isEmpty = messages.length === 0;
  const lastMessage = messages[messages.length - 1];
  // Show the typing dots only until the first delta arrives — once real text
  // starts streaming in, the message bubble itself takes over.
  const showTyping =
    isPending && lastMessage?.status === 'pending' && !lastMessage.text;

  return (
    <motion.div
      role='dialog'
      aria-modal='false'
      aria-label={copy.title}
      // The launcher/panel wrapper is forced to dir="ltr" so it never drifts
      // off the fixed right edge in Arabic; restore the real reading
      // direction here so panel content (text, list indents, bubble tails)
      // still lays out correctly for the current locale.
      dir={dir}
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'var(--chat-origin)' }}
      className={cn(
        'flex flex-col overflow-hidden bg-[#f3f4f8]',
        'h-[min(34rem,calc(100dvh-7.5rem))] w-[min(23rem,calc(100vw-2rem))]',
        'rounded-[24px] border-2 border-[#e5e7f0] shadow-2xl shadow-[#1e2364]/15'
      )}
    >
      <header className='flex shrink-0 items-center gap-3 bg-[#1e2364] px-4 py-3.5 text-white'>
        <ChatBrandMark className='size-9 ring-1 ring-white/25' priority />

        <div className='min-w-0 flex-1'>
          <p className='truncate text-[14px] font-bold'>{copy.title}</p>
          <p className='flex items-center gap-1.5 text-[11px] text-white/70'>
            <span
              aria-hidden
              className='size-1.5 rounded-full bg-[#4ade80] shadow-[0_0_0_3px_rgba(74,222,128,0.22)]'
            />
            {copy.online}
          </p>
        </div>

        {!isEmpty && (
          <button
            type='button'
            onClick={onReset}
            aria-label={copy.clear}
            title={copy.clear}
            className={cn(
              'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full',
              'text-white/70 transition hover:bg-white/12 hover:text-white',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
            )}
          >
            <RotateCcw className='size-4' strokeWidth={2.2} />
          </button>
        )}

        <button
          type='button'
          onClick={onClose}
          aria-label={copy.launcherClose}
          className={cn(
            'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full',
            'text-white/70 transition hover:bg-white/12 hover:text-white',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
          )}
        >
          <X className='size-4.5' strokeWidth={2.2} />
        </button>
      </header>

      <div
        ref={scrollRef}
        className='flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-4'
      >
        {isEmpty ? (
          <ChatGreeting
            title={copy.greetingTitle}
            body={copy.greetingBody}
            suggestionsLabel={copy.suggestionsLabel}
            suggestions={copy.suggestions}
            onSelect={onSend}
          />
        ) : (
          messages.map((message) =>
            message.status === 'pending' && !message.text ? null : (
              <ChatMessageBubble
                key={message.id}
                message={message}
                // Kept on for done messages too — the word drip can still be
                // catching up to the final chunk for a beat after the
                // network side finishes.
                onGrow={
                  message.role === 'assistant' ? scrollToBottom : undefined
                }
              />
            )
          )
        )}

        {showTyping && <ChatTypingIndicator label={copy.thinking} />}
      </div>

      <ChatComposer
        onSend={onSend}
        onStop={onStop}
        isPending={isPending}
        placeholder={copy.inputPlaceholder}
        sendLabel={copy.send}
        stopLabel={copy.stop}
        disclaimer={copy.disclaimer}
      />
    </motion.div>
  );
}
