import { ArrowRight, Check, Shuffle, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { getTranslation } from '../../quizScoring.shared';
import type { QuizQuestion } from '../../types/quiz.types';
import type { QuestionInteraction } from './quizUi';

/** Two-column matching: pick an item, then its match. */
export function MatchingQuestion({
  question,
  answers,
  langId,
  labels,
  shuffledRights,
  matchingSelection,
  onMatchingClick,
  onRemoveMatch,
}: { question: QuizQuestion } & Omit<
  QuestionInteraction,
  'onSingle' | 'onToggle'
>) {
  const state = answers[question.id];
  const lefts = question.quizQuestionAnswers
    .filter((a) => a.order % 2 === 1)
    .sort((a, b) => a.order - b.order);
  const rights =
    shuffledRights[question.id] ??
    question.quizQuestionAnswers
      .filter((a) => a.order % 2 === 0)
      .sort((a, b) => a.order - b.order);
  const matched = state?.matchedAnswers ?? {};
  const selectingLeft =
    matchingSelection.questionId === question.id &&
    matchingSelection.leftAnswerId !== null;

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl border border-[#00a8f1]/20 bg-[#00a8f1]/[0.06] p-4'>
        <p className='mb-2 flex items-center gap-2 text-sm font-bold text-[#1e2364]'>
          <Shuffle className='size-4 text-[#00a8f1]' aria-hidden />
          {labels.howToMatch}
        </p>
        <ol className='ms-5 list-decimal space-y-1 text-sm text-[#6b7196]'>
          <li>{labels.clickLeftItem}</li>
          <li>{labels.clickRightItem}</li>
          <li>{labels.removeMatchInstruction}</li>
        </ol>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Items */}
        <div>
          <div className='mb-3 flex items-center justify-between gap-2'>
            <h3 className='flex items-center gap-2 text-base font-bold text-[#1e2364]'>
              <span
                aria-hidden
                className='flex size-7 items-center justify-center rounded-full bg-[#1e2364] text-xs font-bold text-white'
              >
                A
              </span>
              {labels.leftItems}
            </h3>
            <span className='text-sm font-semibold text-[#6b7196]'>
              {Object.keys(matched).length}/{lefts.length} {labels.matched}
            </span>
          </div>
          <ul className='space-y-2.5'>
            {lefts.map((left, idx) => {
              const isSel =
                matchingSelection.questionId === question.id &&
                matchingSelection.leftAnswerId === left.id;
              const rightId = matched[left.id];
              const matchedRight = rightId
                ? rights.find((r) => r.id === rightId)
                : null;
              return (
                <li
                  key={left.id}
                  className={cn(
                    'flex items-center rounded-2xl border transition-colors motion-reduce:transition-none',
                    isSel
                      ? 'border-[#00a8f1] bg-[#00a8f1]/[0.06] ring-2 ring-[#00a8f1]/40'
                      : matchedRight
                        ? 'border-emerald-300 bg-emerald-50/80'
                        : 'border-[#e5e7f0] bg-white/80 hover:border-[#00a8f1]/60'
                  )}
                >
                  <button
                    type='button'
                    aria-pressed={isSel}
                    onClick={() =>
                      onMatchingClick(question.id, left.id, 'left')
                    }
                    className='flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-3.5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                        isSel
                          ? 'bg-[#00a8f1] text-white'
                          : matchedRight
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#f3f4f8] text-[#6b7196] ring-1 ring-[#e5e7f0]'
                      )}
                    >
                      {isSel ? (
                        <ArrowRight className='size-4 rtl:rotate-180' />
                      ) : matchedRight ? (
                        <Check className='size-4' strokeWidth={3} />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block break-words font-semibold text-[#1e2364]'>
                        {getTranslation(left.translations, langId)?.text ?? ''}
                      </span>
                      {matchedRight && (
                        <span className='mt-1 block break-words text-sm text-emerald-700'>
                          {labels.matchedWith}{' '}
                          <span className='font-semibold'>
                            {getTranslation(matchedRight.translations, langId)
                              ?.text ?? ''}
                          </span>
                        </span>
                      )}
                    </span>
                  </button>
                  {matchedRight && (
                    <button
                      type='button'
                      onClick={() => onRemoveMatch(question.id, left.id)}
                      aria-label={labels.removeMatch}
                      title={labels.removeMatch}
                      className='me-2 flex size-9 shrink-0 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 motion-reduce:transition-none'
                    >
                      <X className='size-4' aria-hidden />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Matches */}
        <div>
          <div className='mb-3 flex items-center justify-between gap-2'>
            <h3 className='flex items-center gap-2 text-base font-bold text-[#1e2364]'>
              <span
                aria-hidden
                className='flex size-7 items-center justify-center rounded-full bg-[#00a8f1] text-xs font-bold text-white'
              >
                B
              </span>
              {labels.rightItems}
            </h3>
            {selectingLeft && (
              <span
                aria-live='polite'
                className='text-sm font-semibold text-[#00a8f1] motion-safe:animate-pulse'
              >
                {labels.selectMatch}
              </span>
            )}
          </div>
          <ul className='space-y-2.5'>
            {rights.map((right, idx) => {
              const isMatched = Object.values(matched).includes(right.id);
              const clickable = selectingLeft && !isMatched;
              return (
                <li key={right.id}>
                  <button
                    type='button'
                    disabled={!clickable}
                    onClick={() =>
                      onMatchingClick(question.id, right.id, 'right')
                    }
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-start transition-colors motion-reduce:transition-none',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2',
                      isMatched
                        ? 'cursor-not-allowed border-[#e5e7f0] bg-[#f3f4f8] opacity-60'
                        : clickable
                          ? 'border-[#00a8f1]/40 bg-white hover:border-[#00a8f1] hover:bg-[#00a8f1]/[0.06]'
                          : 'cursor-default border-[#e5e7f0] bg-white/60'
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                        isMatched
                          ? 'bg-[#6b7196]/40 text-white'
                          : clickable
                            ? 'bg-[#00a8f1] text-white'
                            : 'bg-[#f3f4f8] text-[#6b7196] ring-1 ring-[#e5e7f0]'
                      )}
                    >
                      {isMatched ? (
                        <Check className='size-4' strokeWidth={3} />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 flex-1 break-words font-semibold',
                        isMatched
                          ? 'text-[#6b7196] line-through'
                          : 'text-[#1e2364]'
                      )}
                    >
                      {getTranslation(right.translations, langId)?.text ?? ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
