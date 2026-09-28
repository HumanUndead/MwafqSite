/**
 * Per-lecture video positions in localStorage (`userVideoProgress`, the
 * format the site already used): where to resume, and the furthest point
 * reached. Until a lecture is completed the learner can't seek past the
 * furthest point.
 */

const PROGRESS_KEY = 'userVideoProgress';
const MAX_WATCHED_KEY = 'userVideoMaxWatched';

function entryKey(userCourseId: number, lectureId: number): string {
  return `${userCourseId}_${lectureId}`;
}

function readEntry(storageKey: string, key: string): number {
  try {
    const stored = localStorage.getItem(storageKey) || '';
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

function writeEntry(storageKey: string, key: string, seconds: number): void {
  try {
    const stored = localStorage.getItem(storageKey) || '';
    const entries = stored.split(',').filter((entry) => {
      const lastDash = entry.lastIndexOf('-');
      return lastDash === -1 || entry.slice(0, lastDash) !== key;
    });
    entries.push(`${key}-${Math.floor(seconds)}`);
    localStorage.setItem(storageKey, entries.join(','));
  } catch {
    // Storage unavailable (private mode): progress just isn't remembered.
  }
}

export function getVideoProgress(userCourseId: number, lectureId: number): number {
  return readEntry(PROGRESS_KEY, entryKey(userCourseId, lectureId));
}

export function saveVideoProgress(
  userCourseId: number,
  lectureId: number,
  seconds: number
): void {
  writeEntry(PROGRESS_KEY, entryKey(userCourseId, lectureId), seconds);
}

export function getMaxWatched(userCourseId: number, lectureId: number): number {
  return readEntry(MAX_WATCHED_KEY, entryKey(userCourseId, lectureId));
}

export function saveMaxWatched(
  userCourseId: number,
  lectureId: number,
  seconds: number
): void {
  writeEntry(MAX_WATCHED_KEY, entryKey(userCourseId, lectureId), seconds);
}
