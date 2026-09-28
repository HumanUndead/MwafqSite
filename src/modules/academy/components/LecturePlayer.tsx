'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { toast } from '@/shared/components/feedback/Toast';
import { isActivityLockedById } from '../courseLocking.shared';
import { transformCourseDetailToCourseData } from '../courseTransform.shared';
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
import { LectureCurriculum } from './lecture/LectureCurriculum';
import { LectureDetails } from './lecture/LectureDetails';
import {
  LecturePlayerSkeleton,
  LectureStateCard,
} from './lecture/LectureStates';
import { LectureSummary } from './lecture/LectureSummary';
import { LectureStage } from './lecture/LectureStage';
import { AcademyBackdrop } from './ui/AcademyGlass';

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
  // The player API could not be driven: no `ended` event will ever come.
  const [videoUnobservable, setVideoUnobservable] = useState(false);
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
      script.onerror = () => setVideoUnobservable(true);
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

  const courseData = courseDetail
    ? transformCourseDetailToCourseData(courseDetail, String(courseId))
    : null;
  const isLocked = courseData
    ? isActivityLockedById(courseData, 'lecture', lectureId)
    : false;

  // Mobile completes a lecture on video end; without an observable video the
  // learner confirms it instead, so the next topic can unlock.
  const canMarkManually =
    !isCompleted && (!translation?.videoUrl || videoUnobservable);

  async function handleManualComplete() {
    if (markingRef.current) return;
    try {
      markingRef.current = true;
      await markComplete(lectureId);
      setLocallyCompleted(true);
      toast.success(t.progressSaved);
    } catch {
      toast.error(t.loadError);
    } finally {
      markingRef.current = false;
    }
  }

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

  const backHref = learnBasePath(locale, userCourseId, courseId);

  if (isLoading) {
    return <LecturePlayerSkeleton label={t.loading} />;
  }

  if (isError || !lecture) {
    return (
      <LectureStateCard
        tone='error'
        message={t.loadError}
        backHref={backHref}
        backLabel={t.backToCourse}
      />
    );
  }

  if (isLocked) {
    return (
      <LectureStateCard
        tone='locked'
        title={t.lockedTitle}
        message={t.lockedMessage}
        backHref={backHref}
        backLabel={t.backToCourse}
      />
    );
  }

  const itemHref = (item: NavItem) =>
    item.type === 'quiz'
      ? quizPath(locale, userCourseId, courseId, item.id)
      : lecturePath(locale, userCourseId, courseId, item.id);

  const lectureTitle = translation?.name || t.lecture;
  const courseName = lecture.courseName || translation?.name || t.lecture;

  return (
    <AcademyBackdrop>
      <div className='mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>
        <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
          <div className='min-w-0 space-y-6'>
            {/* Stage: course context + video */}
            <LectureStage
              backHref={backHref}
              courseName={courseName}
              embedUrl={
                translation?.videoUrl
                  ? getVimeoEmbedUrl(translation.videoUrl)
                  : null
              }
              iframeRef={iframeRef}
              iframeKey={`vimeo-${lectureId}`}
              videoTitle={lectureTitle}
              labels={t}
            />

            <LectureSummary
              lessonName={lecture.lessonName && translation?.name ? lecture.lessonName : null}
              title={lectureTitle}
              minutes={translation?.videoLengthInMinutes || 0}
              isRevision={Boolean(lecture.isRevision)}
              isCompleted={isCompleted}
              canMarkManually={canMarkManually}
              marking={progressMutation.isPending}
              onMarkComplete={() => void handleManualComplete()}
              prev={prev}
              next={next}
              prevHref={prev ? itemHref(prev) : null}
              nextHref={next ? itemHref(next) : null}
              labels={t}
            />

            <LectureDetails
              activeTab={activeTab}
              onTabChange={setActiveTab}
              description={translation?.description}
              textContent={translation?.textContent}
              resources={resources}
              labels={t}
            />
          </div>

          <LectureCurriculum
            courseData={courseData}
            courseName={courseName}
            currentLectureId={lectureId}
            currentCompleted={isCompleted}
            locale={locale}
            userCourseId={userCourseId}
            courseId={courseId}
          />
        </div>
      </div>

      {/* Quiz warning modal (auto-advance to a quiz) */}
      <Modal
        open={pendingQuizId !== null}
        onClose={() => setPendingQuizId(null)}
        title={t.quizWarningTitle}
      >
        <p className='mb-6 text-[#6b7196]'>{t.quizWarningMessage}</p>
        <div className='flex gap-3'>
          <Button
            variant='secondary'
            shape='pill'
            className='flex-1'
            onClick={() => setPendingQuizId(null)}
            type='button'
          >
            {t.stayHere}
          </Button>
          <Button
            variant='brand'
            shape='pill'
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
    </AcademyBackdrop>
  );
}
