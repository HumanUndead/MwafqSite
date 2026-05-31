import type { Dictionary } from '@/locales/types';
import { Eyebrow } from '@/modules/home/components/Eyebrow';
import {
  CareIcon,
  SpeedIcon,
  TrustIcon,
} from '@/shared/components/icons/about';

interface Props {
  content: Dictionary['about']['values'];
}

const valueIcons = [TrustIcon, SpeedIcon, CareIcon];

export function ValuesSection({ content }: Props) {
  return (
    <section className='bg-[#eeeeef] px-4 py-20 sm:px-7 sm:py-[110px]'>
      <div className='mx-auto max-w-[1320px]'>
        <div className='mx-auto mb-12 max-w-[780px] text-center'>
          <div className='inline-block'>
            <Eyebrow>{content.eyebrow}</Eyebrow>
          </div>
        </div>

        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {content.items.map((item, index) => {
            const Icon = valueIcons[index] ?? TrustIcon;
            return (
              <article
                key={item.title}
                className='rounded-[28px] border-2 border-[#1e2364] bg-white px-8 py-8'
              >
                <div className='mb-3.5 flex items-center justify-between gap-3.5'>
                  <h3 className='text-[20px] font-extrabold tracking-[-0.3px] text-[#1e2364]'>
                    {item.title}
                  </h3>
                  <span className='inline-flex shrink-0 items-center justify-center text-[#1e2364]'>
                    <Icon className='h-[30px] w-[30px]' />
                  </span>
                </div>
                <p className='text-[14.5px] leading-[1.65] text-[#6b7196]'>
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
