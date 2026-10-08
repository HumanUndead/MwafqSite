'use client';

import { Check, X } from 'lucide-react';
import { useId, useRef } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { getTranslation } from '../../quizScoring.shared';
import type { QuizQuestion } from '../../types/quiz.types';
import type { QuestionInteraction } from './quizUi';

const itemClass =
  'min-h-14 w-full justify-start gap-3 rounded-xl border px-4 py-3 text-start text-[15px] font-semibold leading-6 transition-colors duration-150 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2';

/**
 * Two lists, paired by tapping: choose an item, then its match. Works with
 * touch, mouse and keyboard (plain buttons). After choosing an item, focus
 * moves to the first free match; after pairing, to the next open item.
 */
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
  const leftsRef = useRef<HTMLUListElement>(null);
  const rightsRef = useRef<HTMLUListElement>(null);
  const leftHeadingId = useId();
  const rightHeadingId = useId();

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
  const selectedLeftId =
    matchingSelection.questionId === question.id
      ? matchingSelection.leftAnswerId
      : null;
  const selectedLeft = lefts.find((l) => l.id === selectedLeftId) ?? null;
  const text = (translations: { langId: number; text: string }[]) =>
    getTranslation(translations, langId)?.text ?? '';

  // Runs after React commits the click's state update.
  function focusFirst(list: HTMLUListElement | null, ...selectors: string[]) {
    requestAnimationFrame(() => {
      for (const selector of selectors) {
        const target = list?.querySelector<HTMLElement>(selector);
        if (target) return target.focus();
      }
    });
  }

  function pickLeft(leftId: number) {
    onMatchingClick(question.id, leftId, 'left');
    if (selectedLeftId !== leftId) {
      focusFirst(rightsRef.current, 'button:not([disabled])');
    }
  }

  function pickRight(rightId: number) {
    onMatchingClick(question.id, rightId, 'right');
    // Next open item, or the first item once everything is paired.
    focusFirst(leftsRef.current, 'button[data-open]', 'button');
  }

  return (
    <div>
      <ol className='ms-5 list-decimal space-y-0.5 text-[14px] leading-6 text-[#4a5078]'>
        <li>{labels.clickLeftItem}</li>
        <li>{labels.clickRightItem}</li>
        <li>{labels.removeMatchInstruction}</li>
      </ol>

      <p
        aria-live='polite'
        className={cn(
          'mt-4 rounded-xl border px-4 py-2.5 text-[14px] font-semibold leading-6',
          selectedLeft
            ? 'border-[#bfe8fb] bg-[#f0faff] text-[#00577f]'
            : 'border-[#e5e7f0] bg-[#f7f8fb] text-[#4a5078]'
        )}
      >
        {selectedLeft
          ? interpolate(labels.chooseMatchFor, {
              item: text(selectedLeft.translations),
            })
          : interpolate(labels.matchedCount, {
              count: Object.keys(matched).length,
              total: lefts.length,
            })}
      </p>

      <div className='mt-5 grid gap-6 md:grid-cols-2'>
        <section aria-labelledby={leftHeadingId}>
          <h3
            id={leftHeadingId}
            className='mb-2.5 text-[13px] font-semibold text-[#6b7196]'
          >
            {labels.leftItems}
          </h3>
          <ul ref={leftsRef} className='space-y-2.5'>
            {lefts.map((left) => {
              const isSel = selectedLeftId === left.id;
              const rightId = matched[left.id];
              const matchedRight = rightId
                ? rights.find((r) => r.id === rightId)
                : null;
              return (
                <li key={left.id} className='flex items-center gap-1.5'>
                  <Button
                    type='button'
                    variant={null}
                    size={null}
                    aria-pressed={isSel}
                    data-open={matchedRight ? undefined : ''}
                    onClick={() => pickLeft(left.id)}
                    className={cn(
                      itemClass,
                      'flex-1',
                      isSel
                        ? 'border-[#1e2364] bg-[#f5f6fb] text-[#1e2364] shadow-[inset_0_0_0_1px_#1e2364]'
                        : matchedRight
                          ? 'border-[#d9ddea] bg-[#f7f8fb] text-[#1e2364] hover:border-[#1e2364]/40'
                          : 'border-[#d9ddea] bg-white text-[#1e2364] hover:border-[#1e2364]/40 hover:bg-[#f7f8fb]'
                    )}
                  >
                    <span className='min-w-0 flex-1 break-words'>
                      {text(left.translations)}
                      {matchedRight ? (
                        <span className='mt-0.5 flex items-start gap-1.5 text-[13px] font-semibold text-[#4a5078]'>
                          <Check
                            className='mt-1 size-3.5 shrink-0 text-green-700'
                            aria-hidden
                          />
                          <span className='min-w-0 break-words'>
                            {labels.matchedWith} {text(matchedRight.translations)}
                          </span>
                        </span>
                      ) : null}
                    </span>
                  </Button>
                  {matchedRight ? (
                    <Button
                      type='button'
                      variant='productText'
                      size='compact'
                      onClick={() => onRemoveMatch(question.id, left.id)}
                      aria-label={`${labels.removeMatch}: ${text(left.translations)}`}
                      title={labels.removeMatch}
                      className='size-11 shrink-0 px-0 text-[#4a5078] hover:bg-[#f0f1f6]'
                    >
                      <X className='size-4' aria-hidden />
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby={rightHeadingId}>
          <h3
            id={rightHeadingId}
            className='mb-2.5 text-[13px] font-semibold text-[#6b7196]'
          >
            {labels.rightItems}
          </h3>
          <ul ref={rightsRef} className='space-y-2.5'>
            {rights.map((right) => {
              const isMatched = Object.values(matched).includes(right.id);
              const clickable = selectedLeft !== null && !isMatched;
              return (
                <li key={right.id}>
                  <Button
                    type='button'
                    variant={null}
                    size={null}
                    disabled={!clickable}
                    onClick={() => pickRight(right.id)}
                    className={cn(
                      itemClass,
                      'disabled:cursor-default disabled:opacity-100',
                      isMatched
                        ? 'border-[#e5e7f0] bg-[#f3f4f8] text-[#6b7196]'
                        : clickable
                          ? 'border-[#1e2364]/50 bg-white text-[#1e2364] hover:border-[#1e2364] hover:bg-[#f5f6fb]'
                          : 'border-[#d9ddea] bg-white text-[#1e2364]'
                    )}
                  >
                    <span className='min-w-0 flex-1 break-words'>
                      {text(right.translations)}
                    </span>
                    {isMatched ? (
                      <span className='shrink-0 text-[12px] font-semibold text-[#4a5078]'>
                        {labels.matchedLabel}
                      </span>
                    ) : null}
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
