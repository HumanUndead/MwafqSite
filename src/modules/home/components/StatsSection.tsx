import type { HomeStatsContent } from '../home.types';
import { CountUp } from './CountingUp';
import { cn } from '@/shared/lib/cn';
import { marketingSectionShellClass } from '@/shared/components/marketing/marketingLayout';

interface Props {
  content: HomeStatsContent;
}

export function StatsSection({ content }: Props) {
  return (
    <section
      id='academy'
      className='relative bg-white px-4 pb-10 pt-14 md:px-7'
    >
      <div
        className='pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(30,35,100,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,100,0.035)_1px,transparent_1px)] bg-size-[32px_32px] opacity-[0.18]'
        aria-hidden='true'
      />
      <div
        className='pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_47%,rgba(30,35,100,0.18)_47%,rgba(30,35,100,0.18)_53%,transparent_53%),linear-gradient(-45deg,transparent_47%,rgba(30,35,100,0.18)_47%,rgba(30,35,100,0.18)_53%,transparent_53%)] bg-size-[30px_30px] mask-[linear-gradient(180deg,transparent_0%,#000_50%,transparent_100%)]'
        aria-hidden='true'
      />
      <div className={cn('relative', marketingSectionShellClass)}>
        <h2 className='relative z-10 mx-auto mb-6 text-center text-[clamp(28px,3.6vw,44px)] font-extrabold uppercase leading-[1.05] tracking-[-0.5px] text-[#1e2364] sm:mb-8 min-[1920px]:text-[clamp(44px,2.8vw,60px)]'>
          {content.title}
        </h2>

        <div className='relative z-10 -mt-2 w-full grid grid-cols-3 gap-0 px-2 pt-4 sm:mt-0 sm:gap-8 sm:px-7 sm:pt-8'>
          {content.items.map((stat) => (
            <div key={stat.label} className='text-center'>
              <div className='text-[clamp(20px,5.5vw,60px)] font-extrabold leading-none tracking-[-1.5px] text-[#00a8f1] sm:tracking-[-2px] min-[1920px]:text-[clamp(60px,4.5vw,96px)]'>
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </div>
              <div className='mt-1 text-[11px] font-bold leading-tight tracking-[0.3px] text-[#1e2364] sm:mt-1.5 sm:text-[14.5px] sm:tracking-[0.5px] min-[1920px]:text-[clamp(14.5px,0.9vw,18px)]'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
