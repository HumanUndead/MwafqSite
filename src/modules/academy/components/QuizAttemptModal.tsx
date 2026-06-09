'use client';

import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Modal } from '@/shared/components/ui/Modal';
import { useQuizAttempt } from '../hooks/useQuiz';
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
    >
      {isLoading || !attempt ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='size-8 animate-spin text-[#00a8f1]' />
        </div>
      ) : (
        <div className='max-h-[70vh] space-y-4 overflow-y-auto pr-1'>
          <div className='flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3'>
            <span className='text-sm text-gray-600'>{t.score}</span>
            <span className='font-bold text-[#1e2364]'>
              {attempt.attemptScore} / {total} ({percentage}%)
            </span>
          </div>

          {flatQuestions.map((question, index) => {
            const questionText =
              getTranslation(question.translations, langId)?.text ?? '';
            const userAnswerIds = attempt.answers
              .filter((a) => a.questionId === question.id)
              .map((a) => a.answerId);

            return (
              <div
                key={question.id}
                className='rounded-xl border border-gray-200 p-4'
              >
                <p className='mb-2 text-sm font-semibold text-gray-900'>
                  {index + 1}. {questionText}
                </p>
                <ul className='space-y-1.5'>
                  {question.quizQuestionAnswers.map((answer) => {
                    const answerText =
                      getTranslation(answer.translations, langId)?.text ?? '';
                    const chosen = userAnswerIds.includes(answer.id);
                    return (
                      <li
                        key={answer.id}
                        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                          answer.isCorrect
                            ? 'bg-green-50 text-green-800'
                            : chosen
                              ? 'bg-red-50 text-red-800'
                              : 'text-gray-700'
                        }`}
                      >
                        {answer.isCorrect ? (
                          <CheckCircle2 className='size-4 text-green-600' />
                        ) : chosen ? (
                          <XCircle className='size-4 text-red-600' />
                        ) : (
                          <span className='size-4' />
                        )}
                        {answerText}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
