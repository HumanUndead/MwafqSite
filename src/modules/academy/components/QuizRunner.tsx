'use client';

import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shuffle,
  Target,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { isRtl, localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import type { Dictionary } from '@/locales/types';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { academyLearnApi } from '../api/academyLearnApi';
import { useQuizAttempt, useQuizDetail } from '../hooks/useQuiz';
import { getTranslation, shuffleArray } from '../quizScoring.shared';
import { buildAttemptFormData } from '../quizSubmit.shared';
import { getVimeoEmbedUrl } from '../vimeo.shared';
import { learnBasePath } from '../learnRoutes.shared';
import { QuestionType } from '../types/quiz.types';
import type {
  QuizAnswer,
  QuizAnswerState,
  QuizQuestion,
} from '../types/quiz.types';
import { QuizResults } from './QuizResults';

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
  const locale = useLocale();
  const rtl = isRtl(locale);
  const langId = localeToLangId[locale];
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: quiz, isLoading, isError } = useQuizDetail(quizId, locale);

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, QuizAnswerState>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [showExit, setShowExit] = useState(false);
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

  useEffect(() => {
    if (!started || timeLeft === null) return;
    if (timeLeft <= 0) {
      void handleSubmit();
      return;
    }
    const id = setTimeout(() => setTimeLeft((value) => (value ?? 0) - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function handleSubmit() {
    if (!quiz || !user || submitting || attemptId !== null) return;
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
      setSubmitError(err instanceof Error ? err.message : t.loadError);
    } finally {
      setSubmitting(false);
    }
  }

  function resetQuiz() {
    setAttemptId(null);
    setStarted(false);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(null);
    setSubmitError('');
    setMatchingSelection({ questionId: null, leftAnswerId: null });
  }

  if (isLoading) {
    return <CenteredSpinner label={t.loading} />;
  }

  if (isError || !quiz) {
    return (
      <CenteredMessage
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
        onRetake={resetQuiz}
        onBackToCourse={() =>
          router.push(learnBasePath(locale, userCourseId, courseId))
        }
      />
    );
  }

  const quizTitle = quiz.title || t.start;
  const BackIcon = rtl ? ChevronRight : ChevronLeft;
  const NextIcon = rtl ? ChevronLeft : ChevronRight;

  // Start screen
  if (!started) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4'>
        <div className='w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-2xl sm:p-12'>
          <div className='mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#00a8f1] to-[#1e2364] shadow-lg'>
            <Brain className='size-10 text-white' />
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>{quizTitle}</h1>
          {quiz.description && (
            <div
              className='mb-6 text-gray-600'
              dangerouslySetInnerHTML={{ __html: quiz.description }}
            />
          )}
          <div className='mb-8 flex items-center justify-center gap-6 text-sm text-gray-600'>
            <span className='inline-flex items-center gap-1.5'>
              <Target className='size-4 text-[#00a8f1]' />
              {leaves.length} {t.question}
            </span>
            {timerSeconds > 0 && (
              <span className='inline-flex items-center gap-1.5'>
                <Clock className='size-4 text-[#00a8f1]' />
                {Math.round(timerSeconds / 60)} {t.timeLeft}
              </span>
            )}
          </div>
          {leaves.length === 0 ? (
            <p className='text-gray-500'>{t.noQuestions}</p>
          ) : (
            <Button
              variant='brand'
              className='w-full bg-gradient-to-r from-[#00a8f1] to-[#1e2364] py-4 text-base'
              onClick={handleStart}
              type='button'
            >
              {t.start}
            </Button>
          )}
          <Link
            href={learnBasePath(locale, userCourseId, courseId)}
            className='mt-4 inline-block text-sm font-medium text-gray-500 hover:text-[#00a8f1]'
          >
            {t.backToCourse}
          </Link>
        </div>
      </div>
    );
  }

  const topQuestions = quiz.questions;
  const current = topQuestions[currentIndex];
  const isLast = currentIndex === topQuestions.length - 1;
  const answeredCount = leaves.filter((q) => isLeafAnswered(q, answers)).length;
  const progress = ((currentIndex + 1) / topQuestions.length) * 100;
  const lowTime = timeLeft !== null && timeLeft <= 60;

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      {/* Sticky header */}
      <div className='sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 flex-1 items-center gap-4'>
              <button
                type='button'
                onClick={() => setShowExit(true)}
                className='rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100'
                aria-label={t.exitQuiz}
              >
                <BackIcon className='size-5' />
              </button>
              <div className='min-w-0 flex-1'>
                <h1 className='truncate text-lg font-bold text-gray-900 sm:text-xl'>
                  {quizTitle}
                </h1>
                {quiz.description && (
                  <div
                    className='truncate text-sm text-gray-600'
                    dangerouslySetInnerHTML={{ __html: quiz.description }}
                  />
                )}
              </div>
            </div>
            {timeLeft !== null && timeLeft > 0 && (
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                  lowTime ? 'bg-red-100' : 'bg-[#00a8f1]/10'
                }`}
              >
                <Clock
                  className={`size-5 ${lowTime ? 'text-red-600' : 'text-[#00a8f1]'}`}
                />
                <span
                  className={`font-bold ${lowTime ? 'text-red-600' : 'text-[#00a8f1]'}`}
                >
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
        {/* Progress */}
        <div className='mb-8'>
          <div className='mb-2 flex items-center justify-between text-sm font-medium text-gray-700'>
            <span>
              {t.questionOf
                .replace('{{current}}', String(currentIndex + 1))
                .replace('{{total}}', String(topQuestions.length))}
            </span>
            <span>
              {t.answeredOf
                .replace('{{answered}}', String(answeredCount))
                .replace('{{total}}', String(leaves.length))}
            </span>
          </div>
          <div className='h-3 overflow-hidden rounded-full bg-gray-200'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-[#00a8f1] to-[#1e2364] transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-4'>
          {/* Main */}
          <div className='lg:col-span-3'>
            <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl'>
              <div className='border-b border-gray-200 bg-gradient-to-br from-[#00a8f1]/5 to-[#1e2364]/5 p-6 sm:p-8'>
                <div className='flex items-start gap-4'>
                  <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-[#00a8f1]'>
                    <Brain className='size-6 text-white' />
                  </div>
                  <div className='flex-1'>
                    <h2 className='mb-2 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl'>
                      {getTranslation(current.translations, langId)?.text ||
                        `${t.question} ${currentIndex + 1}`}
                    </h2>
                    {getTranslation(current.translations, langId)
                      ?.description && (
                      <p className='text-sm text-gray-600'>
                        {
                          getTranslation(current.translations, langId)
                            ?.description
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className='space-y-4 p-6 sm:p-8'>
                <QuestionBody
                  question={current}
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
              </div>
            </div>

            {submitError && (
              <p className='mt-3 text-sm text-red-600'>{submitError}</p>
            )}

            <div className='mt-6 flex items-center justify-between gap-3'>
              <Button
                variant='outline'
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                type='button'
              >
                <BackIcon className='size-4' />
                {t.previous}
              </Button>
              {isLast ? (
                <Button
                  variant='brand'
                  className='bg-gradient-to-r from-[#00a8f1] to-[#1e2364]'
                  onClick={handleSubmit}
                  loading={submitting}
                  type='button'
                >
                  {submitting ? t.submitting : t.submit}
                </Button>
              ) : (
                <Button
                  variant='brand'
                  onClick={() =>
                    setCurrentIndex((i) =>
                      Math.min(topQuestions.length - 1, i + 1)
                    )
                  }
                  type='button'
                >
                  {t.next}
                  <NextIcon className='size-4' />
                </Button>
              )}
            </div>
          </div>

          {/* Navigator */}
          <div className='lg:col-span-1'>
            <div className='sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg'>
              <h3 className='mb-4 text-sm font-bold text-gray-900'>
                {t.questionsNav}
              </h3>
              <div className='grid grid-cols-5 gap-2 lg:grid-cols-4'>
                {topQuestions.map((q, idx) => {
                  const answered = isQuestionAnswered(q, answers);
                  const active = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type='button'
                      onClick={() => setCurrentIndex(idx)}
                      className={`flex aspect-square items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        active
                          ? 'bg-[#1e2364] text-white ring-2 ring-[#00a8f1]'
                          : answered
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit modal */}
      <Modal
        open={showExit}
        onClose={() => setShowExit(false)}
        title={t.exitQuiz}
      >
        <p className='mb-6 text-gray-600'>{t.exitWarning}</p>
        <div className='flex gap-3'>
          <Button
            variant='secondary'
            className='flex-1'
            onClick={() => setShowExit(false)}
            type='button'
          >
            {t.cancel}
          </Button>
          <Button
            variant='danger'
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
    </div>
  );
}

type QuizLabels = Dictionary['academyQuiz'];

function QuestionBody({
  question,
  answers,
  langId,
  labels,
  shuffledRights,
  matchingSelection,
  onSingle,
  onToggle,
  onMatchingClick,
  onRemoveMatch,
}: {
  question: QuizQuestion;
  answers: Record<number, QuizAnswerState>;
  langId: number;
  labels: QuizLabels;
  shuffledRights: Record<number, QuizAnswer[]>;
  matchingSelection: { questionId: number | null; leftAnswerId: number | null };
  onSingle: (questionId: number, answerId: number) => void;
  onToggle: (questionId: number, answerId: number) => void;
  onMatchingClick: (
    questionId: number,
    answerId: number,
    side: 'left' | 'right'
  ) => void;
  onRemoveMatch: (questionId: number, leftId: number) => void;
}) {
  if (question.type === QuestionType.Video) {
    return (
      <div className='space-y-6'>
        {question.videoUrl && (
          <div className='overflow-hidden rounded-xl bg-black shadow-lg'>
            <div className='relative h-0 pb-[56.25%]'>
              <iframe
                src={getVimeoEmbedUrl(question.videoUrl)}
                allow='autoplay; fullscreen; picture-in-picture'
                className='absolute inset-0 size-full'
                title='Quiz video'
              />
            </div>
          </div>
        )}
        <div className='border-t-2 border-gray-200 pt-6'>
          <h3 className='mb-4 flex items-center gap-2 text-lg font-bold text-gray-800'>
            <Target className='size-5 text-[#00a8f1]' />
            {labels.answerVideoQuestions}
          </h3>
        </div>
        {(question.relatedQuizQuestions ?? []).map((sub, idx) => (
          <div key={sub.id} className='rounded-xl border border-gray-200 p-5'>
            <p className='mb-3 font-semibold text-gray-900'>
              {idx + 1}. {getTranslation(sub.translations, langId)?.text ?? ''}
            </p>
            <ChoiceOptions
              question={sub}
              answers={answers}
              langId={langId}
              labels={labels}
              shuffledRights={shuffledRights}
              matchingSelection={matchingSelection}
              onSingle={onSingle}
              onToggle={onToggle}
              onMatchingClick={onMatchingClick}
              onRemoveMatch={onRemoveMatch}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ChoiceOptions
      question={question}
      answers={answers}
      langId={langId}
      labels={labels}
      shuffledRights={shuffledRights}
      matchingSelection={matchingSelection}
      onSingle={onSingle}
      onToggle={onToggle}
      onMatchingClick={onMatchingClick}
      onRemoveMatch={onRemoveMatch}
    />
  );
}

function ChoiceOptions({
  question,
  answers,
  langId,
  labels,
  shuffledRights,
  matchingSelection,
  onSingle,
  onToggle,
  onMatchingClick,
  onRemoveMatch,
}: {
  question: QuizQuestion;
  answers: Record<number, QuizAnswerState>;
  langId: number;
  labels: QuizLabels;
  shuffledRights: Record<number, QuizAnswer[]>;
  matchingSelection: { questionId: number | null; leftAnswerId: number | null };
  onSingle: (questionId: number, answerId: number) => void;
  onToggle: (questionId: number, answerId: number) => void;
  onMatchingClick: (
    questionId: number,
    answerId: number,
    side: 'left' | 'right'
  ) => void;
  onRemoveMatch: (questionId: number, leftId: number) => void;
}) {
  const state = answers[question.id];

  // Matching
  if (question.type === QuestionType.Matching) {
    const lefts = question.quizQuestionAnswers
      .filter((a) => a.order % 2 === 1)
      .sort((a, b) => a.order - b.order);
    const rights =
      shuffledRights[question.id] ??
      question.quizQuestionAnswers
        .filter((a) => a.order % 2 === 0)
        .sort((a, b) => a.order - b.order);
    const matched = state?.matchedAnswers ?? {};
    const selectingLeft =
      matchingSelection.questionId === question.id &&
      matchingSelection.leftAnswerId !== null;

    return (
      <div>
        <div className='mb-6 rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4'>
          <p className='mb-2 flex items-center gap-2 font-semibold text-purple-900'>
            <Shuffle className='size-5' />
            {labels.howToMatch}
          </p>
          <ol className='ms-6 list-decimal space-y-1 text-sm text-purple-800'>
            <li>{labels.clickLeftItem}</li>
            <li>{labels.clickRightItem}</li>
            <li>{labels.removeMatchInstruction}</li>
          </ol>
        </div>
        <div className='grid gap-8 md:grid-cols-2'>
          {/* Left */}
          <div className='space-y-3'>
            <div className='mb-2 flex items-center justify-between'>
              <h4 className='flex items-center gap-2 text-lg font-bold text-gray-900'>
                <span className='flex size-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white'>
                  A
                </span>
                {labels.leftItems}
              </h4>
              <span className='text-sm text-gray-500'>
                {Object.keys(matched).length}/{lefts.length} {labels.matched}
              </span>
            </div>
            {lefts.map((left, idx) => {
              const isSel =
                matchingSelection.questionId === question.id &&
                matchingSelection.leftAnswerId === left.id;
              const rightId = matched[left.id];
              const matchedRight = rightId
                ? rights.find((r) => r.id === rightId)
                : null;
              return (
                <button
                  key={left.id}
                  type='button'
                  onClick={() => onMatchingClick(question.id, left.id, 'left')}
                  className={`w-full rounded-xl border-2 p-4 text-start transition-all ${
                    isSel
                      ? 'border-blue-500 bg-blue-100 shadow-lg ring-4 ring-blue-200'
                      : matchedRight
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold ${
                        isSel
                          ? 'bg-blue-500 text-white'
                          : matchedRight
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isSel ? '→' : matchedRight ? '✓' : idx + 1}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='font-semibold text-gray-900'>
                        {getTranslation(left.translations, langId)?.text ?? ''}
                      </p>
                      {matchedRight && (
                        <p className='mt-1 text-sm text-green-700'>
                          {labels.matchedWith}{' '}
                          <span className='italic'>
                            {getTranslation(matchedRight.translations, langId)
                              ?.text ?? ''}
                          </span>
                        </p>
                      )}
                    </div>
                    {matchedRight && (
                      <span
                        role='button'
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveMatch(question.id, left.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            onRemoveMatch(question.id, left.id);
                          }
                        }}
                        className='rounded-lg p-2 hover:bg-red-100'
                        title={labels.removeMatch}
                      >
                        <XCircle className='size-5 text-red-500' />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {/* Right */}
          <div className='space-y-3'>
            <div className='mb-2 flex items-center justify-between'>
              <h4 className='flex items-center gap-2 text-lg font-bold text-gray-900'>
                <span className='flex size-8 items-center justify-center rounded-full bg-purple-500 text-sm font-bold text-white'>
                  B
                </span>
                {labels.rightItems}
              </h4>
              {selectingLeft && (
                <span className='animate-pulse text-sm font-medium text-blue-600'>
                  {labels.selectMatch}
                </span>
              )}
            </div>
            {rights.map((right, idx) => {
              const isMatched = Object.values(matched).includes(right.id);
              const clickable = selectingLeft && !isMatched;
              return (
                <button
                  key={right.id}
                  type='button'
                  disabled={!clickable}
                  onClick={() =>
                    onMatchingClick(question.id, right.id, 'right')
                  }
                  className={`w-full rounded-xl border-2 p-4 text-start transition-all ${
                    isMatched
                      ? 'cursor-not-allowed border-gray-300 bg-gray-100 opacity-60'
                      : clickable
                        ? 'border-purple-300 bg-white hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg'
                        : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold ${
                        isMatched
                          ? 'bg-gray-400 text-white'
                          : clickable
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isMatched ? '✓' : String.fromCharCode(65 + idx)}
                    </span>
                    <p
                      className={`font-semibold ${
                        isMatched
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {getTranslation(right.translations, langId)?.text ?? ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const isMultiple = question.type === QuestionType.MultipleChoice;
  const sorted = [...question.quizQuestionAnswers].sort(
    (a, b) => a.order - b.order
  );

  return (
    <>
      {isMultiple && (
        <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3'>
          <p className='text-sm font-medium text-blue-800'>
            📌 {labels.selectAllThatApply}
          </p>
        </div>
      )}
      {sorted.map((answer) => {
        const text = answerLabel(answer, langId, labels);
        const active = isMultiple
          ? (state?.selectedAnswerIds ?? []).includes(answer.id)
          : state?.selectedAnswerId === answer.id;
        return (
          <button
            key={answer.id}
            type='button'
            onClick={() =>
              isMultiple
                ? onToggle(question.id, answer.id)
                : onSingle(question.id, answer.id)
            }
            className={`w-full rounded-xl border-2 p-5 text-start transition-all hover:scale-[1.01] ${
              active
                ? 'border-[#00a8f1] bg-[#00a8f1]/10'
                : 'border-gray-300 bg-white hover:border-[#00a8f1] hover:bg-gray-50'
            }`}
          >
            <div className='flex items-center gap-4'>
              <span
                className={`flex size-10 shrink-0 items-center justify-center font-bold ${
                  isMultiple ? 'rounded-md border-2' : 'rounded-full'
                } ${
                  active
                    ? 'border-[#00a8f1] bg-[#00a8f1] text-white'
                    : isMultiple
                      ? 'border-gray-300 bg-white text-gray-700'
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                {isMultiple
                  ? active
                    ? '✓'
                    : ''
                  : String.fromCharCode(65 + answer.order - 1)}
              </span>
              <span
                className={`text-lg font-medium ${active ? 'text-gray-900' : 'text-gray-700'}`}
              >
                {text}
              </span>
            </div>
          </button>
        );
      })}
    </>
  );
}

function answerLabel(
  answer: QuizAnswer,
  langId: number,
  labels: QuizLabels
): string {
  const text =
    getTranslation(answer.translations, langId)?.text ?? `${answer.order}`;
  const normalized = text.trim().toLowerCase();
  if (normalized === 'true') return labels.trueLabel;
  if (normalized === 'false') return labels.falseLabel;
  return text;
}

function CenteredSpinner({ label }: { label: string }) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white'>
      <div className='space-y-4 text-center'>
        <div className='mx-auto size-16 animate-spin rounded-full border-b-4 border-t-4 border-[#00a8f1]' />
        <p className='text-lg font-medium text-gray-600'>{label}</p>
      </div>
    </div>
  );
}

function CenteredMessage({
  message,
  actionHref,
  actionLabel,
}: {
  message: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4'>
      <div className='w-full max-w-md space-y-6 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg'>
        <div className='mx-auto flex size-20 items-center justify-center rounded-full bg-red-100'>
          <X className='size-10 text-red-600' />
        </div>
        <p className='text-lg text-gray-600'>{message}</p>
        <Link
          href={actionHref}
          className='inline-block rounded-lg bg-[#00a8f1] px-6 py-3 font-medium text-white hover:opacity-90'
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
