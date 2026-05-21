import type { Dictionary } from '@/locales/types';

interface Props {
  content: Dictionary['b2b']['steps'];
}

export function B2BStepsSection({ content }: Props) {
  return (
    <section
      id='steps'
      className='border-y-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 py-20 sm:px-7 sm:py-[110px]'
    >
      <div className='mx-auto max-w-[1320px]'>
        <div className='mb-14 text-center'>
          <h2 className='text-[clamp(28px,4.2vw,52px)] font-extrabold leading-[1.1] tracking-[-1.4px] text-[#1e2364]'>
            {content.titleLead}{' '}
            <em className='font-normal italic text-[#1e2364]/55'>
              {content.titleAccent}
            </em>
          </h2>
        </div>

        <div className='mx-auto grid max-w-[1180px] grid-cols-1 gap-8 md:grid-cols-3 md:gap-0'>
          {content.items.map((step, index) => (
            <article
              key={step.title}
              className='relative flex flex-col items-center px-0 text-center md:px-6'
            >
              <span
                aria-hidden='true'
                className='z-[2] -mb-[39px] flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-[#1e2364] bg-white text-[30px] font-normal italic leading-none tracking-[-0.4px] text-[#1e2364] [box-shadow:0_0_0_6px_#f4f4f6]'
              >
                {index + 1}
              </span>
              <div className='relative z-[1] flex w-full flex-1 flex-col rounded-[18px] border-2 border-[#1e2364] bg-white px-6 pb-6 pt-14 text-center'>
                <h3 className='mb-2.5 text-[18px] font-extrabold leading-tight tracking-[-0.3px] text-[#1e2364]'>
                  {step.title}
                </h3>
                <p className='text-[14.5px] leading-[1.65] text-[#6b7196]'>
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
