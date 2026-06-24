import type { HomeAcademyContent } from '../home.types';
import { AcademyCourseGrid } from './AcademyCourseGrid';

interface Props {
  content: HomeAcademyContent;
}

export function AcademySection({ content }: Props) {
  return (
    <section className='relative z-20 -mt-10 overflow-hidden rounded-t-[40px] bg-white pb-10 pt-10 lg:mt-20 lg:rounded-t-[60px] lg:pt-16'>
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.18] bg-[linear-gradient(rgba(30,35,100,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,100,0.035)_1px,transparent_1px)] bg-size-[32px_32px]'
        aria-hidden='true'
      />
      <div className='relative mx-auto max-w-330 px-4 md:px-7'>
        <AcademyCourseGrid content={content} />
      </div>
    </section>
  );
}
