'use client';

import { useEffect, useRef, useState } from 'react';
import type { HomeWhyContent } from '../home.types';
import { getWhySpriteClassName } from './Icons';
import { useSectionScrollCapture } from './useSectionScrollCapture';

const CARD_W = 96;
const GAP = 26;
const TITLE_W = 268;
const STEP_SCROLL_DISTANCE = 320;
const ITEM_COUNT = 4;
const SCENE_DISTANCE = STEP_SCROLL_DISTANCE * ITEM_COUNT;
const ROW_W = 4 * CARD_W + 3 * GAP + TITLE_W;
const TITLE_EXIT_MS = 360;

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

function getPositions(active: number, isRtl: boolean): RowPositions {
  const step = CARD_W + GAP;
  const titleX = (active + 1) * step;
  const cards = [0, 1, 2, 3].map((i) => {
    if (i <= active) return i * step;
    return titleX + TITLE_W + GAP + (i - active - 1) * step;
  });

  if (!isRtl) {
    return { cards, title: titleX };
  }

  return {
    cards: cards.map((cardX) => mirrorX(cardX, CARD_W)),
    title: mirrorX(titleX, TITLE_W),
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
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [leavingStep, setLeavingStep] = useState<number | null>(null);
  const { progress } = useSectionScrollCapture(stageRef, {
    enabled: isDesktop,
    distance: SCENE_DISTANCE,
  });

  useEffect(() => {
    function syncViewport() {
      setIsDesktop(window.innerWidth > 880);
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

  const normalized = isDesktop ? clamp(progress, 0, SCENE_DISTANCE) : 0;
  const isComplete = normalized >= SCENE_DISTANCE - 1;
  const progressValue = isDesktop
    ? isComplete
      ? ITEM_COUNT
      : clamp(normalized / STEP_SCROLL_DISTANCE, 0, ITEM_COUNT)
    : 1;
  const nextStep = isDesktop
    ? isComplete
      ? ITEM_COUNT - 1
      : Math.min(ITEM_COUNT - 1, Math.floor(progressValue))
    : 0;
  const subProgress = isDesktop
    ? isComplete && nextStep === ITEM_COUNT - 1
      ? 1
      : clamp(progressValue - nextStep, 0, 1)
    : 1;

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

  const positions = getPositions(activeStep, isRtl);
  const hiddenTitleX = isRtl ? '120%' : '-120%';
  const items = content.items.slice(0, ITEM_COUNT);

  return (
    <section className='relative border-t-2 border-[#e5e7f0] bg-[#f4f4f6] p-0'>
      <div
        ref={stageRef}
        className='relative'
        style={{
          height: isDesktop ? `calc(100vh + ${SCENE_DISTANCE}px)` : undefined,
        }}
      >
        <div
          className={
            isDesktop
              ? 'sticky top-0 z-10 flex h-screen items-center justify-center overflow-hidden'
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

          <div className='relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-7'>
            <h2 className='mb-6 text-center text-[clamp(24px,3.6vw,44px)] font-extrabold uppercase tracking-[-0.5px] text-[#1e2364] sm:mb-9'>
              {content.eyebrow}
            </h2>
            {content.title ? (
              <p className='mx-auto mb-8 max-w-[700px] text-center text-[15px] leading-[1.65] text-[#6b7196] sm:mb-10 sm:text-[16px]'>
                {content.title}
              </p>
            ) : null}

            {/* Mobile layout — 2×2 card grid */}
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

            {/* Desktop layout — scroll-animated row */}
            {isDesktop && (
              <div className='flex flex-col items-center gap-7 pb-2.5 pt-7'>
                <div
                  className='relative max-w-full'
                  style={{ height: CARD_W, width: ROW_W }}
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
                            stage.getBoundingClientRect().top + window.scrollY;
                          const target =
                            stageTop +
                            ((index + 0.5) / ITEM_COUNT) * SCENE_DISTANCE;

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
                            'h-11 w-11 transition-transform duration-[450ms] ease-in-out',
                          ].join(' ')}
                          style={{
                            transform: isActive ? 'scale(1.26)' : 'scale(1.16)',
                          }}
                        />
                      </button>
                    );
                  })}

                  <div
                    aria-live='polite'
                    className={[
                      'absolute left-0 top-0 z-[1] flex h-24 items-center',
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

                <div
                  className='flex w-full max-w-[420px] gap-1.5'
                  dir={isRtl ? 'rtl' : 'ltr'}
                  aria-hidden='true'
                >
                  {items.map((_, index) => {
                    const fill =
                      index < activeStep
                        ? 1
                        : index === activeStep
                          ? clamp(subProgress, 0, 1)
                          : 0;

                    return (
                      <div
                        key={index}
                        className='relative h-[3px] flex-1 overflow-hidden rounded-full bg-[rgba(30,35,100,0.12)]'
                      >
                        <div
                          className={[
                            'absolute inset-0 rounded-full bg-[#1e2364]',
                            isRtl ? 'origin-right' : 'origin-left',
                          ].join(' ')}
                          style={{
                            transform: `scaleX(${fill})`,
                            transition: 'transform 0.15s linear',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
