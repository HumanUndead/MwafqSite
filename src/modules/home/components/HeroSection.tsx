/* eslint-disable @next/next/no-img-element */

import type { Locale } from '@/i18n/config';
import type { HomeHeroContent } from '../home.types';
import { CountUp } from './CountingUp';
import { HomeActionLinks } from './HomeActionLinks';
import {
  ArrowIcon,
  BellIcon,
  SearchIcon,
  CarIcon,
  getServiceIconByKey,
} from '@/shared/components/icons/home';
import { RotatingWord } from './RotatingWord';
import { cn } from '@/shared/lib/cn';
import {
  marketingHeroCtaClass,
  marketingHeroLeadClass,
  marketingHeroTitleClass,
  marketingInlineStatLabelClass,
  marketingInlineStatValueClass,
  marketingSectionShellClass,
} from '@/shared/components/marketing/marketingLayout';
import { buttonVariants } from '@/shared/lib/variants';

const phoneTileStyles = [
  { card: 'bg-[#dff5ff]', icon: 'bg-white text-[#27a7e7]' },
  { card: 'bg-[#f1e8fb]', icon: 'bg-white text-[#8a48c7]' },
  { card: 'bg-[#e8fbf7]', icon: 'bg-white text-[#12b7a2]' },
  { card: 'bg-[#edf1ff]', icon: 'bg-white text-[#5d75d6]' },
];

const floatingCardMeta = [
  {
    wrapperClassName:
      'right-0 top-[8%] animate-[floatSoft_5s_ease-in-out_infinite]',
    iconPosition: '-291px -621px',
  },
  {
    wrapperClassName:
      'left-0 top-[46%] animate-[floatTilt_6s_ease-in-out_0.3s_infinite]',
    iconPosition: '-237px -429px',
  },
  {
    wrapperClassName:
      'bottom-[8%] right-0 animate-[floatSoft_5.5s_ease-in-out_0.6s_infinite]',
    iconPosition: '-247px -664px',
  },
] as const;

const floatingCardSprite = '/demo-assets/icons%20and%20vector%20visuals.svg';

interface Props {
  locale: Locale;
  content: HomeHeroContent;
  isRtl: boolean;
}

export function HeroSection({ locale, content, isRtl }: Props) {
  const hasRotatingWords = content.rotatingWords.length > 0;
  const fullTitle = [content.titleLead, content.titleMiddle]
    .filter(Boolean)
    .join(' ')
    .trim();
  const titleWords = fullTitle ? fullTitle.split(/\s+/) : [];
  const titleTail = hasRotatingWords
    ? (titleWords[titleWords.length - 1] ?? '')
    : '';
  const leadWordCount = content.titleLead.trim()
    ? content.titleLead.trim().split(/\s+/).length
    : 0;
  const titleMiddlePart = hasRotatingWords
    ? titleWords.slice(leadWordCount, -1).join(' ')
    : '';



  return (
    <section className='relative flex min-h-dvh flex-col justify-center lg:justify-start overflow-hidden border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-4 pb-20 pt-16 md:px-7 md:pb-16 lg:pb-8 lg:pt-16 min-[1920px]:px-10 min-[1920px]:pt-28 min-[2560px]:pt-36 [@media(max-height:740px)]:lg:pt-20! [@media(max-height:740px)]:lg:pb-6!'>
      <div
        className='pointer-events-none absolute inset-0 opacity-55 bg-[radial-gradient(circle,#e5e7f0_1.2px,transparent_1.2px)] bg-size-[24px_24px] mask-[radial-gradient(circle_at_50%_50%,#000_0%,transparent_75%)]'
        aria-hidden='true'
      />
      <div
        className={cn(
          marketingSectionShellClass,
          'relative -mt-3 grid gap-4 sm:-mt-4 sm:gap-6 lg:grid-cols-[1.05fr_1fr] lg:-mt-5 lg:items-center lg:gap-4',
          'min-[1920px]:gap-5 min-[1920px]:py-4 min-[2560px]:gap-16 min-[2560px]:py-8',
          '[@media(max-height:740px)]:lg:py-0! [@media(max-height:740px)]:lg:gap-4!',
          'lg:grid-rows-[auto_auto]'
        )}
      >
        <div className='order-1'>
          <h1
            className={cn(
              'mb-5 md:mb-7 lg:mb-6 font-extrabold tracking-[-2.6px] text-[#1e2364]',
              'min-[1920px]:mb-8 min-[1920px]:tracking-[-3.5px] min-[2560px]:mb-10',
              '[@media(max-height:740px)]:lg:mb-3! [@media(max-height:740px)]:lg:text-[clamp(30px,2.8vw,44px)]! [@media(max-height:740px)]:lg:tracking-[-1.8px]!',
              marketingHeroTitleClass
            )}
          >
            {hasRotatingWords ? (
              <>
                {content.titleLead ? (
                  <span className='block sm:whitespace-nowrap'>
                    {content.titleLead}
                  </span>
                ) : null}
                <span className='max-[499px]:block min-[500px]:inline min-[500px]:whitespace-nowrap'>
                  <span className='max-[499px]:block min-[500px]:inline'>
                    {titleMiddlePart ? <>{titleMiddlePart} </> : null}
                    {titleTail}
                    <span className='max-[499px]:hidden min-[500px]:inline'>
                      {' '}
                    </span>
                  </span>
                  <span className='max-[499px]:block min-[500px]:inline'>
                    <RotatingWord words={content.rotatingWords} isRtl={isRtl} />
                  </span>
                </span>
              </>
            ) : (
              <>
                {content.titleLead ? (
                  <span className='block sm:whitespace-nowrap'>
                    {content.titleLead}
                  </span>
                ) : null}
                {content.titleMiddle ? (
                  <span className='block'>{content.titleMiddle}</span>
                ) : null}
              </>
            )}
          </h1>

          <p
            className={cn(
              'mb-6 md:mb-9 lg:mb-8 max-w-135 text-[#545a78]',
              'lg:max-w-150 min-[1920px]:mb-10 min-[1920px]:max-w-none min-[2560px]:mb-12',
              '[@media(max-height:740px)]:lg:mb-4! [@media(max-height:740px)]:lg:text-[17px]! [@media(max-height:740px)]:lg:leading-[1.8]!',
              marketingHeroLeadClass
            )}
          >
            {content.subtitle}
          </p>

          <HomeActionLinks
            locale={locale}
            primary={content.primaryAction}
            secondary={content.secondaryAction}
            primaryVariant='brand'
            secondaryVariant='brandOutline'
            className='mb-8 md:mb-11 lg:mb-10 flex flex-wrap gap-3.5 min-[1920px]:mb-12 min-[1920px]:gap-5'
            primaryClassName={cn(
              buttonVariants({
                variant: 'brand',
                size: 'hero',
                shape: 'pill',
              }),
              marketingHeroCtaClass
            )}
            secondaryClassName={cn(
              buttonVariants({
                variant: 'brandOutline',
                size: 'hero',
                shape: 'pill',
              }),
              marketingHeroCtaClass
            )}
            primaryTrailing={
              <ArrowIcon className={isRtl ? 'rotate-180' : undefined} />
            }
          />
        </div>

        <div className='relative z-0 mx-auto order-2 h-115 w-full max-w-140 overflow-hidden min-[600px]:max-lg:mb-6 sm:h-120 sm:overflow-visible lg:z-auto lg:mb-0 lg:h-140 lg:row-span-2 lg:self-center min-[1920px]:h-180 min-[1920px]:max-w-180 min-[2560px]:h-200 min-[2560px]:max-w-200 [@media(max-height:740px)]:lg:h-[440px]!'>
          {content.floatingCards.slice(0, 3).map((card, index) => (
            <div
              key={card.title || index}
              className={`absolute z-5 flex w-fit max-w-[12rem] items-center gap-3 rounded-[17px] border-2 border-[#1e2364] bg-white px-3 py-2.5 pe-3.5 max-[560px]:scale-[0.72] min-[1920px]:max-w-[16rem] min-[1920px]:gap-4 min-[1920px]:rounded-[20px] min-[1920px]:px-4 min-[1920px]:py-3 min-[2560px]:max-w-[18rem] min-[2560px]:scale-110 ${index === 1 ? 'max-[560px]:origin-left' : 'max-[560px]:origin-right'} ${floatingCardMeta[index]?.wrapperClassName ?? ''}`}
            >
              <span
                aria-hidden='true'
                className='block size-10 shrink-0 rounded-[11px] bg-[#fbfcff]'
                style={{
                  backgroundImage: `url("${floatingCardSprite}")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '736px auto',
                  backgroundPosition: floatingCardMeta[index]?.iconPosition,
                }}
              />
              <div className={cn('min-w-0', isRtl ? 'text-right' : '')}>
                <strong className='block text-[14.5px] font-extrabold leading-[1.2] tracking-[-0.25px] text-[#1e2364] min-[1920px]:text-[17px] min-[2560px]:text-[19px]'>
                  {card.title}
                </strong>
                <span className='block text-[10.5px] leading-[1.2] text-[#6b7196] min-[1920px]:text-[13px] min-[2560px]:text-[14px]'>
                  {card.detail}
                </span>
              </div>
            </div>
          ))}

          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 origin-center scale-[0.78] sm:scale-100 min-[1920px]:scale-110 min-[2560px]:scale-125 [@media(max-height:740px)]:lg:scale-[0.8]!'>
            <div className='relative h-135 w-65 animate-[phoneFloat_6s_ease-in-out_infinite] overflow-visible rounded-[42px] border-2 border-[#1e2364] bg-white shadow-[0_20px_60px_rgba(30,35,100,0.12)]'>
              <div className='absolute left-1/2 top-4.5 z-10 h-5.5 w-21 -translate-x-1/2 rounded-[14px] bg-[#1e2364]' />
              <div className='absolute inset-3.5 flex flex-col gap-2.5 overflow-hidden rounded-[36px] border-2 border-[#e5e7f0] bg-white px-3.25 pb-3.5 pt-6'>
                <div className='mt-3.5 flex items-center justify-between'>
                  <div>
                    <p className='text-[11.5px] font-medium leading-none text-[#6b7196]'>
                      {content.phoneGreeting}
                    </p>
                    <p className='mt-1.5 text-[17px] font-extrabold leading-none tracking-[-0.3px] text-[#1e2364]'>
                      {content.phoneName}
                    </p>
                  </div>
                  <div className='relative flex h-9 w-9 items-center justify-center rounded-[11px] border-2 border-[#1e2364] bg-white text-[#1e2364]'>
                    <BellIcon />
                    <span className='absolute -right-0.75 -top-0.75 h-2 w-2 rounded-full border-2 border-white bg-[#ff6b2b]' />
                  </div>
                </div>

                <div className='flex items-center gap-2.5 rounded-[12px] border-2 border-[#eef0f7] bg-[#f2f2f2] px-3.5 py-2.75 text-[12px] font-medium text-[#545a78]'>
                  <SearchIcon />
                  <span>{content.phoneSearchPlaceholder}</span>
                </div>

                <div className='flex items-center justify-between px-0.5'>
                  <span className='text-[11.5px] font-extrabold tracking-[-0.1px] text-[#1e2364]'>
                    {content.servicesTitle}
                  </span>
                  <span className='text-[10px] font-semibold text-[#00a8f1]'>
                    {content.servicesLink}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-2.5'>
                  {content.phoneTiles.map((tile, index) => (
                    <div
                      key={`${tile.title}-${index}`}
                      className={`min-h-24 rounded-[18px] border-2 border-[#1e2364] p-3 pb-2.75 ${phoneTileStyles[index]?.card ?? 'bg-white'}`}
                    >
                      <div
                        className={`mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] ${phoneTileStyles[index]?.icon ?? 'bg-white text-[#1e2364]'}`}
                      >
                        <div className='transform-[scale(0.78)]'>
                          {getServiceIconByKey(tile.iconKey) ?? <CarIcon />}
                        </div>
                      </div>
                      <p className='text-[11.5px] font-extrabold leading-[1.15] tracking-[-0.2px] text-[#1e2364]'>
                        {tile.title}
                      </p>
                      <p className='mt-0.5 text-[9.5px] font-medium leading-[1.2] text-[#6b7196]'>
                        {tile.subtitle}
                      </p>
                    </div>
                  ))}
                </div>

                <div className='mt-auto flex items-center gap-2.5 rounded-[14px] bg-[#1e2364] px-3.5 py-2.75 text-white'>
                  <span
                    className='h-2 w-2 shrink-0 rounded-full bg-[#00a8f1] shadow-[0_0_0_3px_rgba(0,168,241,0.25)] animate-[phLivePulse_1.6s_ease-in-out_infinite]'
                    aria-hidden='true'
                  />
                  <span className='flex flex-1 items-baseline gap-1.5'>
                    <strong className='text-[14px] font-extrabold tracking-[-0.3px] text-[#00a8f1]'>
                      {content.liveBookings}
                    </strong>
                    <span className='text-[10.5px] opacity-85'>
                      {content.liveBookingsLabel}
                    </span>
                  </span>
                  <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] bg-white/[0.14]'>
                    <ArrowIcon className={isRtl ? 'rotate-180' : undefined} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'relative z-10 order-3 grid grid-cols-3 gap-4 max-[599px]:mt-8 sm:gap-7.5',
            'min-[600px]:max-lg:mt-10 lg:mt-12 lg:self-start [@media(max-height:740px)]:lg:mt-8!',
            'min-[1920px]:mt-14 min-[2000px]:flex min-[2000px]:w-fit min-[2000px]:max-w-full min-[2000px]:flex-wrap min-[2000px]:justify-start min-[2000px]:gap-12',
            'min-[2560px]:gap-20'
          )}
        >
          {content.stats.map((stat) => (
            <div key={stat.label} className='text-center'>
              <div
                className={cn(
                  'inline-flex items-baseline gap-0.5 whitespace-nowrap font-extrabold leading-none tracking-[-1px] text-[#1e2364]',
                  marketingInlineStatValueClass
                )}
              >
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  trigger='mount'
                />
              </div>
              <p
                className={cn(
                  'mt-1 font-medium tracking-[0.4px] text-[#6b7196]',
                  marketingInlineStatLabelClass
                )}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
