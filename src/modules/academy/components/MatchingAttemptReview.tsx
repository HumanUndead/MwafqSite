
'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import { getTranslation } from '../quizScoring.shared';
import type { QuizQuestion, UserQuizAnswerAttempt } from '../types/quiz.types';

interface MatchingAttemptReviewProps {
  question: QuizQuestion;
  answers: UserQuizAnswerAttempt[];
  langId: number;
}

/**
 * Matching result (mobile): each item with its correct match; the pair is
 * right when the learner's answer for it is marked correct.
 */
export function MatchingAttemptReview({ question, answers, langId }: MatchingAttemptReviewProps) {
  const t = useTranslations('academyQuiz');
  const mine = answers.filter((answer) => answer.questionId === question.id);
  const lefts = question.quizQuestionAnswers.filter((answer) => answer.relatedToAnswerId === null);

  // Unanswered: show the correct pairs without a right/wrong verdict.
  const unanswered = mine.length === 0;

  return (
    <ul className='space-y-2'>
      {lefts.map((left) => {
        const right = question.quizQuestionAnswers.find((answer) => answer.relatedToAnswerId === left.id);
        const userAnswer =
          mine.find((answer) => answer.answerId === left.id) ??
          (right ? mine.find((answer) => answer.answerId === right.id) : undefined);
        const correct = userAnswer?.isCorrect === true;
        return (
          <li
            key={left.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-[14px] leading-6',
              unanswered
                ? 'border-[#eef0f7] text-[#4a5078]'
                : correct
                  ? 'border-green-200 bg-green-50 text-green-900'
                  : 'border-red-200 bg-red-50 text-red-900'
            )}
          >
            {unanswered ? null : correct ? (
              <CheckCircle2 className='mt-0.5 size-5 shrink-0 text-green-700' aria-hidden />
            ) : (
              <XCircle className='mt-0.5 size-5 shrink-0 text-red-600' aria-hidden />
            )}
            <span className='min-w-0 flex-1 break-words'>
              <span className='font-semibold'>
                {getTranslation(left.translations, langId)?.text ?? ''}
              </span>
              {' — '}
              {right ? (getTranslation(right.translations, langId)?.text ?? '') : ''}
              <span className='block text-[12px] font-semibold'>
                {unanswered ? t.correctAnswer : correct ? t.correct : t.incorrect}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
