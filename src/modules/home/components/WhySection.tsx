'use client';

import { useEffect, useRef, useState } from 'react';
import type { HomeWhyContent } from '../home.types';
import { getWhySpriteClassName } from '@/shared/components/icons/home';
import { useSectionScrollCapture } from './useSectionScrollCapture';
import { cn } from '@/shared/lib/cn';
import { marketingSectionShellClass } from '@/shared/components/marketing/marketingLayout';

const CARD_W = 96;
const GAP = 26;
const TITLE_W = 268;
const STEP_SCROLL_DISTANCE = 500;
const MOBILE_STEP_SCROLL_DISTANCE = 300;
const ITEM_COUNT = 4;
const ROW_W = 4 * CARD_W + 3 * GAP + TITLE_W;
const TITLE_EXIT_MS = 360;

// Vertical (mobile) variant: cards stack in a column and animate on the Y axis.
// TITLE_H is the title slot's main-axis size; COL_H is the column's total height.
const TITLE_H = 56;
const COL_H = 4 * (CARD_W + GAP) + TITLE_H;
// Below this width the row would be scaled down too far — switch to vertical.
const VERTICAL_MAX_WIDTH = 768;
const MOBILE_MOTION_MS = 500;
const MOBILE_FIRST_FOCUS_OFFSET = 12;
const PROGRESS_FILL_CLASS =
  'absolute inset-0 rounded-full bg-[#1e2364] will-change-transform transition-transform duration-200 ease-out';

type RowPositions = {
  cards: number[];
  title: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function mirrorX(x: number, width: number) {
  return ROW_W - width - x;
}

function getPositions(
  active: number,
  isRtl: boolean,
  vertical: boolean
): RowPositions {
  const step = CARD_W + GAP;
  const titleMain = (active + 1) * step;
  const titleSize = vertical ? TITLE_H : TITLE_W;
  const cards = [0, 1, 2, 3].map((i) => {
    if (i <= active) return i * step;
    return titleMain + titleSize + GAP + (i - active - 1) * step;
  });

  // Vertical column flows top→bottom in both directions — no RTL mirroring.
  if (vertical || !isRtl) {
    return { cards, title: titleMain };
  }

  return {
    cards: cards.map((cardX) => mirrorX(cardX, CARD_W)),
    title: mirrorX(titleMain, TITLE_W),
  };
}

interface WhySectionProps {
  content: HomeWhyContent;
  isRtl: boolean;
}

export function WhySection({ content, isRtl }: WhySectionProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const titleResetRef = useRef<number | null>(null);
  const activeStepRef = useRef(0);
  const lastWidthRef = useRef(0);
  const progressFillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [leavingStep, setLeavingStep] = useState<number | null>(null);

  const vertical =
    isDesktop && viewportWidth > 0 && viewportWidth < VERTICAL_MAX_WIDTH;
  const stepScrollDistance = vertical
    ? MOBILE_STEP_SCROLL_DISTANCE
    : STEP_SCROLL_DISTANCE;
  const sceneDistance = stepScrollDistance * ITEM_COUNT;

  const { step: nextStep } = useSectionScrollCapture(stageRef, {
    enabled: isDesktop,
    distance: sceneDistance,
    stepSize: stepScrollDistance,
    itemCount: ITEM_COUNT,
    onFrame: (step, subProgress) => {
      progressFillRefs.current.forEach((el, index) => {
        if (!el) return;
        const fill =
          index < step ? 1 : index === step ? subProgress : 0;
        el.style.transform = `scaleX(${fill})`;
      });
    },
  });

  useEffect(() => {
    function syncViewport() {
      setIsDesktop(true);
      const width = window.innerWidth;
      setViewportWidth(width);
      // Only re-measure height when width changes (orientation / real resize).
      // Otherwise the mobile URL bar hiding on scroll changes innerHeight and
      // would rescale the section as the user scrolls.
      if (width !== lastWidthRef.current) {
        lastWidthRef.current = width;
        setViewportHeight(window.innerHeight);
      }
    }

    syncViewport();
    window.addEventListener('resize', syncViewport);

    return () => {
      window.removeEventListener('resize', syncViewport);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (titleResetRef.current) {
        window.clearTimeout(titleResetRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      activeStepRef.current = 0;
      if (titleResetRef.current) {
        window.clearTimeout(titleResetRef.current);
        titleResetRef.current = null;
      }
      return;
    }

    if (nextStep === activeStepRef.current) return;

    const previousStep = activeStepRef.current;
    activeStepRef.current = nextStep;
    setActiveStep(nextStep);
    setLeavingStep(previousStep);

    if (titleResetRef.current) {
      window.clearTimeout(titleResetRef.current);
    }

    titleResetRef.current = window.setTimeout(() => {
      setLeavingStep((current) => (current === previousStep ? null : current));
      titleResetRef.current = null;
    }, TITLE_EXIT_MS);
  }, [isDesktop, nextStep]);

  const positions = getPositions(activeStep, isRtl, vertical);
  const hiddenTitleX = isRtl ? '120%' : '-120%';
  const items = content.items.slice(0, ITEM_COUNT);

  // Shrink the fixed-width row (ROW_W) to fit narrow screens. 40px = px-5 gutters.
  const scale =
    viewportWidth > 0 ? Math.min(1, (viewportWidth - 40) / ROW_W) : 1;

  // Shrink the vertical column to fit screen height (≈240px reserved for the
  // heading, paragraph and progress bar).
  const vScale =
    vertical && viewportHeight > 0
      ? clamp((viewportHeight - 240) / COL_H, 0.5, 1)
      : 1;

  return (
    <section className='relative border-t-2 border-[#e5e7f0] bg-[#f4f4f6] p-0'>
      <div
        ref={stageRef}
        className='relative'
        style={{
          height: isDesktop ? `calc(100vh + ${sceneDistance}px)` : undefined,
        }}
      >
        <div
          className={
            isDesktop
              ? vertical
                ? 'sticky top-0 z-10 flex h-screen items-center justify-center overflow-hidden'
                : 'sticky top-0 z-10 flex h-[60vh] items-center justify-center overflow-hidden sm:h-screen'
              : 'flex py-16 items-center justify-center overflow-hidden'
          }
        >
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 opacity-[0.42]'
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 700' fill='none' stroke='%23d3d6e1' stroke-width='1'%3E%3Cellipse cx='800' cy='720' rx='220' ry='90'/%3E%3Cellipse cx='800' cy='720' rx='320' ry='130'/%3E%3Cellipse cx='800' cy='720' rx='430' ry='170'/%3E%3Cellipse cx='800' cy='720' rx='550' ry='215'/%3E%3Cellipse cx='800' cy='720' rx='680' ry='265'/%3E%3Cellipse cx='800' cy='720' rx='820' ry='320'/%3E%3Cellipse cx='800' cy='720' rx='970' ry='380'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center 75%',
              backgroundSize: '1700px auto',
            }}
          />

          <div className={cn(marketingSectionShellClass, 'relative z-10 px-5 sm:px-7')}>
            <h2 className='mb-6 text-center text-[clamp(24px,3.6vw,44px)] font-extrabold uppercase tracking-[-0.5px] text-[#1e2364] sm:mb-9 min-[1920px]:text-[clamp(44px,2.8vw,60px)]'>
              {content.eyebrow}
            </h2>
            {content.title ? (
              <p className='mx-auto mb-8 max-w-175 text-center text-[15px] leading-[1.65] text-[#6b7196] sm:mb-10 sm:text-[16px] min-[1920px]:max-w-none min-[1920px]:text-[clamp(16px,1vw,21px)]'>
                {content.title}
              </p>
            ) : null}

            {/* Fallback — pre-hydration / no-JS: static 2×2 card grid */}
            {!isDesktop && (
              <ul
                className='grid grid-cols-2 gap-4 pb-4 sm:gap-5'
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {items.map((item, index) => (
                  <li
                    key={`mobile-${item.title}-${index}`}
                    className='flex flex-col items-center gap-3 rounded-[20px] border-2 border-[#e5e7f0] bg-white p-4 text-center'
                  >
                    <span
                      aria-hidden='true'
                      className={[
                        'svg-ic',
                        getWhySpriteClassName(item.iconKey, index),
                        'h-10 w-10',
                      ].join(' ')}
                    />
                    <span className='text-[13px] font-extrabold leading-snug text-[#1e2364] sm:text-[14px]'>
                      {item.title}
                    </span>
                    {item.description ? (
                      <span className='text-[12px] leading-relaxed text-[#6b7196] sm:text-[13px]'>
                        {item.description}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {/* Scroll-animated row — md+, scaled to fit width */}
            {isDesktop && !vertical && (
              <div className='flex flex-col items-center gap-7 pb-2.5 pt-7'>
                <div
                  className='relative'
                  style={{ height: CARD_W * scale, width: ROW_W * scale }}
                >
                  <div
                    className='absolute left-0 top-0'
                    style={{
                      height: CARD_W,
                      width: ROW_W,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <div
                      role='tablist'
                      aria-label={content.eyebrow}
                      className='absolute inset-0'
                    >
                      {items.map((item, index) => {
                        const isActive = index === activeStep;

                        return (
                          <button
                            key={`${item.title}-${index}`}
                            type='button'
                            role='tab'
                            aria-selected={isActive}
                            aria-label={item.title}
                            onClick={() => {
                              const stage = stageRef.current;
                              if (!stage) return;

                              const stageTop =
                                stage.getBoundingClientRect().top +
                                window.scrollY;
                              const target =
                                stageTop + (index + 0.5) * stepScrollDistance;

                              window.scrollTo({
                                top: Math.round(target),
                                behavior: 'smooth',
                              });
                            }}
                            className={[
                              'absolute left-0 top-0 flex h-24 w-24 items-center justify-center rounded-[24px] border-2 bg-white',
                              'transition-[transform,border-color] duration-700 ease-in-out',
                              isActive
                                ? 'border-[#1e2364]'
                                : 'border-[#e5e7f0] hover:border-[#6f8fcf]',
                            ].join(' ')}
                            style={{
                              transform: `translateX(${positions.cards[index]}px)${isActive ? ' translateY(-6px) scale(1.06)' : ''}`,
                              zIndex: 2,
                            }}
                          >
                            <span
                              aria-hidden='true'
                              className={[
                                'svg-ic',
                                getWhySpriteClassName(item.iconKey, index),
                                'h-11 w-11 transition-transform duration-450 ease-in-out',
                              ].join(' ')}
                              style={{
                                transform: isActive
                                  ? 'scale(1.26)'
                                  : 'scale(1.16)',
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div
                      aria-live='polite'
                      className={[
                        'absolute left-0 top-0 z-1 flex h-24 items-center',
                        isRtl
                          ? 'justify-end text-right'
                          : 'justify-start text-left',
                      ].join(' ')}
                      style={{
                        width: TITLE_W,
                        transform: `translateX(${positions.title}px)`,
                        transition: 'transform 0.7s ease-in-out',
                      }}
                    >
                      <div className='relative h-9 w-full overflow-hidden'>
                        {items.map((item, index) => {
                          const isActive = index === activeStep;
                          const isLeaving = index === leavingStep;

                          return (
                            <span
                              key={`${item.title}-${index}`}
                              className={[
                                'absolute bottom-0 top-0 flex items-center whitespace-nowrap text-[22px] font-extrabold leading-none text-[#1e2364]',
                                isRtl
                                  ? 'justify-end text-right'
                                  : 'justify-start text-left',
                              ].join(' ')}
                              style={{
                                left: isRtl ? 'auto' : 0,
                                right: isRtl ? 0 : 'auto',
                                opacity: isActive || isLeaving ? 1 : 0,
                                transform: isActive
                                  ? 'translateX(0)'
                                  : `translateX(${hiddenTitleX})`,
                                transition: isActive
                                  ? 'transform 0.42s ease-out 0.35s'
                                  : isLeaving
                                    ? 'transform 0.32s ease-in'
                                    : 'none',
                              }}
                            >
                              {item.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className='flex w-full max-w-105 gap-1.5'
                  dir={isRtl ? 'rtl' : 'ltr'}
                  aria-hidden='true'
                >
                  {items.map((_, index) => (
                    <div
                      key={index}
                      className='relative h-0.75 flex-1 overflow-hidden rounded-full bg-[rgba(30,35,100,0.12)]'
                    >
                      <div
                        ref={(el) => {
                          progressFillRefs.current[index] = el;
                        }}
                        className={[
                          PROGRESS_FILL_CLASS,
                          isRtl ? 'origin-right' : 'origin-left',
                        ].join(' ')}
                        style={{ transform: 'scaleX(0)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scroll-animated column — mobile, animates on the vertical axis */}
            {isDesktop && vertical && (
              <div className='flex flex-col items-center gap-7 pb-2.5 pt-4'>
                <div
                  className='relative w-full'
                  style={{
                    height:
                      (COL_H +
                        (activeStep === 0 ? MOBILE_FIRST_FOCUS_OFFSET : 0)) *
                      vScale,
                  }}
                >
                  <div
                    className='absolute left-0 top-0 w-full [contain:layout_paint]'
                    style={{
                      height: COL_H,
                      transform: `scale(${vScale}) translateZ(0)`,
                      transformOrigin: 'top center',
                    }}
                  >
                    <div
                      role='tablist'
                      aria-label={content.eyebrow}
                      className='absolute inset-0'
                    >
                      {items.map((item, index) => {
                        const isActive = index === activeStep;
                        const cardYOffset =
                          index === 0 && isActive
                            ? MOBILE_FIRST_FOCUS_OFFSET
                            : 0;

                        return (
                          <button
                            key={`v-${item.title}-${index}`}
                            type='button'
                            role='tab'
                            aria-selected={isActive}
                            aria-label={item.title}
                            onClick={() => {
                              const stage = stageRef.current;
                              if (!stage) return;

                              const stageTop =
                                stage.getBoundingClientRect().top +
                                window.scrollY;
                              const target =
                                stageTop + (index + 0.5) * stepScrollDistance;

                              window.scrollTo({
                                top: Math.round(target),
                                behavior: 'smooth',
                              });
                            }}
                            className={[
                              'absolute left-1/2 top-0 flex h-24 w-24 items-center justify-center rounded-[24px] border-2 bg-white',
                              'transition-[transform,border-color] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                              isActive
                                ? 'border-[#1e2364]'
                                : 'border-[#e5e7f0]',
                            ].join(' ')}
                            style={{
                              transform: `translate3d(-50%, ${positions.cards[index] + cardYOffset}px, 0)${isActive ? ' scale(1.06)' : ''}`,
                              zIndex: 2,
                            }}
                          >
                            <span
                              aria-hidden='true'
                              className={[
                                'svg-ic',
                                getWhySpriteClassName(item.iconKey, index),
                                'h-11 w-11 transition-transform duration-400 ease-out',
                                isActive ? 'scale-[1.26]' : 'scale-[1.16]',
                              ].join(' ')}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div
                      aria-live='polite'
                      className='absolute left-1/2 top-0 z-1 flex h-14 w-[88vw] max-w-105 items-center justify-center px-2 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]'
                      style={{
                        transform: `translate3d(-50%, ${positions.title}px, 0)`,
                      }}
                    >
                      <div className='relative h-full w-full'>
                        {items.map((item, index) => {
                          const isActive = index === activeStep;
                          const isLeaving = index === leavingStep;

                          return (
                            <span
                              key={`v-title-${item.title}-${index}`}
                              className='absolute inset-0 flex items-center justify-center text-center text-[18px] font-extrabold leading-tight text-[#1e2364]'
                              style={{
                                opacity: isActive ? 1 : 0,
                                transition: isActive
                                  ? `opacity ${MOBILE_MOTION_MS * 0.7}ms ease-out ${MOBILE_MOTION_MS * 0.35}ms`
                                  : isLeaving
                                    ? `opacity ${MOBILE_MOTION_MS * 0.55}ms ease-in`
                                    : 'none',
                              }}
                            >
                              {item.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className='flex w-full max-w-105 gap-1.5'
                  dir={isRtl ? 'rtl' : 'ltr'}
                  aria-hidden='true'
                >
                  {items.map((_, index) => (
                    <div
                      key={index}
                      className='relative h-0.75 flex-1 overflow-hidden rounded-full bg-[rgba(30,35,100,0.12)]'
                    >
                      <div
                        ref={(el) => {
                          progressFillRefs.current[index] = el;
                        }}
                        className={[
                          PROGRESS_FILL_CLASS,
                          isRtl ? 'origin-right' : 'origin-left',
                        ].join(' ')}
                        style={{ transform: 'scaleX(0)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
