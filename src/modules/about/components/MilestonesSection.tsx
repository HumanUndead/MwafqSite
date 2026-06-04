import type { AboutMilestonesContent } from '@/modules/about/types/aboutContent';
import { Eyebrow } from '@/modules/home/components/Eyebrow';

interface Props {
  content: AboutMilestonesContent;
}

export function MilestonesSection({ content }: Props) {
  const items = content.items;
  const lastIndex = items.length - 1;

  return (
    <section
      id='milestones'
      className='bg-[#eeeeef] px-4 py-20 sm:px-7 sm:py-[110px]'
    >
      <div className='mx-auto max-w-[1320px]'>
        <div className='mx-auto mb-14 max-w-[780px] text-center'>
          <div className='inline-block'>
            <Eyebrow>{content.eyebrow}</Eyebrow>
          </div>
          <h2 className='mt-6 text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]'>
            {content.titleLead}
            <br />
            {content.titleAccent}
          </h2>
        </div>

        <div className='relative pt-6'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute left-0 right-0 top-[80px] hidden h-[2px] bg-[#e5e7f0] lg:block'
          />

          <div className='relative z-2 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6'>
            {items.map((milestone, index) => {
              const isActive = index === lastIndex;
              return (
                <div key={milestone.year} className='px-3 text-center'>
                  <div className='relative mx-auto mb-5 inline-flex'>
                    <span
                      className={[
                        'inline-flex h-[78px] w-[78px] items-center justify-center rounded-full border-2 text-[15px] font-extrabold tracking-[0.5px]',
                        isActive
                          ? 'border-[#00a8f1] bg-[#00a8f1] text-white'
                          : 'border-[#1e2364] bg-white text-[#1e2364]',
                      ].join(' ')}
                    >
                      {milestone.year}
                    </span>
                    {isActive ? (
                      <span
                        aria-hidden='true'
                        className='pointer-events-none absolute -inset-1.5 rounded-full border-2 border-[#00a8f1] opacity-60'
                      />
                    ) : null}
                  </div>
                  <h3 className='mb-2 text-[17px] font-extrabold tracking-[-0.3px] text-[#1e2364]'>
                    {milestone.title}
                  </h3>
                  <p className='text-[14px] leading-[1.55] text-[#6b7196]'>
                    {milestone.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
