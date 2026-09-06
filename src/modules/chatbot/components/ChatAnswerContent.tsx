'use client';

import { useMemo } from 'react';

import { cn } from '@/shared/lib/cn';
import {
  formatAnswer,
  type InlineSegment,
} from '@/modules/chatbot/lib/formatAnswer';

function Inline({ content }: { content: InlineSegment[] }) {
  return (
    <>
      {content.map((segment, index) =>
        segment.bold ? (
          <strong key={index} className='font-bold'>
            {segment.text}
          </strong>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </>
  );
}

/** Renders an assistant answer's light markdown as real elements. */
export function ChatAnswerContent({ text }: { text: string }) {
  const blocks = useMemo(() => formatAnswer(text), [text]);

  return (
    <div className='space-y-2'>
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <p key={index} className='font-bold'>
              <Inline content={block.content} />
            </p>
          );
        }

        if (block.kind === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={index} className='space-y-1.5 ps-1'>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className='flex gap-2'>
                  <span
                    aria-hidden
                    className={cn(
                      'shrink-0 select-none',
                      block.ordered
                        ? 'font-semibold tabular-nums opacity-70'
                        : 'mt-[0.55em] size-1.5 rounded-full bg-current opacity-45'
                    )}
                  >
                    {block.ordered ? `${itemIndex + 1}.` : null}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <Inline content={item} />
                  </span>
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={index}>
            <Inline content={block.content} />
          </p>
        );
      })}
    </div>
  );
}
