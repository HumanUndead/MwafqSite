'use client';

import {
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { isRtl } from '@/i18n/config';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useQuizAttempts } from '../hooks/useQuiz';
import {
  formatDuration,
  formatQuizDate,
  getScoreBadgeColor,
  getScorePercentage,
} from '../quizScoring.shared';
import { learnBasePath, quizPath } from '../learnRoutes.shared';
import type { UserQuizAttempt } from '../types/quiz.types';
import { QuizAttemptModal } from './QuizAttemptModal';

interface QuizHistoryProps {
  userCourseId: number;
  courseId: number;
  quizId: number;
  lessonId?: string | null;
}

export function QuizHistory({
  userCourseId,
  courseId,
  quizId,
  lessonId,
}: QuizHistoryProps) {
  const t = useTranslations('academyQuiz');
  const locale = useLocale();
  const rtl = isRtl(locale);
  const user = useAuthStore((state) => state.user);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(
    null
  );

  const { data, isLoading } = useQuizAttempts({
    userId: user?.id ?? '',
    quizId,
    userCourseId,
    lessonId,
    locale,
  });

  const attempts: UserQuizAttempt[] = data?.attempts ?? data?.data ?? [];
  const total = data?.quizScore ?? 0;
  const BackIcon = rtl ? ChevronRight : ChevronLeft;
  const NextIcon = rtl ? ChevronLeft : ChevronRight;

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      {/* Header */}
      <div className='border-b border-gray-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-4'>
            <Link
              href={learnBasePath(locale, userCourseId, courseId)}
              className='rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100'
              aria-label={t.backToCourse}
            >
              <BackIcon className='size-5' />
            </Link>
            <h1 className='text-lg font-bold text-gray-900 sm:text-xl'>
              {t.historyTitle}
            </h1>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
        {isLoading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='size-10 animate-spin text-[#00a8f1]' />
          </div>
        ) : attempts.length === 0 ? (
          <div className='mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg'>
            <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100'>
              <FileText className='size-8 text-gray-400' />
            </div>
            <h2 className='mb-2 text-xl font-bold text-gray-900'>
              {t.noAttempts}
            </h2>
            <Link
              href={quizPath(locale, userCourseId, courseId, quizId)}
              className='mt-2 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00a8f1] to-[#1e2364] px-6 py-3 font-semibold text-white transition-all hover:opacity-90'
            >
              {t.start}
              <NextIcon className='size-5' />
            </Link>
          </div>
        ) : (
          <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg'>
            <div className='grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3'>
              {attempts.map((attempt, index) => {
                const id = attempt.id ?? attempt.attemptId ?? null;
                const percentage = getScorePercentage(
                  attempt.attemptScore,
                  total
                );
                const badge = getScoreBadgeColor(percentage);

                return (
                  <div
                    key={id ?? index}
                    role={id !== null ? 'button' : undefined}
                    tabIndex={id !== null ? 0 : undefined}
                    onClick={() => id !== null && setSelectedAttemptId(id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && id !== null) {
                        setSelectedAttemptId(id);
                      }
                    }}
                    className='group cursor-pointer rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 transition-all duration-300 hover:border-[#00a8f1]/30 hover:shadow-lg'
                  >
                    <div className='mb-4 flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-1 text-sm text-gray-600'>
                          {t.attempt} #{index + 1}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {formatQuizDate(attempt.startTime, locale)}
                        </div>
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-sm font-bold ${badge}`}
                      >
                        {percentage}%
                      </div>
                    </div>

                    <div className='mb-4 space-y-3'>
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Award className='size-4 text-[#00a8f1]' />
                        <span className='text-sm'>
                          {t.score}:{' '}
                          <span className='font-bold'>
                            {attempt.attemptScore}
                            {total > 0 ? `/${total}` : ''}
                          </span>
                        </span>
                      </div>
                      <div className='flex items-center gap-2 text-gray-700'>
                        <Clock className='size-4 text-[#00a8f1]' />
                        <span className='text-sm'>
                          {t.duration}:{' '}
                          <span className='font-bold'>
                            {formatDuration(attempt.startTime, attempt.endTime)}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className='mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                      <div
                        className={`h-full transition-all duration-300 ${
                          percentage >= 80
                            ? 'bg-green-500'
                            : percentage >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className='w-full rounded-lg border border-[#00a8f1] py-2 text-center text-sm font-medium text-[#00a8f1] transition-colors group-hover:bg-[#00a8f1] group-hover:text-white'>
                      {t.viewDetails}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <QuizAttemptModal
        attemptId={selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </div>
  );
}
