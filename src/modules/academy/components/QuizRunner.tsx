'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { CourseProgressBar } from '@/modules/academy/components/CourseProgressBar';
import { Button } from '@/shared/components/ui/Button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Modal } from '@/shared/components/ui/Modal';
import { interpolate } from '@/shared/lib/interpolate';
import { academyLearnApi } from '../api/academyLearnApi';
import {
  useQuizAttempt,
  useQuizAttempts,
  useQuizDetail,
} from '../hooks/useQuiz';
import { PASS_THRESHOLD_PERCENT, shuffleArray } from '../quizScoring.shared';
import { buildAttemptFormData } from '../quizSubmit.shared';
import {
  findPrevNext,
  generateCourseNavigationMap,
  parseCourseNavigationMap,
} from '../courseNavigation.shared';
import { isActivityLockedById } from '../courseLocking.shared';
import { transformCourseDetailToCourseData } from '../courseTransform.shared';
import { useCourseDetail } from '../hooks/useCourseDetail';
import {
  learnBasePath,
  lecturePath,
  quizHistoryPath,
  quizPath,
} from '../learnRoutes.shared';
import type { NavItem } from '../types/player.types';
import { QuestionType } from '../types/quiz.types';
import type {
  QuizAnswer,
  QuizAnswerState,
  QuizQuestion,
} from '../types/quiz.types';
import { QuizResults } from './QuizResults';
import { AcademyBackdrop } from './ui/AcademyGlass';
import { QuestionCard } from './quiz/QuestionCard';
import { QuestionNavigator } from './quiz/QuestionNavigator';
import { QuizActionBar } from './quiz/QuizActionBar';
import { QuizIntro } from './quiz/QuizIntro';
import { QuizStageHeader } from './quiz/QuizStageHeader';
import { QuizLoading, QuizMessage } from './quiz/QuizStatus';
import { QuizTimeAnnouncer, QuizTimer } from './quiz/QuizTimer';

interface QuizRunnerProps {
  userCourseId: number;
  courseId: number;
  quizId: number;
}

function leafQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.flatMap((q) =>
    q.type === QuestionType.Video ? (q.relatedQuizQuestions ?? []) : [q]
  );
}

function isQuestionAnswered(
  question: QuizQuestion,
  answers: Record<number, QuizAnswerState>
): boolean {
  if (question.type === QuestionType.Video) {
    const subs = question.relatedQuizQuestions ?? [];
    return subs.length > 0 && subs.every((s) => isLeafAnswered(s, answers));
  }
  return isLeafAnswered(question, answers);
}

function isLeafAnswered(
  question: QuizQuestion,
  answers: Record<number, QuizAnswerState>
): boolean {
  const state = answers[question.id];
  if (!state) return false;
  if (question.type === QuestionType.MultipleChoice) {
    return state.selectedAnswerIds.length > 0;
  }
  if (question.type === QuestionType.Matching) {
    const leftCount = question.quizQuestionAnswers.filter(
      (a) => a.order % 2 === 1
    ).length;
    return (
      Object.keys(state.matchedAnswers).length >= leftCount && leftCount > 0
    );
  }
  return state.selectedAnswerId !== null;
}

export function QuizRunner({
  userCourseId,
  courseId,
  quizId,
}: QuizRunnerProps) {
  const t = useTranslations('academyQuiz');
  const tProfile = useTranslations('profileAcademy');
  const locale = useLocale();
  const langId = localeToLangId[locale];
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: quiz, isLoading, isError, refetch } = useQuizDetail(
    quizId,
    userCourseId,
    locale
  );
  const { data: courseDetail } = useCourseDetail(userCourseId, courseId, locale);
  const courseData = courseDetail
    ? transformCourseDetailToCourseData(courseDetail, String(courseId))
    : null;
  const isLocked = courseData
    ? isActivityLockedById(courseData, 'quiz', quizId)
    : false;
  const navItems: NavItem[] = courseDetail
    ? parseCourseNavigationMap(generateCourseNavigationMap(courseDetail))
    : [];
  const nextItem = findPrevNext(navItems, quizId, 'quiz').next;
  const nextHref = nextItem
    ? nextItem.type === 'quiz'
      ? quizPath(locale, userCourseId, courseId, nextItem.id)
      : lecturePath(locale, userCourseId, courseId, nextItem.id)
    : learnBasePath(locale, userCourseId, courseId);

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, QuizAnswerState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [showExit, setShowExit] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const hasSubmittedRef = useRef(false);
  const [matchingSelection, setMatchingSelection] = useState<{
    questionId: number | null;
    leftAnswerId: number | null;
  }>({ questionId: null, leftAnswerId: null });
  const [shuffledRights, setShuffledRights] = useState<
    Record<number, QuizAnswer[]>
  >({});

  const { data: attemptResult } = useQuizAttempt(attemptId, locale);
  // Past attempts for the start screen (same query as the history page).
  const pastAttempts = useQuizAttempts({
    userId: user?.id ?? '',
    quizId,
    userCourseId,
    locale,
  });
  const attemptsCount = pastAttempts.data
    ? (pastAttempts.data.totalRecords ??
      pastAttempts.data.attemptsCount ??
      (pastAttempts.data.data ?? pastAttempts.data.attempts ?? []).length)
    : null;
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);

  const leaves = useMemo(
    () => (quiz ? leafQuestions(quiz.questions) : []),
    [quiz]
  );

  const timerSeconds = quiz
    ? (quiz.timerMintues ?? quiz.timerMinutes ?? 0) * 60
    : 0;

  // Countdown. At zero nothing is submitted (mobile rule): the learner is
  // told and sent back to the course.
  useEffect(() => {
    if (!started || timeLeft === null || timeLeft <= 0) return;
    const id = setTimeout(() => {
      const next = timeLeft - 1;
      setTimeLeft(next);
      if (next <= 0) {
        hasSubmittedRef.current = true;
        setShowTimeUp(true);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [started, timeLeft]);

  function handleStart() {
    const initial: Record<number, QuizAnswerState> = {};
    leaves.forEach((q) => {
      initial[q.id] = {
        questionId: q.id,
        selectedAnswerId: null,
        selectedAnswerIds: [],
        matchedAnswers: {},
      };
    });
    const rights: Record<number, QuizAnswer[]> = {};
    leaves.forEach((q) => {
      if (q.type === QuestionType.Matching) {
        rights[q.id] = shuffleArray(
          q.quizQuestionAnswers
            .filter((a) => a.order % 2 === 0)
            .sort((a, b) => a.order - b.order)
        );
      }
    });
    setShuffledRights(rights);
    setAnswers(initial);
    setCurrentIndex(0);
    setStartTime(new Date().toISOString());
    setTimeLeft(timerSeconds > 0 ? timerSeconds : null);
    setStarted(true);
    // The Start button is gone; put focus on the first question.
    requestAnimationFrame(() =>
      questionHeadingRef.current?.focus({ preventScroll: true })
    );
  }

  function setSingle(questionId: number, answerId: number) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        selectedAnswerId: answerId,
        selectedAnswerIds: [],
        matchedAnswers: {},
      },
    }));
  }

  function toggleMultiple(questionId: number, answerId: number) {
    setAnswers((prev) => {
      const current = prev[questionId]?.selectedAnswerIds ?? [];
      const next = current.includes(answerId)
        ? current.filter((id) => id !== answerId)
        : [...current, answerId];
      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId,
          selectedAnswerId: null,
          selectedAnswerIds: next,
          matchedAnswers: {},
        },
      };
    });
  }

  function matchingClick(
    questionId: number,
    answerId: number,
    side: 'left' | 'right'
  ) {
    if (side === 'left') {
      // Tapping the chosen item again cancels the choice.
      const same =
        matchingSelection.questionId === questionId &&
        matchingSelection.leftAnswerId === answerId;
      setMatchingSelection(
        same
          ? { questionId: null, leftAnswerId: null }
          : { questionId, leftAnswerId: answerId }
      );
      return;
    }
    if (
      matchingSelection.questionId === questionId &&
      matchingSelection.leftAnswerId !== null
    ) {
      const leftId = matchingSelection.leftAnswerId;
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId,
          selectedAnswerId: null,
          selectedAnswerIds: [],
          matchedAnswers: {
            ...prev[questionId]?.matchedAnswers,
            [leftId]: answerId,
          },
        },
      }));
      setMatchingSelection({ questionId: null, leftAnswerId: null });
    }
  }

  function removeMatch(questionId: number, leftId: number) {
    setAnswers((prev) => {
      const matched = { ...(prev[questionId]?.matchedAnswers ?? {}) };
      delete matched[leftId];
      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId,
          matchedAnswers: matched,
        },
      };
    });
  }

  const queryClient = useQueryClient();

  async function handleSubmit({ timedOut = false } = {}) {
    if (!quiz || !user || submitting || attemptId !== null) return;
    hasSubmittedRef.current = true;
    setShowConfirmSubmit(false);
    setShowTimeUp(timedOut);
    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = buildAttemptFormData({
        userId: user.id,
        quizId: quiz.id,
        userCourseId,
        startTime: startTime ?? new Date().toISOString(),
        endTime: new Date().toISOString(),
        answers: Object.values(answers),
      });
      const response = await academyLearnApi.submitQuizAttempt(formData);
      setAttemptId(response.data.attemptId);
      // The attempt changes completion / locking: refresh everything that
      // shows it (course overview + curriculum, this quiz, its history,
      // lecture sidebars) and the server-rendered "My courses" list.
      void queryClient.invalidateQueries({ queryKey: ['academy-course'] });
      // Not refetched now: the open quiz would re-run its setup under the
      // results. Marked stale, so the next visit loads fresh data.
      void queryClient.invalidateQueries({
        queryKey: ['academy-quiz'],
        refetchType: 'none',
      });
      void queryClient.invalidateQueries({ queryKey: ['academy-quiz-attempts'] });
      void queryClient.invalidateQueries({ queryKey: ['academy-lecture'] });
      router.refresh();
    } catch (err) {
      hasSubmittedRef.current = false;
      setSubmitError(err instanceof Error ? err.message : t.loadError);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!started || attemptId !== null) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasSubmittedRef.current) return;
      event.preventDefault();
      event.returnValue = t.exitWarning;
      return t.exitWarning;
    };

    // Leaving mid-attempt loses the answers (mobile rule): warn, never submit.
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [started, attemptId, t.exitWarning]);

  function resetQuiz() {
    hasSubmittedRef.current = false;
    setShowTimeUp(false);
    setAttemptId(null);
    setStarted(false);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(null);
    setSubmitError('');
    setMatchingSelection({ questionId: null, leftAnswerId: null });
  }

  // Move to a question: bring it into view and focus its text, so keyboard
  // and screen-reader users land on the new question.
  function goTo(index: number) {
    setCurrentIndex(index);
    requestAnimationFrame(() => {
      const heading = questionHeadingRef.current;
      if (!heading) return;
      if (heading.getBoundingClientRect().top < 96) {
        const reduce = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        heading.scrollIntoView({
          block: 'center',
          behavior: reduce ? 'auto' : 'smooth',
        });
      }
      heading.focus({ preventScroll: true });
    });
  }

  if (isLoading) {
    return <QuizLoading label={t.loading} />;
  }

  const backHref = learnBasePath(locale, userCourseId, courseId);

  if (isLocked) {
    return (
      <QuizMessage
        kind='locked'
        title={t.lockedTitle}
        description={t.lockedMessage}
        actionHref={backHref}
        actionLabel={t.backToCourse}
      />
    );
  }

  if (isError || !quiz) {
    return (
      <QuizMessage
        kind='error'
        title={t.loadError}
        retryLabel={t.retry}
        onRetry={() => void refetch()}
        actionHref={backHref}
        actionLabel={t.backToCourse}
      />
    );
  }

  // Result screen
  if (attemptId !== null) {
    return (
      <QuizResults
        quiz={quiz}
        attempt={attemptResult ?? null}
        userCourseId={userCourseId}
        nextHref={nextHref}
        onRetake={resetQuiz}
        onBackToCourse={() => router.push(backHref)}
      />
    );
  }

  const quizTitle = quiz.title || t.start;
  const courseName = courseData?.title ?? null;

  // Start screen
  if (!started) {
    return (
      <AcademyBackdrop>
        <QuizIntro
          labels={t}
          title={quizTitle}
          courseName={courseName}
          description={quiz.description}
          questionCount={leaves.length}
          minutesLabel={
            timerSeconds > 0
              ? interpolate(tProfile.minutes, {
                  count: Math.round(timerSeconds / 60),
                })
              : null
          }
          passThreshold={PASS_THRESHOLD_PERCENT}
          attemptsCount={attemptsCount}
          historyHref={quizHistoryPath(
            locale,
            userCourseId,
            courseId,
            quizId,
            quiz.lessonId !== null ? String(quiz.lessonId) : null
          )}
          backHref={backHref}
          onStart={handleStart}
        />
      </AcademyBackdrop>
    );
  }

  const topQuestions = quiz.questions;
  const current = topQuestions[currentIndex];
  const isLast = currentIndex === topQuestions.length - 1;
  const answeredCount = leaves.filter((q) => isLeafAnswered(q, answers)).length;
  const unansweredCount = leaves.length - answeredCount;
  const answeredPercent =
    leaves.length > 0 ? (answeredCount / leaves.length) * 100 : 0;
  const lowTime = timeLeft !== null && timeLeft <= 60;

  return (
    <AcademyBackdrop className='pb-28 sm:pb-16'>
      <QuizStageHeader
        courseName={courseName}
        title={quizTitle}
        leading={
          <Button
            type='button'
            variant='productText'
            size='compact'
            onClick={() => setShowExit(true)}
            className='-ms-3.5'
          >
            <ChevronLeft className='size-4 rtl:rotate-180' aria-hidden />
            {t.exit}
          </Button>
        }
        trailing={
          timeLeft !== null && timeLeft > 0 ? (
            <QuizTimer
              seconds={timeLeft}
              low={lowTime}
              label={t.timeLeft}
              className='max-sm:hidden'
            />
          ) : null
        }
      >
        <div className='mt-4'>
          <p className='mb-2 text-[13px] font-semibold tabular-nums text-[#6b7196]'>
            {interpolate(t.answeredOf, {
              answered: answeredCount,
              total: leaves.length,
            })}
          </p>
          <CourseProgressBar value={answeredPercent} />
        </div>
      </QuizStageHeader>
      <QuizTimeAnnouncer
        seconds={timeLeft}
        totalSeconds={timerSeconds}
        labels={t}
      />

      <div className='mx-auto grid max-w-5xl gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-6'>
        <QuestionNavigator
          count={topQuestions.length}
          currentIndex={currentIndex}
          isAnswered={(idx) => isQuestionAnswered(topQuestions[idx], answers)}
          onSelect={goTo}
          labels={t}
          className='lg:sticky lg:top-32 lg:order-2'
        />

        <div className='min-w-0 lg:order-1'>
          <QuestionCard
            question={current}
            index={currentIndex}
            total={topQuestions.length}
            headingRef={questionHeadingRef}
            answers={answers}
            langId={langId}
            labels={t}
            shuffledRights={shuffledRights}
            matchingSelection={matchingSelection}
            onSingle={setSingle}
            onToggle={toggleMultiple}
            onMatchingClick={matchingClick}
            onRemoveMatch={removeMatch}
          />
          <QuizActionBar
            labels={t}
            isFirst={currentIndex === 0}
            isLast={isLast}
            unansweredCount={unansweredCount}
            submitting={submitting}
            submitError={submitError}
            timeLeft={timeLeft}
            lowTime={lowTime}
            onPrevious={() => goTo(Math.max(0, currentIndex - 1))}
            onNext={() =>
              goTo(Math.min(topQuestions.length - 1, currentIndex + 1))
            }
            onSubmit={() => setShowConfirmSubmit(true)}
          />
        </div>
      </div>

      <ConfirmDialog
        open={showExit}
        title={t.exitQuiz}
        message={t.exitWarning}
        confirmLabel={t.exit}
        cancelLabel={t.keepAnswering}
        destructive
        onConfirm={() => router.push(backHref)}
        onCancel={() => setShowExit(false)}
      />

      <ConfirmDialog
        open={showConfirmSubmit}
        title={t.submitTitle}
        message={
          unansweredCount > 0
            ? interpolate(t.confirmSubmitUnanswered, {
                count: unansweredCount,
                total: leaves.length,
              })
            : t.confirmSubmit
        }
        confirmLabel={t.submitAnswers}
        cancelLabel={t.keepAnswering}
        loading={submitting}
        onConfirm={() => handleSubmit()}
        onCancel={() => setShowConfirmSubmit(false)}
      />

      {/* Time-up notice: nothing was submitted; the only way on is back. */}
      <Modal
        open={showTimeUp}
        onClose={() => router.push(backHref)}
        title={t.timeUpTitle}
        size='sm'
      >
        <p className='text-[15px] leading-6 text-[#4a5078]'>{t.timeUp}</p>
        <Button
          type='button'
          variant='product'
          size='control'
          className='mt-6 w-full'
          onClick={() => router.push(backHref)}
        >
          {t.timeUpConfirm}
        </Button>
      </Modal>
    </AcademyBackdrop>
  );
}
