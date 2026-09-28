'use client';

import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { cn } from '@/shared/lib/cn';
import { getTranslation } from '../../quizScoring.shared';
import { QuestionType } from '../../types/quiz.types';
import type { QuizAttemptDetail, QuizQuestion } from '../../types/quiz.types';
import { AcademySectionTitle, GlassPanel } from '../ui/AcademyGlass';
import { MatchingAttemptReview } from '../MatchingAttemptReview';

type ReviewState = 'correct' | 'wrong' | 'unanswered';

/**
 * Per-question review for a finished attempt: one glass row per question with
 * a correct/wrong marker, the learner's choice and the correct answer.
 */
export function QuizReviewList({
  attempt,
  langId,
}: {
  attempt: QuizAttemptDetail;
  langId: number;
}) {
  const t = useTranslations('academyQuiz');
  const questions = flattenQuestions(attempt.qustions);

  return (
    <section aria-labelledby='quiz-review-title'>
      <AcademySectionTitle>
        <span id='quiz-review-title'>{t.reviewAnswers}</span>
      </AcademySectionTitle>

      <ol className='space-y-3'>
        {questions.map((question, index) => {
          const questionText =
            getTranslation(question.translations, langId)?.text ?? '';
          const mine = attempt.answers.filter((a) => a.questionId === question.id);
          const userAnswerIds = mine.map((a) => a.answerId);
          const isMatching = question.type === QuestionType.Matching;

          let state: ReviewState;
          if (mine.length === 0) {
            state = 'unanswered';
          } else if (isMatching) {
            state = mine.every((a) => a.isCorrect) ? 'correct' : 'wrong';
          } else {
            const correctIds = question.quizQuestionAnswers
              .filter((answer) => answer.isCorrect)
              .map((answer) => answer.id);
            const exact =
              correctIds.length === userAnswerIds.length &&
              correctIds.every((id) => userAnswerIds.includes(id));
            state = exact ? 'correct' : 'wrong';
          }

          return (
            <GlassPanel
              as='li'
              key={question.id}
              className={cn(
                'relative overflow-hidden rounded-2xl p-4 sm:p-5',
                'before:absolute before:inset-y-0 before:start-0 before:w-1',
                state === 'correct' && 'before:bg-emerald-500',
                state === 'wrong' && 'before:bg-red-600',
                state === 'unanswered' && 'before:bg-amber-500'
              )}
            >
              <div className='mb-3 flex items-start gap-3'>
                <span
                  className='flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1e2364]/[0.06] text-sm font-bold text-[#1e2364]'
                  aria-hidden
                >
                  {index + 1}
                </span>
                <p className='min-w-0 flex-1 pt-1 text-base font-semibold leading-relaxed text-[#1e2364]'>
                  <span className='sr-only'>{index + 1}. </span>
                  {questionText}
                </p>
                <StateBadge state={state} />
              </div>

              {isMatching ? (
                <div className='sm:ps-11'>
                  <MatchingAttemptReview
                    question={question}
                    answers={attempt.answers}
                    langId={langId}
                  />
                </div>
              ) : (
                <ul className='space-y-2 ps-0 sm:ps-11'>
                  {question.quizQuestionAnswers.map((answer) => {
                    const answerText =
                      getTranslation(answer.translations, langId)?.text ?? '';
                    const chosen = userAnswerIds.includes(answer.id);
                    return (
                      <li
                        key={answer.id}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm',
                          answer.isCorrect
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : chosen
                              ? 'border-red-200 bg-red-50 text-red-800'
                              : 'border-[#e5e7f0] bg-white/60 text-[#6b7196]',
                          chosen && 'font-semibold ring-1 ring-inset',
                          chosen && (answer.isCorrect ? 'ring-emerald-500' : 'ring-red-600')
                        )}
                      >
                        {answer.isCorrect ? (
                          <CheckCircle2 className='size-5 shrink-0 text-emerald-600' aria-hidden />
                        ) : chosen ? (
                          <XCircle className='size-5 shrink-0 text-red-600' aria-hidden />
                        ) : (
                          <Circle className='size-5 shrink-0 text-[#e5e7f0]' aria-hidden />
                        )}
                        <span className='min-w-0 flex-1 break-words'>{answerText}</span>
                        {chosen && (
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                              answer.isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                            )}
                          >
                            {answer.isCorrect ? t.correct : t.incorrect}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </GlassPanel>
          );
        })}
      </ol>
    </section>
  );
}

function StateBadge({ state }: { state: ReviewState }) {
  const t = useTranslations('academyQuiz');
  if (state === 'unanswered') {
    return (
      <span className='shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200'>
        {t.noAnswer}
      </span>
    );
  }
  const correct = state === 'correct';
  const Icon = correct ? CheckCircle2 : XCircle;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        correct
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-red-50 text-red-700 ring-red-200'
      )}
    >
      <Icon className='size-3.5' aria-hidden />
      {correct ? t.correct : t.incorrect}
    </span>
  );
}

function flattenQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.flatMap((question) =>
    question.type === QuestionType.Video
      ? (question.relatedQuizQuestions ?? [])
      : [question]
  );
}
