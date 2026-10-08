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
import { getLecturePosition } from './lecture/lecturePosition';
import {
  LecturePlayerSkeleton,
  LectureShell,
  LectureStateCard,
  lectureAsideClass,
  lectureGridClass,
  lectureMainClass,
} from './lecture/LectureStates';
import { LectureSummary } from './lecture/LectureSummary';
import { LectureStage } from './lecture/LectureStage';
import { LectureTopBar } from './lecture/LectureTopBar';
import { VimeoLecturePlayer } from './lecture/VimeoLecturePlayer';

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
    refetch,
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
        title={t.loadError}
        backHref={backHref}
        backLabel={t.backToCourse}
        retryLabel={t.retry}
        onRetry={() => void refetch()}
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

  const position = getLecturePosition(courseData, lectureId);
  const lessonName = lecture.lessonName || position?.lessonTitle || null;

  return (
    <LectureShell>
      <LectureTopBar
        backHref={backHref}
        backLabel={t.backToCourse}
        courseName={courseName}
      />

      {/* Mobile order: video, lecture, curriculum, details. */}
      <div className={lectureGridClass}>
        <div className={lectureMainClass}>
          <LectureStage
            video={
              translation?.videoUrl ? (
                <VimeoLecturePlayer
                  key={`vimeo-${lectureId}`}
                  embedUrl={getVimeoEmbedUrl(translation.videoUrl)}
                  title={lectureTitle}
                  userCourseId={userCourseId}
                  lectureId={lectureId}
                  allowSeek={isCompleted}
                  onEnded={() => void handleVideoEnd()}
                  onUnavailable={() => setVideoUnobservable(true)}
                  labels={t.player}
                />
              ) : null
            }
            unavailable={videoUnobservable}
            labels={t}
          />
        </div>

        <div className={lectureMainClass}>
          <LectureSummary
            lessonName={lessonName}
            position={position}
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
        </div>

        <LectureCurriculum
          className={lectureAsideClass}
          courseData={courseData}
          courseName={courseName}
          currentLectureId={lectureId}
          currentCompleted={isCompleted}
          locale={locale}
          userCourseId={userCourseId}
          courseId={courseId}
        />

        <div className={lectureMainClass}>
          <LectureDetails
            activeTab={activeTab}
            onTabChange={setActiveTab}
            description={translation?.description}
            textContent={translation?.textContent}
            resources={resources}
            labels={t}
          />
        </div>
      </div>

      {/* Quiz warning modal (auto-advance to a quiz) */}
      <Modal
        open={pendingQuizId !== null}
        onClose={() => setPendingQuizId(null)}
        title={t.quizWarningTitle}
      >
        <p className='mb-6 text-[15px] leading-6 text-[#6b7196]'>
          {t.quizWarningMessage}
        </p>
        <div className='flex gap-3'>
          <Button
            variant='productSecondary'
            size='control'
            className='flex-1'
            onClick={() => setPendingQuizId(null)}
            type='button'
          >
            {t.stayHere}
          </Button>
          <Button
            variant='product'
            size='control'
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
    </LectureShell>
  );
}
