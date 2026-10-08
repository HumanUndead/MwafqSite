'use client';

import { VideoOff } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Dictionary } from '@/locales/types';
import { EmptyState, Notice, Panel } from '@/shared/components/product';

/**
 * The video area: the player in a plain black frame, or a short
 * "no video" panel for text-only lectures.
 */
export function LectureStage({
  video,
  unavailable,
  labels: t,
}: {
  /** The player, or null when the lecture has no video. */
  video: ReactNode | null;
  /** The player API could not be driven (SDK blocked or failed). */
  unavailable: boolean;
  labels: Dictionary['academyLecture'];
}) {
  if (!video) {
    return (
      <Panel flush>
        <EmptyState icon={<VideoOff aria-hidden />} title={t.noVideo} className='py-10' />
      </Panel>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      {/* The player keeps its own control bar LTR. */}
      <div className='overflow-hidden rounded-xl bg-black'>
        {video}
      </div>
      {unavailable ? <Notice tone='warning'>{t.videoUnavailable}</Notice> : null}
    </div>
  );
}
