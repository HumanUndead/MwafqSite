'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { ChatBrandMark } from '@/modules/chatbot/components/ChatBrandMark';

interface ChatTypingIndicatorProps {
  /** Announced to screen readers while the answer is being generated. */
  label: string;
}

export function ChatTypingIndicator({ label }: ChatTypingIndicatorProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className='flex items-end gap-2' role='status' aria-live='polite'>
      <ChatBrandMark className='mb-0.5 size-7 border border-[#e5e7f0]' />

      <div className='flex items-center gap-1.5 rounded-[16px] rounded-es-[4px] border border-[#e5e7f0] bg-white px-4 py-3 shadow-sm'>
        <span className='sr-only'>{label}</span>
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            aria-hidden
            className='size-1.5 rounded-full bg-[#1e2364]/45'
            animate={
              reduceMotion
                ? { opacity: 0.6 }
                : { y: [0, -4, 0], opacity: [0.35, 1, 0.35] }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.15,
                  }
            }
          />
        ))}
      </div>
    </div>
  );
}
