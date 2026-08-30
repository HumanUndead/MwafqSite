import { Accordion } from '@base-ui/react/accordion';
import type { FaqContent } from '@/modules/b2b/server/b2bContentService';
import { cn } from '@/shared/lib/cn';

interface Props {
  content: FaqContent;
  isRtl: boolean;
}

export function B2BFaqSection({ content, isRtl }: Props) {
  if (content.items.length === 0) return null;

  return (
    <section className='bg-[#f4f4f6] px-4 py-12 sm:px-7 sm:py-20'>
      <div className='mx-auto max-w-[760px]'>
        <div className='mb-10 text-center'>
          <h2 className='text-[clamp(28px,4.2vw,44px)] font-extrabold leading-[1.1] tracking-[-1.2px] text-[#1e2364]'>
            {content.title}
          </h2>
        </div>

        <Accordion.Root className='flex flex-col gap-3'>
          {content.items.map((item, index) => (
            <Accordion.Item
              key={item.question}
              value={item.question}
              className='group/faq-item overflow-hidden rounded-[16px] border-2 border-[#e5e7f0] bg-white transition-colors data-open:border-[#1e2364]'
            >
              <Accordion.Header>
                <Accordion.Trigger
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className={cn(
                    'group/faq-trigger flex w-full items-center gap-4 px-5 py-4.5 outline-none sm:px-6',
                    isRtl ? 'text-right' : 'text-left'
                  )}
                >
                  <span className='flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1e2364]/15 text-[13px] font-extrabold text-[#1e2364]/50 transition-colors group-data-open/faq-item:border-[#1e2364] group-data-open/faq-item:bg-[#1e2364] group-data-open/faq-item:text-white'>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className='flex-1 text-[15.5px] font-extrabold leading-snug text-[#1e2364] sm:text-[16.5px]'>
                    {item.question}
                  </span>

                  <span
                    aria-hidden='true'
                    className='relative flex size-6 shrink-0 items-center justify-center'
                  >
                    <span className='absolute h-[2px] w-3 rounded-full bg-[#00a8f1]' />
                    <span className='absolute h-[2px] w-3 rotate-90 rounded-full bg-[#00a8f1] transition-transform duration-200 group-aria-expanded/faq-trigger:rotate-0' />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Panel
                dir={isRtl ? 'rtl' : 'ltr'}
                className='overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up'
              >
                <div
                  className={cn(
                    'pb-5 text-[14px] leading-[1.7] text-[#6b7196] sm:text-[14.5px]',
                    isRtl
                      ? 'pr-[68px] pl-5 text-right sm:pr-[76px] sm:pl-6'
                      : 'pl-[68px] pr-5 text-left sm:pl-[76px] sm:pr-6'
                  )}
                >
                  {item.answer}
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
