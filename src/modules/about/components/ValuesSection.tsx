import type { ComponentType, SVGProps } from 'react';
import type { AboutValuesContent } from '@/modules/about/types/aboutContent';
import { Eyebrow } from '@/modules/home/components/Eyebrow';
import {
  CareIcon,
  CollaborationIcon,
  FlexibilityIcon,
  InnovationIcon,
  SpeedIcon,
  TrustIcon,
} from '@/shared/components/icons/about';

interface Props {
  content: AboutValuesContent;
}

type ValueIcon = ComponentType<SVGProps<SVGSVGElement>>;

const VALUE_ICON_BY_KEY: Record<string, ValueIcon> = {
  flexibility: FlexibilityIcon,
  quality: TrustIcon,
  innovation: InnovationIcon,
  'speed-efficiency': SpeedIcon,
  collaboration: CollaborationIcon,
  'health-awareness': CareIcon,
};

function getValueIcon(key: string): ValueIcon {
  return VALUE_ICON_BY_KEY[key] ?? TrustIcon;
}

export function ValuesSection({ content }: Props) {
  return (
    <section className='bg-[#eeeeef] px-4 py-12 sm:px-7 sm:py-16'>
      <div className='mx-auto max-w-[1320px]'>
        <div className='max-w-[780px]'>
          <div className='inline-block'>
            <Eyebrow>{content.eyebrow}</Eyebrow>
          </div>
        </div>

        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {content.items.map((item) => {
            const Icon = getValueIcon(item.key);
            return (
              <article
                key={item.key}
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
