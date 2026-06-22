'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import type { HomeTestimonialContent } from '../home.types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/shared/lib/cn';
import { useLocale } from '@/i18n/DictionaryProvider';
import { isRtl } from '@/i18n/config';
import { ArrowIcon } from '@/shared/components/icons/home';

const AUTOPLAY_MS = 3000;

interface Props {
  items: HomeTestimonialContent[];
}

function CarouselDots({ count, current }: { count: number; current: number }) {
  const { api } = useCarousel();
  return (
    <div className='mt-8 flex justify-center gap-2'>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type='button'
          onClick={() => api?.scrollTo(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === current ? 'true' : undefined}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i === current ? 'w-6 bg-[#00a8f1]' : 'w-2 bg-[#d0d3e8]'
          )}
        />
      ))}
    </div>
  );
}

function CarouselArrows({ rtl }: { rtl: boolean }) {
  const { scrollPrev, scrollNext } = useCarousel();

  const btnClass =
    'inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#e5e7f0] bg-white text-[#1e2364] shadow-sm transition-colors duration-200 hover:border-[#00a8f1] hover:bg-[#00a8f1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2';

  return (
    <>
      <button
        type='button'
        onClick={scrollPrev}
        aria-label='Previous testimonial'
        className={cn(
          btnClass,
          'absolute top-[38%] z-10 -translate-y-1/2 start-0 md:start-2'
        )}
      >
        <ArrowIcon className={cn('size-4', !rtl && 'rotate-180')} />
      </button>
      <button
        type='button'
        onClick={scrollNext}
        aria-label='Next testimonial'
        className={cn(
          btnClass,
          'absolute top-[38%] z-10 -translate-y-1/2 end-0 md:end-2'
        )}
      >
        <ArrowIcon className={cn('size-4', rtl && 'rotate-180')} />
      </button>
    </>
  );
}

export function TestimonialSection({ items }: Props) {
  const locale = useLocale();
  const rtl = isRtl(locale);
  const [current, setCurrent] = useState(0);

  const validItems = items.filter(
    (item) => item.quote?.trim() || item.author?.trim()
  );
  const hasMultiple = validItems.length > 1;

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: AUTOPLAY_MS,
        playOnInit: true,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      }),
    []
  );

  useEffect(() => {
    if (!hasMultiple) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      autoplayPlugin.stop();
    }
  }, [hasMultiple, autoplayPlugin]);

  const onSelect = useCallback((embla: CarouselApi) => {
    if (!embla) return;
    setCurrent(embla.selectedScrollSnap());
  }, []);

  const handleSetApi = useCallback(
    (emblaApi: CarouselApi) => {
      if (!emblaApi) return;
      onSelect(emblaApi);
      emblaApi.on('select', () => onSelect(emblaApi));
      emblaApi.on('reInit', () => onSelect(emblaApi));
    },
    [onSelect]
  );

  if (validItems.length === 0) return null;

  return (
    <section className='relative overflow-hidden bg-white py-12 md:py-20'>
      <div
        className='pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(#eef0f7_1px,transparent_1px),linear-gradient(90deg,#eef0f7_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_70%)]'
        aria-hidden='true'
      />
      <div className='relative mx-auto max-w-[1320px] px-4 md:px-7'>
        <Carousel
          opts={{ loop: hasMultiple, direction: rtl ? 'rtl' : 'ltr' }}
          plugins={hasMultiple ? [autoplayPlugin] : undefined}
          setApi={handleSetApi}
          className='w-full'
        >
          <div className='relative px-10 md:px-14'>
            {hasMultiple && <CarouselArrows rtl={rtl} />}
            <CarouselContent>
              {validItems.map((item, i) => (
                <CarouselItem key={i}>
                  <div className='relative z-10 mx-auto max-w-[980px] text-center'>
                    <div className='mb-9 text-[clamp(26px,3.5vw,44px)] font-light italic leading-[1.3] tracking-[-1px] text-[#1e2364]'>
                      {item.quote}
                      {item.highlight && (
                        <>
                          {' '}
                          <em className='not-italic font-semibold text-[#00a8f1]'>
                            {item.highlight}
                          </em>
                        </>
                      )}
                    </div>
                    <div className='inline-flex items-center gap-3.5'>
                      <div
                        className='h-14 w-14 rounded-full bg-[#f2f3f7]'
                        aria-hidden='true'
                      />
                      <div className='text-start'>
                        <strong className='block text-[14.5px] text-[#1e2364]'>
                          {item.author}
                        </strong>
                        <span className='text-[13px] text-[#6b7196]'>
                          {item.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
          {hasMultiple && (
            <CarouselDots count={validItems.length} current={current} />
          )}
        </Carousel>
      </div>
    </section>
  );
}
