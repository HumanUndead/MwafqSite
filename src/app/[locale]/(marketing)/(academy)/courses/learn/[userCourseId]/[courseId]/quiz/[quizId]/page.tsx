import { QuizRunner } from '@/modules/academy/components/QuizRunner';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{
    userCourseId: string;
    courseId: string;
    quizId: string;
  }>;
};

export default async function QuizPage({ params }: PageProps) {
  const { userCourseId, courseId, quizId } = await params;

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <QuizRunner
        userCourseId={Number(userCourseId)}
        courseId={Number(courseId)}
        quizId={Number(quizId)}
      />
    </MarketingStickyHeaderOffset>
  );
}
