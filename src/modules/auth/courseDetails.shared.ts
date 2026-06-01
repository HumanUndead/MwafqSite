/** Plain text when API returns HTML in description fields. */
export function plainTextFromHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatCourseDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function lessonDurationMinutes(
  lectures: readonly { videoLengthInMinutes?: number | null }[]
): number {
  return lectures.reduce(
    (acc, lecture) => acc + (lecture.videoLengthInMinutes ?? 0),
    0
  );
}

export function tagListFromCourse(tags: string | undefined): string[] {
  if (!tags?.trim()) return [];
  return tags
    .split(/[,،]/)
    .map((t) => t.trim())
    .filter(Boolean);
}
