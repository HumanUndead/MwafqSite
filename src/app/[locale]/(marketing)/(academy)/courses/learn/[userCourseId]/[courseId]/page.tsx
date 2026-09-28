import { CoursePlayerOverview } from '@/modules/academy/components/CoursePlayerOverview';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{ userCourseId: string; courseId: string }>;
};

export default async function CourseLearnPage({ params }: PageProps) {
  const { userCourseId, courseId } = await params;

  return (
    // Slim offset: the rounded stage floats just below the pill header on the
    // mist ground, instead of the tall breadcrumb-page offset.
    <MarketingStickyHeaderOffset variant='academy'>
      <CoursePlayerOverview
        userCourseId={Number(userCourseId)}
        courseId={Number(courseId)}
      />
    </MarketingStickyHeaderOffset>
  );
}
