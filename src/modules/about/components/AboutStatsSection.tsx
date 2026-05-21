import type { Dictionary } from '@/locales/types';
import { CountUp } from '@/modules/home/components/CountingUp';

interface Props {
  items: Dictionary['about']['stats'];
}

export function AboutStatsSection({ items }: Props) {
  return (
    <section className='border-y-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 py-14 sm:px-7 sm:py-[70px]'>
      <div className='mx-auto max-w-[1320px]'>
        <div className='grid grid-cols-1 text-center sm:grid-cols-2 lg:grid-cols-4'>
          {items.map((stat, index) => {
            const isLast = index === items.length - 1;
            const isMobileBordered = index < items.length - 1;
            return (
              <div
                key={stat.label}
                className={[
                  'px-6 py-6 sm:px-6 sm:py-4',
                  isMobileBordered
                    ? 'border-b border-[#e5e7f0] sm:border-b-0'
                    : '',
                  index === 0 ? 'sm:border-e sm:border-[#e5e7f0]' : '',
                  index === 1
                    ? 'sm:border-b sm:border-[#e5e7f0] lg:border-e lg:border-b-0 lg:border-[#e5e7f0]'
                    : '',
                  index === 2 ? 'sm:border-e sm:border-[#e5e7f0]' : '',
                  isLast ? '' : '',
                ].join(' ')}
              >
                <div className='mb-2.5 flex items-baseline justify-center gap-1 text-[clamp(32px,4.2vw,54px)] font-extrabold leading-none tracking-[-1.4px] text-[#00a8f1]'>
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </div>
                <div className='text-[13.5px] font-bold uppercase tracking-[1.4px] text-[#6b7196]'>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
