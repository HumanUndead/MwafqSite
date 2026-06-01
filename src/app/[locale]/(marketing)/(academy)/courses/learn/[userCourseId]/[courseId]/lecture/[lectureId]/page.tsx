import { LecturePlayer } from '@/modules/academy/components/LecturePlayer';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{
    userCourseId: string;
    courseId: string;
    lectureId: string;
  }>;
};

export default async function LecturePage({ params }: PageProps) {
  const { userCourseId, courseId, lectureId } = await params;

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <LecturePlayer
        key={lectureId}
        userCourseId={Number(userCourseId)}
        courseId={Number(courseId)}
        lectureId={Number(lectureId)}
      />
    </MarketingStickyHeaderOffset>
  );
}
