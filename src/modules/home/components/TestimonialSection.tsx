'use client';

import { useState, useCallback } from 'react';
import type { HomeTestimonialContent } from '../home.types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/shared/lib/cn';

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
          onClick={() => api?.scrollTo(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i === current ? 'w-6 bg-[#00a8f1]' : 'w-2 bg-[#d0d3e8]'
          )}
        />
      ))}
    </div>
  );
}

export function TestimonialSection({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const onSelect = useCallback((embla: CarouselApi) => {
    if (!embla) return;
    setCurrent(embla.selectedScrollSnap());
  }, []);

  const handleSetApi = useCallback(
    (emblaApi: CarouselApi) => {
      setApi(emblaApi);
      emblaApi?.on('select', () => onSelect(emblaApi));
    },
    [onSelect]
  );

  if (items.length === 0) return null;

  return (
    <section className='relative overflow-hidden bg-white py-12 md:py-20'>
      <div
        className='pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(#eef0f7_1px,transparent_1px),linear-gradient(90deg,#eef0f7_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(circle_at_50%_50%,#000_0%,transparent_70%)]'
        aria-hidden='true'
      />
      <div className='relative mx-auto max-w-[1320px] px-4 md:px-7'>
        <Carousel
          opts={{ loop: items.length > 1 }}
          setApi={handleSetApi}
          className='w-full'
        >
          <CarouselContent>
            {items.map((item, i) => (
              <CarouselItem key={i}>
                <div className='relative z-10 mx-auto max-w-[980px] text-center'>
                  <div className='mb-9 text-[clamp(26px,3.5vw,44px)] font-light italic leading-[1.3] tracking-[-1px] text-[#1e2364]'>
                    {item.quote}{' '}
                    <em className='not-italic font-semibold text-[#00a8f1]'>
                      {item.highlight}
                    </em>
                  </div>
                  <div className='inline-flex items-center gap-3.5'>
                    <div
                      className='h-14 w-14 rounded-full bg-[#f2f3f7]'
                      aria-hidden='true'
                    />
                    <div className='text-left'>
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
          {items.length > 1 && (
            <CarouselDots count={items.length} current={current} />
          )}
        </Carousel>
      </div>
    </section>
  );
}
