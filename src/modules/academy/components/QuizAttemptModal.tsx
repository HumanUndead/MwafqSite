'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Modal } from '@/shared/components/ui/Modal';
import { cn } from '@/shared/lib/cn';
import { useQuizAttempt } from '../hooks/useQuiz';
import { MatchingAttemptReview } from './MatchingAttemptReview';
import { ProgressRing } from './ui/AcademyGlass';
import { getScorePercentage, getTranslation } from '../quizScoring.shared';
import { QuestionType } from '../types/quiz.types';
import type { QuizQuestion } from '../types/quiz.types';

interface QuizAttemptModalProps {
  attemptId: number | null;
  onClose: () => void;
}

export function QuizAttemptModal({
  attemptId,
  onClose,
}: QuizAttemptModalProps) {
  const t = useTranslations('academyQuiz');
  const locale = useLocale();
  const langId = localeToLangId[locale];
  const { data: attempt, isLoading } = useQuizAttempt(attemptId, locale);

  const total = attempt ? attempt.quizScore || attempt.qustions.length || 0 : 0;
  const percentage = attempt
    ? getScorePercentage(attempt.attemptScore, total)
    : 0;

  const flatQuestions: QuizQuestion[] = attempt
    ? attempt.qustions.flatMap((question) =>
        question.type === QuestionType.Video
          ? (question.relatedQuizQuestions ?? [])
          : [question]
      )
    : [];

  return (
    <Modal
      open={attemptId !== null}
      onClose={onClose}
      title={t.viewDetails}
      size='lg'
      className='max-w-2xl rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_64px_-24px_rgba(20,24,72,0.45)] backdrop-blur-xl sm:p-8'
    >
      {isLoading || !attempt ? (
        <div role='status' className='flex items-center justify-center py-12'>
          <Loader2 className='size-8 animate-spin text-[#00a8f1]' aria-hidden />
        </div>
      ) : (
        <div className='-me-2 max-h-[70vh] space-y-4 overflow-y-auto pe-2'>
          <div className='flex items-center gap-4 rounded-2xl bg-[#141848] p-4 text-white'>
            <ProgressRing value={percentage} size={64} stroke={6} label={t.score} />
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-white/70'>{t.score}</p>
              <p className='text-xl font-bold' dir='ltr'>
                {attempt.attemptScore} / {total}
              </p>
            </div>
          </div>

          <ol className='space-y-3'>
            {flatQuestions.map((question, index) => {
              const questionText =
                getTranslation(question.translations, langId)?.text ?? '';
              const userAnswerIds = attempt.answers
                .filter((a) => a.questionId === question.id)
                .map((a) => a.answerId);

              return (
                <li
                  key={question.id}
                  className='rounded-2xl border border-[#e5e7f0] bg-white/80 p-4'
                >
                  <p className='mb-3 flex items-start gap-3 text-sm font-semibold text-[#1e2364]'>
                    <span
                      aria-hidden
                      className='flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f3f4f8] text-xs font-bold text-[#6b7196] ring-1 ring-[#e5e7f0]'
                    >
                      {index + 1}
                    </span>
                    <span className='min-w-0 flex-1 break-words pt-0.5'>
                      <span className='sr-only'>{index + 1}. </span>
                      {questionText}
                    </span>
                  </p>
                  {question.type === QuestionType.Matching ? (
                    <MatchingAttemptReview
                      question={question}
                      answers={attempt.answers}
                      langId={langId}
                    />
                  ) : (
                    <ul className='space-y-1.5'>
                      {question.quizQuestionAnswers.map((answer) => {
                        const answerText =
                          getTranslation(answer.translations, langId)?.text ??
                          '';
                        const chosen = userAnswerIds.includes(answer.id);
                        return (
                          <li
                            key={answer.id}
                            className={cn(
                              'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                              answer.isCorrect
                                ? 'bg-emerald-50 font-semibold text-emerald-800 ring-1 ring-emerald-200'
                                : chosen
                                  ? 'bg-red-50 font-semibold text-red-700 ring-1 ring-red-200'
                                  : 'text-[#6b7196]'
                            )}
                          >
                            {answer.isCorrect ? (
                              <CheckCircle2
                                className='size-4 shrink-0 text-emerald-600'
                                aria-label={t.correct}
                              />
                            ) : chosen ? (
                              <XCircle
                                className='size-4 shrink-0 text-red-600'
                                aria-label={t.incorrect}
                              />
                            ) : (
                              <span className='size-4 shrink-0' />
                            )}
                            <span className='min-w-0 break-words'>
                              {answerText}
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
        </div>
      )}
    </Modal>
  );
}
