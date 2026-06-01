'use client';

import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import type { Dictionary } from '@/locales/types';
import { localeToLangId } from '@/i18n/config';
import { Button } from '@/shared/components/ui/Button';
import { getScorePercentage, getTranslation } from '../quizScoring.shared';
import { QuestionType } from '../types/quiz.types';
import type {
  QuizAttemptDetail,
  QuizData,
  QuizQuestion,
} from '../types/quiz.types';

interface QuizResultsProps {
  quiz: QuizData;
  attempt: QuizAttemptDetail | null;
  onRetake: () => void;
  onBackToCourse: () => void;
}

export function QuizResults({
  quiz,
  attempt,
  onRetake,
  onBackToCourse,
}: QuizResultsProps) {
  const t = useTranslations('academyQuiz');
  const locale = useLocale();
  const langId = localeToLangId[locale];

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      {/* Header */}
      <div className='border-b border-gray-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <h1 className='text-lg font-bold text-gray-900 sm:text-xl'>
            {quiz.title || t.resultsTitle}
          </h1>
        </div>
      </div>

      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
        <div className='overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl'>
          {/* Score */}
          <div className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-12 text-center sm:px-12 sm:py-16'>
            {!attempt ? (
              <div>
                <div className='mx-auto mb-4 size-16 animate-spin rounded-full border-b-4 border-t-4 border-[#00a8f1]' />
                <p className='text-gray-600'>{t.loadingResults}</p>
              </div>
            ) : (
              <ScoreSummary attempt={attempt} labels={t} />
            )}
          </div>

          {/* Actions */}
          <div className='flex flex-col gap-3 border-t border-gray-200 p-6 sm:flex-row sm:justify-center'>
            <Button variant='outline' onClick={onRetake} type='button'>
              <RotateCcw className='size-4' />
              {t.retake}
            </Button>
            <Button
              variant='brand'
              className='bg-gradient-to-r from-[#00a8f1] to-[#1e2364]'
              onClick={onBackToCourse}
              type='button'
            >
              {t.backToCourse}
              <ArrowRight className='size-4 rtl:-scale-x-100' />
            </Button>
          </div>
        </div>

        {/* Review */}
        {attempt && (
          <div className='mt-8 space-y-4'>
            <h2 className='text-xl font-bold text-[#1e2364]'>
              {t.reviewAnswers}
            </h2>
            {flattenQuestions(attempt.qustions).map((question, index) => {
              const questionText =
                getTranslation(question.translations, langId)?.text ?? '';
              const userAnswerIds = attempt.answers
                .filter((a) => a.questionId === question.id)
                .map((a) => a.answerId);

              return (
                <div
                  key={question.id}
                  className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'
                >
                  <p className='mb-3 font-semibold text-gray-900'>
                    {index + 1}. {questionText}
                  </p>
                  <ul className='space-y-2'>
                    {question.quizQuestionAnswers.map((answer) => {
                      const answerText =
                        getTranslation(answer.translations, langId)?.text ?? '';
                      const chosen = userAnswerIds.includes(answer.id);
                      return (
                        <li
                          key={answer.id}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                            answer.isCorrect
                              ? 'border-green-300 bg-green-50 text-green-800'
                              : chosen
                                ? 'border-red-300 bg-red-50 text-red-800'
                                : 'border-gray-200 text-gray-700'
                          }`}
                        >
                          {answer.isCorrect ? (
                            <CheckCircle2 className='size-4 shrink-0 text-green-600' />
                          ) : chosen ? (
                            <XCircle className='size-4 shrink-0 text-red-600' />
                          ) : (
                            <span className='size-4 shrink-0' />
                          )}
                          <span>{answerText}</span>
                          {chosen && (
                            <span className='ms-auto text-xs font-medium opacity-70'>
                              {answer.isCorrect ? t.correct : t.incorrect}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreSummary({
  attempt,
  labels,
}: {
  attempt: QuizAttemptDetail;
  labels: Dictionary['academyQuiz'];
}) {
  const total = attempt.quizScore || attempt.qustions.length || 0;
  const percentage = getScorePercentage(attempt.attemptScore, total);
  const wrong = Math.max(0, total - attempt.attemptScore);

  return (
    <div>
      <div className='mx-auto mb-6 flex size-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-2xl sm:size-40'>
        <Trophy className='size-16 text-white sm:size-20' />
      </div>
      <h2 className='mb-3 text-3xl font-bold text-gray-900 sm:text-4xl'>
        {labels.quizCompleted}
      </h2>
      <div className='mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-6xl font-bold text-transparent sm:text-7xl'>
        {attempt.attemptScore}/{total}
      </div>
      <p className='mb-2 text-lg text-gray-700 sm:text-xl'>
        {labels.yourScore}: {percentage}%
      </p>

      <div className='mx-auto mt-8 grid max-w-md grid-cols-2 gap-6'>
        <div className='rounded-xl bg-green-100 p-4'>
          <CheckCircle2 className='mx-auto mb-2 size-6 text-green-600' />
          <p className='text-2xl font-bold text-green-700'>
            {attempt.attemptScore}
          </p>
          <p className='text-xs font-medium text-green-600'>
            {labels.correctAnswers}
          </p>
        </div>
        <div className='rounded-xl bg-red-100 p-4'>
          <XCircle className='mx-auto mb-2 size-6 text-red-600' />
          <p className='text-2xl font-bold text-red-700'>{wrong}</p>
          <p className='text-xs font-medium text-red-600'>
            {labels.wrongAnswers}
          </p>
        </div>
      </div>
    </div>
  );
}

function flattenQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.flatMap((question) =>
    question.type === QuestionType.Video
      ? (question.relatedQuizQuestions ?? [])
      : [question]
  );
}
