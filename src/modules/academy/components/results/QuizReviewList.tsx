'use client';

import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Panel, PanelHeader, StatusBadge } from '@/shared/components/product';
import { cn } from '@/shared/lib/cn';
import { getTranslation } from '../../quizScoring.shared';
import { QuestionType } from '../../types/quiz.types';
import type { QuizAttemptDetail, QuizQuestion } from '../../types/quiz.types';
import { MatchingAttemptReview } from '../MatchingAttemptReview';
import { answerLabel } from '../quiz/quizUi';

type ReviewState = 'correct' | 'wrong' | 'unanswered';

/** Review panel under the result: every question with its outcome. */
export function QuizReviewList({
  attempt,
  langId,
}: {
  attempt: QuizAttemptDetail;
  langId: number;
}) {
  const t = useTranslations('academyQuiz');
  return (
    <Panel flush aria-labelledby='quiz-review-title'>
      <PanelHeader
        id='quiz-review-title'
        title={t.reviewAnswers}
        className='px-5 pt-5 sm:px-6 sm:pt-6'
      />
      <AttemptReview attempt={attempt} langId={langId} className='mt-2' />
    </Panel>
  );
}

/**
 * Question rows for a finished attempt: outcome badge, then each option
 * marked "Your answer" / "Correct answer". Shared by results and history.
 */
export function AttemptReview({
  attempt,
  langId,
  className,
}: {
  attempt: QuizAttemptDetail;
  langId: number;
  className?: string;
}) {
  const t = useTranslations('academyQuiz');
  const questions = flattenQuestions(attempt.qustions);

  return (
    <ol className={cn('divide-y divide-[#eef0f7]', className)}>
      {questions.map((question, index) => {
        const mine = attempt.answers.filter((a) => a.questionId === question.id);
        const userAnswerIds = mine.map((a) => a.answerId);
        const isMatching = question.type === QuestionType.Matching;
        const state = reviewState(question, mine.length, userAnswerIds, () =>
          mine.every((a) => a.isCorrect)
        );

        return (
          <li key={question.id} className='px-5 py-5 sm:px-6'>
            <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
              <p className='min-w-0 break-words text-[15px] font-bold leading-6 text-[#1e2364]'>
                <span className='tabular-nums text-[#6b7196]'>{index + 1}. </span>
                {getTranslation(question.translations, langId)?.text ?? ''}
              </p>
              <StatusBadge
                tone={
                  state === 'correct'
                    ? 'success'
                    : state === 'wrong'
                      ? 'danger'
                      : 'warning'
                }
              >
                {state === 'correct'
                  ? t.correct
                  : state === 'wrong'
                    ? t.incorrect
                    : t.noAnswer}
              </StatusBadge>
            </div>

            {isMatching ? (
              <MatchingAttemptReview
                question={question}
                answers={attempt.answers}
                langId={langId}
              />
            ) : (
              <ul className='space-y-2'>
                {question.quizQuestionAnswers.map((answer) => {
                  const chosen = userAnswerIds.includes(answer.id);
                  return (
                    <li
                      key={answer.id}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-[14px] leading-6',
                        answer.isCorrect
                          ? 'border-green-200 bg-green-50 text-green-900'
                          : chosen
                            ? 'border-red-200 bg-red-50 text-red-900'
                            : 'border-[#eef0f7] text-[#4a5078]'
                      )}
                    >
                      {answer.isCorrect ? (
                        <CheckCircle2 className='mt-0.5 size-5 shrink-0 text-green-700' aria-hidden />
                      ) : chosen ? (
                        <XCircle className='mt-0.5 size-5 shrink-0 text-red-600' aria-hidden />
                      ) : (
                        <Circle className='mt-0.5 size-5 shrink-0 text-[#c4c9dc]' aria-hidden />
                      )}
                      <span className='min-w-0 flex-1 break-words'>
                        {answerLabel(answer, langId, t)}
                        {chosen || answer.isCorrect ? (
                          <span className='block text-[12px] font-semibold'>
                            {[
                              chosen ? t.yourAnswer : null,
                              answer.isCorrect ? t.correctAnswer : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function reviewState(
  question: QuizQuestion,
  answeredCount: number,
  userAnswerIds: number[],
  allMarkedCorrect: () => boolean
): ReviewState {
  if (answeredCount === 0) return 'unanswered';
  if (question.type === QuestionType.Matching) {
    return allMarkedCorrect() ? 'correct' : 'wrong';
  }
  const correctIds = question.quizQuestionAnswers
    .filter((answer) => answer.isCorrect)
    .map((answer) => answer.id);
  const exact =
    correctIds.length === userAnswerIds.length &&
    correctIds.every((id) => userAnswerIds.includes(id));
  return exact ? 'correct' : 'wrong';
}

function flattenQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.flatMap((question) =>
    question.type === QuestionType.Video
      ? (question.relatedQuizQuestions ?? [])
      : [question]
  );
}
