import { QuizHistory } from '@/modules/academy/components/QuizHistory';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{
    userCourseId: string;
    courseId: string;
    quizId: string;
  }>;
  searchParams: Promise<{ lessonId?: string }>;
};

export default async function QuizHistoryPage({
  params,
  searchParams,
}: PageProps) {
  const { userCourseId, courseId, quizId } = await params;
  const { lessonId } = await searchParams;

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <QuizHistory
        userCourseId={Number(userCourseId)}
        courseId={Number(courseId)}
        quizId={Number(quizId)}
        lessonId={lessonId ?? null}
      />
    </MarketingStickyHeaderOffset>
  );
}
