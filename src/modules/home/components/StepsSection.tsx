'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { HomeStepsContent } from '../home.types';
import { CmsLink } from './CmsLink';
import { cn } from '@/shared/lib/cn';
import {
  marketingSectionHeadingClass,
  marketingSectionShellClass,
} from '@/shared/components/marketing/marketingLayout';

const DESKTOP_MIN = 1024;
const INITIAL_OFFSET = 24;
const END_HOLD = 80;
const EXTRA_LIFT = 16;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function stripArrowFromLabel(label: string): string {
  return label
    .replace(/\s*(?:→|←|›|»|➜|➡|->)\s*$/u, '')
    .replace(/^\s*(?:→|←|›|»|➜|➡|->)\s*/u, '')
    .trim();
}

interface StepsSectionProps {
  locale: Locale;
  content: HomeStepsContent;
}

export function StepsSection({ locale, content }: StepsSectionProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef({ scrollDistance: 0, endTranslate: 0 });
  const [isDesktop, setIsDesktop] = useState(false);
  const [sceneDistance, setSceneDistance] = useState(0);

  useEffect(() => {
    function syncViewport() {
      setIsDesktop(window.innerWidth >= DESKTOP_MIN);
    }

    syncViewport();
    window.addEventListener('resize', syncViewport);

    return () => {
      window.removeEventListener('resize', syncViewport);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let visible = true;

    function resetListTransform() {
      const list = listRef.current;
      if (list) list.style.transform = '';
    }

    function measure() {
      const list = listRef.current;
      const viewport = viewportRef.current;
      if (!list || !viewport) return;

      if (window.innerWidth < DESKTOP_MIN) {
        metricsRef.current = { scrollDistance: 0, endTranslate: 0 };
        resetListTransform();
        setSceneDistance(0);
        return;
      }

      list.style.transform = '';
      const needed =
        Math.max(list.scrollHeight - viewport.offsetHeight, 0) + EXTRA_LIFT;
      const endTranslate = -needed;
      const scrollDistance = INITIAL_OFFSET + needed + END_HOLD;

      metricsRef.current = { scrollDistance, endTranslate };
      setSceneDistance(scrollDistance);
    }

    function update() {
      const stage = stageRef.current;
      const list = listRef.current;
      if (!stage || !list || !visible || window.innerWidth < DESKTOP_MIN) return;

      const { scrollDistance, endTranslate } = metricsRef.current;
      if (scrollDistance <= 0) return;

      const scrolled = clamp(-stage.getBoundingClientRect().top, 0, scrollDistance);
      const translate = Math.max(INITIAL_OFFSET - scrolled, endTranslate);
      list.style.transform = `translate3d(0, ${translate}px, 0)`;
    }

    function requestUpdate() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        update();
      });
    }

    function handleResize() {
      measure();
      update();
    }

    measure();
    update();

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', handleResize);

    const stage = stageRef.current;
    const list = listRef.current;
    const viewport = viewportRef.current;

    if (stage && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (visible) requestUpdate();
        },
        { rootMargin: '120px 0px' }
      );
      observer.observe(stage);

      resizeObserver = new ResizeObserver(() => {
        measure();
        requestUpdate();
      });
      if (list) resizeObserver.observe(list);
      if (viewport) resizeObserver.observe(viewport);

      const fontTimeout = window.setTimeout(() => {
        measure();
        update();
      }, 400);

      return () => {
        if (frameId) window.cancelAnimationFrame(frameId);
        window.removeEventListener('scroll', requestUpdate);
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
        resizeObserver?.disconnect();
        window.clearTimeout(fontTimeout);
      };
    }

    const fontTimeout = window.setTimeout(() => {
      measure();
      update();
    }, 400);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(fontTimeout);
    };
  }, []);

  const steps = content.items.map((step, index) => ({
    num: String(index + 1).padStart(2, '0'),
    ...step,
  }));

  const ctaLabel = stripArrowFromLabel(content.cta.label);

  return (
    <section id='how' className='relative mt-8 p-0 min-[1024px]:-mt-12'>
      <div
        ref={stageRef}
        className='relative'
        style={{
          height:
            isDesktop && sceneDistance > 0
              ? `calc(100vh + ${sceneDistance}px)`
              : undefined,
        }}
      >
        <div
          className={
            isDesktop
              ? 'sticky top-0 flex h-screen items-start overflow-hidden pt-[88px]'
              : 'py-6 pt-4'
          }
        >
          <div className='w-full'>
            <div className={cn(marketingSectionShellClass, 'px-4 md:px-7')}>
              <div className='grid grid-cols-1 items-start gap-10 min-[1024px]:grid-cols-2 min-[1024px]:items-center min-[1024px]:gap-20'>
                <div>
                  <span className='relative mb-7 inline-block px-[30px] py-3 text-[17px] font-bold uppercase leading-none tracking-[2.2px] text-[#00a8f1] before:absolute before:left-0 before:top-0 before:h-[18px] before:w-[18px] before:border-l-4 before:border-t-4 before:border-current after:absolute after:bottom-0 after:right-0 after:h-[18px] after:w-[18px] after:border-b-4 after:border-r-4 after:border-current'>
                    {content.eyebrow}
                  </span>
                  <h2 className={cn('font-extrabold leading-[1.08] tracking-[-1.6px] text-[#1e2364]', marketingSectionHeadingClass, 'text-[clamp(22px,3vw,36px)] min-[1920px]:text-[clamp(36px,2.2vw,54px)] min-[2560px]:text-[clamp(42px,2.4vw,62px)]')}>
                    {content.title}{' '}
                    <span className='text-[#00a8f1]'>{content.highlight}</span>
                  </h2>
                  {ctaLabel ? (
                    <CmsLink
                      locale={locale}
                      href={content.cta.path}
                      className='mt-7 inline-flex items-center rounded-full bg-[#1e2364] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#233567]'
                    >
                      {ctaLabel}
                    </CmsLink>
                  ) : null}
                </div>

                <div
                  ref={viewportRef}
                  className={
                    isDesktop
                      ? 'relative max-h-[min(78vh,720px)] overflow-hidden'
                      : 'relative'
                  }
                >
                  <div
                    ref={listRef}
                    className='flex flex-col gap-[18px] will-change-transform'
                  >
                    {steps.map((step) => (
                      <div
                        key={step.num}
                        className='relative overflow-hidden rounded-[22px] border-2 border-[#e5e7f0] bg-white px-6 py-6 md:px-12 md:py-12 [@media(hover:hover)]:transition-[border-color] [@media(hover:hover)]:duration-300 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:origin-top before:scale-y-0 before:bg-[#00a8f1] [@media(hover:hover)]:before:transition-transform [@media(hover:hover)]:before:duration-500 [@media(hover:hover)]:hover:border-[#1e2364] [@media(hover:hover)]:hover:before:scale-y-100'
                      >
                        <div className='flex items-start gap-6'>
                          <div className='min-w-12 text-[clamp(36px,5vw,64px)] font-light italic leading-none text-[rgba(30,35,100,0.3)] md:min-w-24'>
                            {step.num}
                          </div>
                          <div>
                            <h3 className='mb-3.5 text-[clamp(18px,2.5vw,27px)] font-bold tracking-[-0.4px] text-[#1e2364]'>
                              {step.title}
                            </h3>
                            <p className='text-[16.5px] leading-[1.65] text-[#6b7196]'>
                              {step.body}
                            </p>
                            {/* <div className='mt-[18px] flex items-center gap-[22px] border-t-[1.5px] border-[#e5e7f0] pt-[18px] text-[14.5px] text-[#6b7196]'>
                              <span>
                                <b className='font-bold text-[#1e2364]'>
                                  {step.meta1.value}
                                </b>{' '}
                                {step.meta1.label}
                              </span>
                              <span>
                                <b className='font-bold text-[#1e2364]'>
                                  {step.meta2.value}
                                </b>{' '}
                                {step.meta2.label}
                              </span>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
