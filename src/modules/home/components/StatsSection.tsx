import type { HomeStatsContent } from '../home.types';
import { CountUp } from './CountingUp';

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
        className='pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(30,35,100,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,100,0.035)_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.18]'
        aria-hidden='true'
      />
      <div
        className='pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(45deg,transparent_47%,rgba(30,35,100,0.18)_47%,rgba(30,35,100,0.18)_53%,transparent_53%),linear-gradient(-45deg,transparent_47%,rgba(30,35,100,0.18)_47%,rgba(30,35,100,0.18)_53%,transparent_53%)] [background-size:30px_30px] [mask-image:linear-gradient(180deg,transparent_0%,#000_50%,transparent_100%)]'
        aria-hidden='true'
      />
      <div className='relative mx-auto max-w-[1320px]'>
        <h2 className='relative z-10 mx-auto mb-9 text-center text-[clamp(28px,3.6vw,44px)] font-extrabold uppercase leading-[1.05] tracking-[-0.5px] text-[#1e2364]'>
          {content.title}
        </h2>

        <div className='relative z-10 w-full grid gap-8 px-0 pt-10 sm:grid-cols-2 sm:px-7 sm:pt-15 lg:grid-cols-3'>
          {content.items.map((stat) => (
            <div key={stat.label} className='text-center flex-1'>
              <div className='text-[clamp(36px,5vw,60px)] font-extrabold leading-none tracking-[-2px] text-[#00a8f1]'>
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </div>
              <div className='mt-3.5 text-[14.5px] font-bold tracking-[0.5px] text-[#1e2364]'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
