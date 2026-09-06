'use client';

import { ArrowUp, Square } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import { cn } from '@/shared/lib/cn';

const MAX_LENGTH = 1000;
const MAX_ROWS_PX = 120;

interface ChatComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isPending: boolean;
  placeholder: string;
  sendLabel: string;
  stopLabel: string;
  disclaimer: string;
}

export function ChatComposer({
  onSend,
  onStop,
  isPending,
  placeholder,
  sendLabel,
  stopLabel,
  disclaimer,
}: ChatComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow with content up to a cap, then scroll.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS_PX)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !isPending;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(value);
    setValue('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={submit}
      className='shrink-0 border-t border-[#e5e7f0] bg-white px-3 pt-3 pb-2'
    >
      <div
        className={cn(
          'flex items-end gap-2 rounded-[18px] border-2 border-[#e5e7f0] bg-[#f3f4f8] p-1.5 ps-3',
          'transition-colors focus-within:border-[#00a8f1] focus-within:bg-white'
        )}
      >
        <label htmlFor='mwafq-chat-input' className='sr-only'>
          {placeholder}
        </label>
        <textarea
          id='mwafq-chat-input'
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'max-h-[120px] flex-1 resize-none bg-transparent py-2 text-[13.5px] leading-relaxed',
            'text-[#1e2364] placeholder:text-[#6b7196] focus:outline-none'
          )}
        />

        {isPending ? (
          <button
            type='button'
            onClick={onStop}
            aria-label={stopLabel}
            className={cn(
              'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full',
              'bg-[#1e2364] text-white transition hover:bg-[#233567]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2'
            )}
          >
            <Square className='size-3.5 fill-current' strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type='submit'
            disabled={!canSend}
            aria-label={sendLabel}
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full transition',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2',
              canSend
                ? 'cursor-pointer bg-[#1e2364] text-white hover:bg-[#233567]'
                : 'cursor-not-allowed bg-[#e5e7f0] text-[#6b7196]'
            )}
          >
            <ArrowUp className='size-4.5' strokeWidth={2.5} />
          </button>
        )}
      </div>

      <p className='mt-1.5 text-center text-[10.5px] text-[#6b7196]'>
        {disclaimer}
      </p>
    </form>
  );
}
