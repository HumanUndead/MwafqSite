import type { AboutStatItemContent } from '@/modules/about/types/aboutContent';
import { CountUp } from '@/modules/home/components/CountingUp';
import { cn } from '@/shared/lib/cn';

interface Props {
  items: AboutStatItemContent[];
}

export function AboutStatsSection({ items }: Props) {
  return (
    <section className='border-y-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 py-8 sm:px-7 sm:py-10'>
      <div className='mx-auto max-w-[1320px]'>
        <div className='flex flex-wrap items-stretch justify-center text-center'>
          {items.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                'px-8 py-6 sm:px-10',
                index > 0 && 'border-s border-[#e5e7f0]'
              )}
            >
              <div className='mb-2.5 flex items-baseline justify-center gap-1 text-[clamp(32px,4.2vw,54px)] font-extrabold leading-none tracking-[-1.4px] text-[#00a8f1]'>
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <div className='text-[13.5px] font-bold uppercase tracking-[1.4px] text-[#6b7196]'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
