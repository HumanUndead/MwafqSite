'use client';

import { AlertTriangle, ChevronLeft, Clock, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { academyLearnApi } from '../api/academyLearnApi';
import { useQuizAttempt, useQuizDetail } from '../hooks/useQuiz';
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
import { learnBasePath, lecturePath, quizPath } from '../learnRoutes.shared';
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
import { QuizTimer } from './quiz/QuizTimer';

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

  const { data: quiz, isLoading, isError } = useQuizDetail(
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
      setMatchingSelection({ questionId, leftAnswerId: answerId });
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

  if (isLoading) {
    return <QuizLoading label={t.loading} />;
  }

  if (isLocked) {
    return (
      <QuizMessage
        message={`${t.lockedTitle} — ${t.lockedMessage}`}
        actionHref={learnBasePath(locale, userCourseId, courseId)}
        actionLabel={t.backToCourse}
      />
    );
  }

  if (isError || !quiz) {
    return (
      <QuizMessage
        message={t.loadError}
        actionHref={learnBasePath(locale, userCourseId, courseId)}
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
        onBackToCourse={() =>
          router.push(learnBasePath(locale, userCourseId, courseId))
        }
      />
    );
  }

  const quizTitle = quiz.title || t.start;
  const courseName = courseData?.title ?? null;
  const courseImage = courseData?.image || null;

  // Start screen
  if (!started) {
    return (
      <AcademyBackdrop>
        <QuizIntro
          labels={t}
          title={quizTitle}
          courseName={courseName}
          image={courseImage}
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
          backHref={learnBasePath(locale, userCourseId, courseId)}
          onStart={handleStart}
        />
      </AcademyBackdrop>
    );
  }

  const topQuestions = quiz.questions;
  const current = topQuestions[currentIndex];
  const isLast = currentIndex === topQuestions.length - 1;
  const answeredCount = leaves.filter((q) => isLeafAnswered(q, answers)).length;
  const allAnswered = leaves.length > 0 && answeredCount === leaves.length;
  const progress = ((currentIndex + 1) / topQuestions.length) * 100;
  const lowTime = timeLeft !== null && timeLeft <= 60;

  return (
    <AcademyBackdrop className='pb-40 sm:pb-16'>
      <QuizStageHeader
        courseName={courseName}
        image={courseImage}
        title={quizTitle}
        description={quiz.description}
        leading={
          <button
            type='button'
            onClick={() => setShowExit(true)}
            className='flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] motion-reduce:transition-none'
            aria-label={t.exitQuiz}
          >
            <ChevronLeft className='size-5 rtl:rotate-180' aria-hidden />
          </button>
        }
        trailing={
          timeLeft !== null && timeLeft > 0 ? (
            <QuizTimer
              seconds={timeLeft}
              low={lowTime}
              label={t.timeLeft}
              className='hidden sm:inline-flex'
            />
          ) : null
        }
      >
        <div className='mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
          <p className='text-base font-bold text-white'>
            {t.questionOf
              .replace('{{current}}', String(currentIndex + 1))
              .replace('{{total}}', String(topQuestions.length))}
          </p>
          <p className='text-sm font-semibold text-white/70'>
            {t.answeredOf
              .replace('{{answered}}', String(answeredCount))
              .replace('{{total}}', String(leaves.length))}
          </p>
        </div>
        <QuestionNavigator
          count={topQuestions.length}
          currentIndex={currentIndex}
          isAnswered={(idx) => isQuestionAnswered(topQuestions[idx], answers)}
          onSelect={setCurrentIndex}
          heading={t.questionsNav}
          questionLabel={t.question}
        />
      </QuizStageHeader>

      <div className='relative mx-auto -mt-10 max-w-3xl px-4 sm:-mt-12 sm:px-6'>
        <QuestionCard
          question={current}
          index={currentIndex}
          progress={progress}
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
          allAnswered={allAnswered}
          submitting={submitting}
          submitError={submitError}
          timeLeft={timeLeft}
          lowTime={lowTime}
          onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onNext={() =>
            setCurrentIndex((i) => Math.min(topQuestions.length - 1, i + 1))
          }
          onSubmit={() => setShowConfirmSubmit(true)}
        />
      </div>

      {/* Exit modal */}
      <Modal
        open={showExit}
        onClose={() => setShowExit(false)}
        className={quizModalClass}
      >
        <ModalHeader tone='amber' title={t.exitQuiz}>
          <AlertTriangle className='size-6' aria-hidden />
        </ModalHeader>
        <p className='mb-6 text-[#6b7196]'>{t.exitWarning}</p>
        <div className='flex gap-3'>
          <Button
            variant='outline'
            shape='pill'
            className='flex-1 border-[#e5e7f0] text-[#1e2364]'
            onClick={() => setShowExit(false)}
            type='button'
          >
            {t.cancel}
          </Button>
          <Button
            variant='danger'
            shape='pill'
            className='flex-1'
            onClick={() =>
              router.push(learnBasePath(locale, userCourseId, courseId))
            }
            type='button'
          >
            {t.exit}
          </Button>
        </div>
      </Modal>

      {/* Submit confirmation */}
      <Modal
        open={showConfirmSubmit}
        onClose={() => setShowConfirmSubmit(false)}
        className={quizModalClass}
      >
        <ModalHeader tone='sky' title={t.submit}>
          <Send className='size-6 rtl:-scale-x-100' aria-hidden />
        </ModalHeader>
        <p className='mb-6 text-[#6b7196]'>{t.confirmSubmit}</p>
        <div className='flex gap-3'>
          <Button
            variant='outline'
            shape='pill'
            className='flex-1 border-[#e5e7f0] text-[#1e2364]'
            onClick={() => setShowConfirmSubmit(false)}
            type='button'
          >
            {t.cancel}
          </Button>
          <Button
            variant='brand'
            shape='pill'
            className='flex-1 bg-[#00a8f1] hover:bg-[#0090d1] focus:ring-[#00a8f1]'
            onClick={() => handleSubmit()}
            loading={submitting}
            type='button'
          >
            {t.submit}
          </Button>
        </div>
      </Modal>

      {/* Time-up notice */}
      <Modal
        open={showTimeUp}
        onClose={() => router.push(learnBasePath(locale, userCourseId, courseId))}
        className={quizModalClass}
      >
        <ModalHeader tone='amber' title={t.timeUpTitle}>
          <Clock className='size-6' aria-hidden />
        </ModalHeader>
        <p className='mb-6 text-[#6b7196]'>{t.timeUp}</p>
        <Button
          variant='brand'
          shape='pill'
          className='w-full'
          onClick={() => router.push(learnBasePath(locale, userCourseId, courseId))}
          type='button'
        >
          {t.timeUpConfirm}
        </Button>
      </Modal>
    </AcademyBackdrop>
  );
}

const quizModalClass =
  'rounded-[24px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_64px_-24px_rgba(20,24,72,0.45)] backdrop-blur-xl sm:p-8';

function ModalHeader({
  tone,
  title,
  children,
}: {
  tone: 'amber' | 'sky';
  title: string;
  children: ReactNode;
}) {
  return (
    <div className='mb-3 flex items-center gap-3'>
      <span
        aria-hidden
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-2xl',
          tone === 'amber'
            ? 'bg-amber-50 text-amber-500 ring-1 ring-amber-200'
            : 'bg-[#00a8f1]/10 text-[#00a8f1] ring-1 ring-[#00a8f1]/20'
        )}
      >
        {children}
      </span>
      <h2 className='text-xl font-bold text-[#1e2364]'>{title}</h2>
    </div>
  );
}
