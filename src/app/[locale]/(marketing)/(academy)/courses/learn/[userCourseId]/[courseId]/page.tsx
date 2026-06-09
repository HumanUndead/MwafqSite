import { CoursePlayerOverview } from '@/modules/academy/components/CoursePlayerOverview';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{ userCourseId: string; courseId: string }>;
};

export default async function CourseLearnPage({ params }: PageProps) {
  const { userCourseId, courseId } = await params;

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <CoursePlayerOverview
        userCourseId={Number(userCourseId)}
        courseId={Number(courseId)}
      />
    </MarketingStickyHeaderOffset>
  );
}
