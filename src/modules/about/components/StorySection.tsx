import type { AboutStoryContent } from '@/modules/about/types/aboutContent';
import { CornerBracketIcon } from '@/shared/components/icons/about';

interface Props {
  content: AboutStoryContent;
}

export function StorySection({ content }: Props) {
  return (
    <section className='bg-white'>
    <div
      id='story'
      className='relative overflow-hidden mx-auto max-w-7xl px-4 py-24 sm:px-7 sm:py-32 lg:py-40'
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(#eef0f7_1px,transparent_1px),linear-gradient(90deg,#eef0f7_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_70%)]'
      />

      <div className='relative z-2 text-center'>
        <span
          aria-hidden='true'
          className='pointer-events-none absolute top-0 start-0 block h-14 w-14 text-[#00a8f1]/85 rtl:scale-x-[-1] sm:h-22.5 sm:w-22.5'
        >
          <CornerBracketIcon className='h-full w-full' />
        </span>

        <span
          aria-hidden='true'
          className='pointer-events-none absolute bottom-0 end-0 block h-14 w-14 rotate-180 text-[#00a8f1]/85 rtl:scale-x-[-1] sm:h-22.5 sm:w-22.5'
        >
          <CornerBracketIcon className='h-full w-full' />
        </span>

        <h2 className='mb-9 text-[clamp(20px,3vw,42px)] font-extrabold leading-[1.1] tracking-[-1px] text-[#1e2364]'>
          {content.title}
        </h2>
        <p className='text-[clamp(22px,3.5vw,44px)] font-light italic leading-[1.3] tracking-[-1px] text-[#1e2364]'>
          {content.body}
        </p>
      </div>
    </div>
    </section>
  );
}
