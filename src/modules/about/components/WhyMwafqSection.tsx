import type { AboutWhyContent } from '@/modules/about/types/aboutContent';
import { Eyebrow } from '@/modules/home/components/Eyebrow';

interface Props {
  content: AboutWhyContent;
}

export function WhyMwafqSection({ content }: Props) {
  return (
    <section
      id='why'
      className='border-y-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 py-12 sm:px-7 sm:py-16'
    >
      <div className='mx-auto max-w-[1320px]'>
        <div className='grid items-start gap-10 lg:grid-cols-2 lg:gap-[70px]'>
          <div>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 className='mb-5 text-[clamp(30px,3.6vw,46px)] font-extrabold leading-[1.1] tracking-[-1.2px] text-[#1e2364]'>
              {content.titleLead}{' '}
              <em className='font-normal italic text-[#00a8f1]/95'>
                {content.titleAccent}
              </em>
            </h2>
            <p className='text-[16px] leading-[1.7] text-[#6b7196]'>
              {content.body}
            </p>
          </div>

          <ul className='flex flex-col gap-4'>
            {content.items.map((item, index) => (
              <li
                key={item.title}
                className='flex items-start gap-4 rounded-[20px] border-2 border-[#e5e7f0] bg-white px-6 py-5 sm:px-7 sm:py-[22px]'
              >
                <span className='inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border-2 border-[#00a8f1] bg-[#e8f6fd] text-[15px] font-extrabold text-[#00a8f1]'>
                  {index + 1}
                </span>
                <div>
                  <h3 className='mb-1.5 text-[17px] font-extrabold tracking-[-0.3px] text-[#1e2364]'>
                    {item.title}
                  </h3>
                  <p className='text-[14.5px] leading-[1.6] text-[#6b7196]'>
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
