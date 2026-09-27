'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
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
              'rounded-lg border px-3 py-2 text-sm',
              correct ? 'border-green-300 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-800'
            )}
          >
            <p className='mb-1 text-xs font-medium opacity-70'>
              {interpolate(t.matchedPair, { count: index + 1 })}
            </p>
            <p className='flex flex-wrap items-center gap-2'>
              {correct ? (
                <CheckCircle2 className='size-4 shrink-0 text-green-600' aria-hidden />
              ) : (
                <XCircle className='size-4 shrink-0 text-red-600' aria-hidden />
              )}
              <span>{getTranslation(left.translations, langId)?.text ?? ''}</span>
              <span aria-hidden>↔</span>
              <span>{right ? (getTranslation(right.translations, langId)?.text ?? '') : ''}</span>
            </p>
          </li>
        );
      })}
      {mine.length === 0 && <li className='text-sm text-gray-500'>{t.noAnswer}</li>}
    </ul>
  );
}
