'use client';

import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Play,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isRtl, localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { toast } from '@/shared/components/feedback/Toast';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { useCourseDetail } from '../hooks/useCourseDetail';
import {
  useLectureDetail,
  useSetLectureProgress,
} from '../hooks/useLectureDetail';
import {
  findPrevNext,
  generateCourseNavigationMap,
  parseCourseNavigationMap,
} from '../courseNavigation.shared';
import { getVimeoEmbedUrl } from '../vimeo.shared';
import { learnBasePath, lecturePath, quizPath } from '../learnRoutes.shared';
import type { LectureTranslation } from '../types/lecture.types';
import type { NavItem } from '../types/player.types';

declare global {
  interface Window {
    Vimeo?: {
      Player: new (el: HTMLIFrameElement) => VimeoPlayer;
    };
  }
}

interface VimeoPlayer {
  on: (event: string, cb: (data: { seconds: number }) => void) => void;
  setCurrentTime: (seconds: number) => void;
  getCurrentTime: () => Promise<number>;
  destroy: () => void;
}

const PROGRESS_KEY = 'userVideoProgress';

function videoProgressKey(userCourseId: number, lectureId: number): string {
  return `${userCourseId}_${lectureId}`;
}

function getVideoProgress(userCourseId: number, lectureId: number): number {
  try {
    const key = videoProgressKey(userCourseId, lectureId);
    const stored = localStorage.getItem(PROGRESS_KEY) || '';
    for (const entry of stored.split(',').filter(Boolean)) {
      const lastDash = entry.lastIndexOf('-');
      if (lastDash === -1) continue;
      if (entry.slice(0, lastDash) === key) {
        return parseFloat(entry.slice(lastDash + 1)) || 0;
      }
    }
    return 0;
  } catch {
    return 0;
  }
}

function saveVideoProgress(
  userCourseId: number,
  lectureId: number,
  seconds: number
): void {
  try {
    const key = videoProgressKey(userCourseId, lectureId);
    const stored = localStorage.getItem(PROGRESS_KEY) || '';
    const entries = stored.split(',').filter((entry) => {
      const lastDash = entry.lastIndexOf('-');
      return lastDash === -1 || entry.slice(0, lastDash) !== key;
    });
    entries.push(`${key}-${Math.floor(seconds)}`);
    localStorage.setItem(PROGRESS_KEY, entries.join(','));
  } catch {
    // ignore
  }
}

function pickTranslation(
  translations: LectureTranslation[],
  langId: number
): LectureTranslation | null {
  if (!translations || translations.length === 0) return null;
  return (
    translations.find((tr) => tr.langId === langId) || translations[0] || null
  );
}

interface LecturePlayerProps {
  userCourseId: number;
  courseId: number;
  lectureId: number;
}

export function LecturePlayer({
  userCourseId,
  courseId,
  lectureId,
}: LecturePlayerProps) {
  const t = useTranslations('academyLecture');
  const locale = useLocale();
  const rtl = isRtl(locale);
  const router = useRouter();
  const langId = localeToLangId[locale];

  const {
    data: lecture,
    isLoading,
    isError,
  } = useLectureDetail(lectureId, userCourseId, locale);
  const { data: courseDetail } = useCourseDetail(
    userCourseId,
    courseId,
    locale
  );
  const progressMutation = useSetLectureProgress(userCourseId, courseId);

  const [activeTab, setActiveTab] = useState<'overview' | 'resources'>(
    'overview'
  );
  const [locallyCompleted, setLocallyCompleted] = useState(false);
  const [pendingQuizId, setPendingQuizId] = useState<number | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const markingRef = useRef(false);

  // Build nav items from the (cached) course detail.
  const navItems: NavItem[] = courseDetail
    ? parseCourseNavigationMap(generateCourseNavigationMap(courseDetail))
    : [];

  const { prev, next } = findPrevNext(navItems, lectureId, 'lecture');

  const translation = lecture
    ? pickTranslation(lecture.translations, langId)
    : null;

  const isCompleted = locallyCompleted || (lecture?.isCompleted ?? false);

  // Snapshot the latest values for the imperative Vimeo callback.
  const latestRef = useRef({ navItems, isCompleted, lectureId });
  useEffect(() => {
    latestRef.current = { navItems, isCompleted, lectureId };
  });

  const markComplete = progressMutation.mutateAsync;

  const handleVideoEnd = useCallback(async () => {
    if (markingRef.current) return;
    const snapshot = latestRef.current;

    if (!snapshot.isCompleted) {
      try {
        markingRef.current = true;
        await markComplete(snapshot.lectureId);
        setLocallyCompleted(true);
        toast.success(t.progressSaved);
      } catch {
        toast.error(t.loadError);
        return;
      } finally {
        markingRef.current = false;
      }
    }

    const upcoming = findPrevNext(
      snapshot.navItems,
      snapshot.lectureId,
      'lecture'
    ).next;
    if (!upcoming) return;
    if (upcoming.type === 'quiz') {
      setPendingQuizId(upcoming.id);
    } else {
      setTimeout(() => {
        router.push(lecturePath(locale, userCourseId, courseId, upcoming.id));
      }, 1500);
    }
  }, [
    markComplete,
    router,
    locale,
    userCourseId,
    courseId,
    t.progressSaved,
    t.loadError,
  ]);

  const handleVideoEndRef = useRef(handleVideoEnd);
  useEffect(() => {
    handleVideoEndRef.current = handleVideoEnd;
  });

  // Vimeo player lifecycle.
  useEffect(() => {
    const videoUrl = translation?.videoUrl;
    if (!iframeRef.current || !videoUrl) return;
    if (currentUrlRef.current === videoUrl && playerRef.current) return;

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
    currentUrlRef.current = videoUrl;

    function init() {
      if (!window.Vimeo || !iframeRef.current || playerRef.current) return;
      const player = new window.Vimeo.Player(iframeRef.current);
      playerRef.current = player;

      const saved = getVideoProgress(userCourseId, lectureId);
      if (saved > 0) player.setCurrentTime(saved);

      player.on('timeupdate', (data) => {
        saveVideoProgress(userCourseId, lectureId, data.seconds);
      });

      player.on('ended', () => {
        void handleVideoEndRef.current();
      });
    }

    if (!window.Vimeo) {
      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.onload = init;
      document.body.appendChild(script);
    } else {
      init();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current
          .getCurrentTime()
          .then((seconds) =>
            saveVideoProgress(userCourseId, lectureId, seconds)
          )
          .catch(() => {});
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
        currentUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translation?.videoUrl, lectureId]);

  const resources =
    translation?.attachments
      ?.split(',')
      .map((att) => att.trim())
      .filter(Boolean)
      .map((path, idx) => ({
        id: `${idx}`,
        name: path.split('/').pop() || path,
        path,
      })) ?? [];

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white'>
        <div className='space-y-4 text-center'>
          <div className='mx-auto size-16 animate-spin rounded-full border-b-4 border-t-4 border-[#00a8f1]' />
          <p className='text-lg font-medium text-gray-600'>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (isError || !lecture) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
        <div className='mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8'>
          <div className='space-y-6 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg'>
            <div className='mx-auto flex size-20 items-center justify-center rounded-full bg-red-100'>
              <X className='size-10 text-red-600' />
            </div>
            <p className='text-lg text-gray-600'>{t.loadError}</p>
            <Link
              href={learnBasePath(locale, userCourseId, courseId)}
              className='inline-block rounded-lg bg-[#00a8f1] px-6 py-3 font-medium text-white transition-all hover:opacity-90'
            >
              {t.backToCourse}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const BackIcon = rtl ? ChevronRight : ChevronLeft;
  const NextIcon = rtl ? ChevronLeft : ChevronRight;

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      {/* Sticky header */}
      <div className='sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 flex-1 items-center gap-4'>
              <Link
                href={learnBasePath(locale, userCourseId, courseId)}
                className='rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100'
                aria-label={t.backToCourse}
              >
                <BackIcon className='size-5' />
              </Link>
              <h1 className='min-w-0 flex-1 truncate text-lg font-bold text-gray-900 sm:text-xl'>
                {lecture.lessonName && translation?.name ? (
                  <span>
                    <b className='text-[#1e2364]'>{lecture.lessonName}</b> -{' '}
                    {translation.name}
                  </span>
                ) : (
                  translation?.name || t.lecture
                )}
              </h1>
            </div>
            {isCompleted && (
              <span className='flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700'>
                <CheckCircle2 className='size-4' />
                <span className='hidden font-medium md:inline'>
                  {t.completed}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='space-y-6 lg:col-span-2'>
            {/* Video */}
            {translation?.videoUrl ? (
              <div className='overflow-hidden rounded-2xl shadow-2xl'>
                <div className='relative h-0 pb-[56.25%]'>
                  <iframe
                    ref={iframeRef}
                    key={`vimeo-${lectureId}`}
                    src={getVimeoEmbedUrl(translation.videoUrl)}
                    allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share'
                    referrerPolicy='strict-origin-when-cross-origin'
                    className='absolute inset-0 size-full'
                    title={translation?.name || t.lecture}
                  />
                </div>
              </div>
            ) : (
              <div className='overflow-hidden rounded-2xl shadow-2xl'>
                <div className='flex aspect-video items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800'>
                  <div className='space-y-4 text-center'>
                    <div className='mx-auto flex size-20 items-center justify-center rounded-full bg-[#00a8f1]/90 shadow-2xl'>
                      <Play className='ms-1 size-10 text-white' />
                    </div>
                    <p className='text-sm text-white/80'>{t.noVideo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg'>
              <div className='flex border-b border-gray-200'>
                <TabButton
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                  icon={<BookOpen className='size-5' />}
                  label={t.overview}
                />
                <TabButton
                  active={activeTab === 'resources'}
                  onClick={() => setActiveTab('resources')}
                  icon={<Download className='size-5' />}
                  label={t.resources}
                />
              </div>

              <div className='p-6'>
                {activeTab === 'overview' ? (
                  <div className='space-y-4'>
                    <h2 className='text-2xl font-bold text-gray-900'>
                      {translation?.name || t.lecture}
                    </h2>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Clock className='size-4' />
                      <span>
                        {translation?.videoLengthInMinutes || 0} {t.minutes}
                      </span>
                    </div>
                    <div
                      className='prose prose-sm max-w-none leading-relaxed text-gray-700'
                      dangerouslySetInnerHTML={{
                        __html: translation?.description || t.noDescription,
                      }}
                    />
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <h3 className='text-xl font-bold text-gray-900'>
                      {t.downloadResources}
                    </h3>
                    {resources.length > 0 ? (
                      resources.map((resource) => (
                        <div
                          key={resource.id}
                          className='group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100'
                        >
                          <div className='flex min-w-0 items-center gap-3'>
                            <div className='flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#00a8f1]/10'>
                              <FileText className='size-6 text-[#00a8f1]' />
                            </div>
                            <p className='truncate font-medium text-gray-900'>
                              {resource.name}
                            </p>
                          </div>
                          <a
                            href={`${MWAFQ_API_BASE_URL}/${resource.path}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#00a8f1] px-4 py-2 text-sm font-medium text-white opacity-0 transition-all hover:opacity-90 group-hover:opacity-100'
                          >
                            <Download className='size-4' />
                            {t.download}
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className='py-8 text-center text-gray-600'>
                        {t.noResources}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <div className='sticky top-24 space-y-4 rounded-2xl border border-[#00a8f1] bg-white p-6 shadow-lg'>
              <h3 className='text-lg font-bold text-gray-900'>
                {t.lectureProgress}
              </h3>

              {isCompleted && (
                <div className='flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-bold text-white'>
                  <CheckCircle2 className='size-5' />
                  {t.completed}
                </div>
              )}

              <div className='flex gap-2'>
                {prev && (
                  <Link
                    href={
                      prev.type === 'quiz'
                        ? quizPath(locale, userCourseId, courseId, prev.id)
                        : lecturePath(locale, userCourseId, courseId, prev.id)
                    }
                    className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-200'
                  >
                    <BackIcon className='size-4' />
                    <span className='hidden sm:inline'>
                      {prev.type === 'quiz' ? t.previousQuiz : t.previous}
                    </span>
                  </Link>
                )}
                {next &&
                  (isCompleted ? (
                    <Link
                      href={
                        next.type === 'quiz'
                          ? quizPath(locale, userCourseId, courseId, next.id)
                          : lecturePath(locale, userCourseId, courseId, next.id)
                      }
                      className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00a8f1] to-[#1e2364] py-3 text-sm font-medium text-white transition-all hover:opacity-90'
                    >
                      <span className='hidden sm:inline'>
                        {next.type === 'quiz' ? t.goToQuiz : t.next}
                      </span>
                      <NextIcon className='size-4' />
                    </Link>
                  ) : (
                    <span
                      className='flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-300 py-3 text-sm font-medium text-gray-500'
                      title={t.completeToUnlock}
                    >
                      <span className='hidden sm:inline'>
                        {next.type === 'quiz' ? t.goToQuiz : t.next}
                      </span>
                      <NextIcon className='size-4' />
                    </span>
                  ))}
              </div>

              <Link
                href={learnBasePath(locale, userCourseId, courseId)}
                className='block w-full rounded-xl border-2 border-gray-300 py-3 text-center text-sm font-medium text-gray-900 transition-all hover:border-[#00a8f1] hover:text-[#00a8f1]'
              >
                {t.backToCourse}
              </Link>
            </div>

            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg'>
              <h3 className='mb-4 text-lg font-bold text-gray-900'>
                {t.courseInfo}
              </h3>
              <div className='flex items-start gap-3'>
                <BookOpen className='mt-0.5 size-5 shrink-0 text-[#00a8f1]' />
                <p className='font-medium text-gray-900'>
                  {translation?.name || t.lecture}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz warning modal (auto-advance to a quiz) */}
      <Modal
        open={pendingQuizId !== null}
        onClose={() => setPendingQuizId(null)}
        title={t.quizWarningTitle}
      >
        <p className='mb-6 text-gray-600'>{t.quizWarningMessage}</p>
        <div className='flex gap-3'>
          <Button
            variant='secondary'
            className='flex-1'
            onClick={() => setPendingQuizId(null)}
            type='button'
          >
            {t.stayHere}
          </Button>
          <Button
            variant='brand'
            className='flex-1'
            onClick={() => {
              if (pendingQuizId !== null) {
                router.push(
                  quizPath(locale, userCourseId, courseId, pendingQuizId)
                );
              }
            }}
            type='button'
          >
            {t.goToQuiz}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition ${
        active
          ? 'border-b-2 border-[#00a8f1] bg-[#00a8f1]/5 text-[#00a8f1]'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className='hidden sm:inline'>{label}</span>
    </button>
  );
}
