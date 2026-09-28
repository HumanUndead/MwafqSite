import { cn } from '@/shared/lib/cn';

/**
 * Numbered question chips on the navy stage: current (white with sky ring),
 * answered (emerald) and unanswered (translucent).
 */
export function QuestionNavigator({
  count,
  currentIndex,
  isAnswered,
  onSelect,
  heading,
  questionLabel,
}: {
  count: number;
  currentIndex: number;
  isAnswered: (index: number) => boolean;
  onSelect: (index: number) => void;
  heading: string;
  questionLabel: string;
}) {
  return (
    <nav aria-label={heading} className='mt-5'>
      <p className='mb-2 text-xs font-semibold text-white/60'>{heading}</p>
      <ol className='flex flex-wrap gap-2'>
        {Array.from({ length: count }, (_, idx) => {
          const active = idx === currentIndex;
          const answered = isAnswered(idx);
          return (
            <li key={idx}>
              <button
                type='button'
                onClick={() => onSelect(idx)}
                aria-current={active ? 'step' : undefined}
                aria-label={`${questionLabel} ${idx + 1}`}
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl text-sm font-bold transition-colors motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141848]',
                  active
                    ? 'bg-white text-[#1e2364] ring-2 ring-[#00a8f1]'
                    : answered
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-white/10 text-white/75 ring-1 ring-white/15 hover:bg-white/20'
                )}
              >
                {idx + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
