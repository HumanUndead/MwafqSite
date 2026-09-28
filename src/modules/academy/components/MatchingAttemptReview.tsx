'use client';

import { ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { getTranslation } from '../quizScoring.shared';
import type { QuizQuestion, UserQuizAnswerAttempt } from '../types/quiz.types';

interface MatchingAttemptReviewProps {
  question: QuizQuestion;
  answers: UserQuizAnswerAttempt[];
  langId: number;
}

/**
 * Matching result (mobile): each left item with its correct match; the pair
 * is right when the learner's answer for it is marked correct.
 */
export function MatchingAttemptReview({ question, answers, langId }: MatchingAttemptReviewProps) {
  const t = useTranslations('academyQuiz');
  const mine = answers.filter((answer) => answer.questionId === question.id);
  const lefts = question.quizQuestionAnswers.filter((answer) => answer.relatedToAnswerId === null);

  return (
    <ul className='space-y-2'>
      {lefts.map((left, index) => {
        const right = question.quizQuestionAnswers.find((answer) => answer.relatedToAnswerId === left.id);
        const userAnswer =
          mine.find((answer) => answer.answerId === left.id) ??
          (right ? mine.find((answer) => answer.answerId === right.id) : undefined);
        const correct = userAnswer?.isCorrect === true;
        return (
          <li
            key={left.id}
            className={cn(
              'rounded-xl px-3 py-2.5 text-sm ring-1',
              correct
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                : 'bg-red-50 text-red-700 ring-red-200'
            )}
          >
            <p className='mb-1.5 flex items-center gap-1.5 text-xs font-semibold'>
              {correct ? (
                <CheckCircle2 className='size-4 shrink-0 text-emerald-600' aria-label={t.correct} />
              ) : (
                <XCircle className='size-4 shrink-0 text-red-600' aria-label={t.incorrect} />
              )}
              {interpolate(t.matchedPair, { count: index + 1 })}
            </p>
            <p className='flex flex-wrap items-center gap-2 font-semibold'>
              <span className='min-w-0 break-words'>{getTranslation(left.translations, langId)?.text ?? ''}</span>
              <ArrowLeftRight className='size-4 shrink-0 opacity-60' aria-hidden />
              <span className='min-w-0 break-words'>
                {right ? (getTranslation(right.translations, langId)?.text ?? '') : ''}
              </span>
            </p>
          </li>
        );
      })}
      {mine.length === 0 && <li className='text-sm text-[#6b7196]'>{t.noAnswer}</li>}
    </ul>
  );
}
