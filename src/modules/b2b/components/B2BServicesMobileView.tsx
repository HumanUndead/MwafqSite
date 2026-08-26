'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/components/icons/home';
import { getServiceIconByKey } from '@/shared/components/icons/home/serviceIcons';
import { useB2BServiceScrollSpy } from '@/modules/b2b/hooks/useB2BServiceScrollSpy';
import { useB2BScrollChapters } from '@/modules/b2b/hooks/useB2BScrollChapters';
import { useHeaderVisibilityStore } from '@/shared/store/headerVisibilityStore';
import type { Dictionary } from '@/locales/types';
import { fixedHeaderPaddingClass } from '@/shared/lib/scrollToSection';
import type { B2BServiceItem } from './B2BServiceCapabilityCard';

const ACCENTS = ['#00a8f1', '#00a8f1', '#00a8f1'] as const;
const ACCENT_RGBA = ['0,168,241', '0,168,241', '0,168,241'] as const;
const STEP_LABELS = ['01', '02', '03'] as const;

const MOBILE_STEP_PX = 440;
const MOBILE_LAST_CHAPTER_DWELL_PX = 280;

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  done: { bg: 'rgba(52,211,153,0.14)', color: '#34D399' },
  active: { bg: 'rgba(251,191,36,0.14)', color: '#FBBF24' },
  wait: { bg: 'rgba(148,163,184,0.14)', color: '#94A3B8' },
};

interface Props {
  cards: B2BServiceItem[];
  dashboard: Dictionary['b2b']['services']['dashboard'];
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
  sectionLabel: string;
}

export function B2BServicesMobileView({
  cards,
  dashboard,
  content,
  isRtl,
  sectionLabel,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [stepPx, setStepPx] = useState(MOBILE_STEP_PX);

  useEffect(() => {
    function syncStep() {
      setStepPx(Math.max(360, Math.round(window.innerHeight * 0.52)));
    }

    syncStep();
    window.addEventListener('resize', syncStep);
    return () => window.removeEventListener('resize', syncStep);
  }, []);

  const scrollChapters = useB2BScrollChapters({
    itemCount: cards.length,
    stepPx,
    enabled: !prefersReducedMotion && cards.length > 1,
  });

  const scrollSpy = useB2BServiceScrollSpy(cards.length, {
    enabled: Boolean(prefersReducedMotion),
  });

  const { trackRef, activeIndex, jumpTo, dist } = scrollChapters;

  // Hide the fixed navbar while the pinned section fills the viewport, so it
  // neither overlaps nor clips the pinned content. The freed space also lets
  // the panel show its full content without a top offset for the navbar.
  // No-op under reduced motion (the section is not pinned there).
  const requestHide = useHeaderVisibilityStore((s) => s.requestHide);
  const releaseHide = useHeaderVisibilityStore((s) => s.releaseHide);
  const isHidingRef = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = trackRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldHide = entry?.isIntersecting ?? false;
        if (shouldHide === isHidingRef.current) return;
        isHidingRef.current = shouldHide;
        if (shouldHide) requestHide();
        else releaseHide();
      },
      // Fire once the section covers roughly the middle band of the viewport.
      { threshold: 0.01, rootMargin: '-30% 0px -30% 0px' }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (isHidingRef.current) {
        isHidingRef.current = false;
        releaseHide();
      }
    };
  }, [prefersReducedMotion, trackRef, requestHide, releaseHide]);

  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          'lg:hidden bg-[#f4f4f6] px-4 pb-10 sm:px-6',
          fixedHeaderPaddingClass
        )}
      >
        <MobileServicesContent
          cards={cards}
          dashboard={dashboard}
          content={content}
          isRtl={isRtl}
          sectionLabel={sectionLabel}
          activeIndex={scrollSpy.activeIndex}
          onSelect={() => {}}
          prefersReducedMotion
          chapterRefs={scrollSpy.setItemRef}
          containerRef={scrollSpy.containerRef}
          stacked
        />
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className='lg:hidden relative'
      style={{
        height: `calc(100dvh + ${dist + MOBILE_LAST_CHAPTER_DWELL_PX}px)`,
      }}
    >
      <div className='sticky top-0 z-[5] flex h-dvh flex-col overflow-y-auto bg-[#f4f4f6] px-4 pb-8 pt-6 sm:px-6'>
        <MobileServicesContent
          cards={cards}
          dashboard={dashboard}
          content={content}
          isRtl={isRtl}
          sectionLabel={sectionLabel}
          activeIndex={activeIndex}
          onSelect={jumpTo}
          prefersReducedMotion={false}
        />
      </div>
    </div>
  );
}

/* ─── Shared mobile layout ────────────────────────────────────────── */

interface MobileServicesContentProps {
  cards: B2BServiceItem[];
  dashboard: Dictionary['b2b']['services']['dashboard'];
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
  sectionLabel: string;
  activeIndex: number;
  onSelect: (index: number) => void;
  prefersReducedMotion: boolean;
  chapterRefs?: (index: number) => (node: HTMLElement | null) => void;
  containerRef?: RefObject<HTMLDivElement | null>;
  stacked?: boolean;
}

function MobileServicesContent({
  cards,
  dashboard,
  content,
  isRtl,
  sectionLabel,
  activeIndex,
  onSelect,
  prefersReducedMotion,
  chapterRefs,
  containerRef,
  stacked = false,
}: MobileServicesContentProps) {
  const activeItem = cards[activeIndex] ?? cards[0];
  const accent = ACCENTS[activeIndex] ?? ACCENTS[0];

  if (stacked) {
    return (
      <div ref={containerRef} className='relative flex flex-col gap-16'>
        <div className='mb-2 flex items-center gap-2.5'>
          <span
            className='size-2 rounded-full bg-[#00a8f1]'
            aria-hidden='true'
          />
          <span
            className='inline-block h-px w-8 bg-[#00a8f1]/60'
            aria-hidden='true'
          />
          <span className='text-[18px] font-bold uppercase tracking-[0.15em] text-[#1e2364]/65'>
            {content.titleLead} {content.titleAccent}
          </span>
        </div>

        {cards.map((item, index) => (
          <div
            key={item.title}
            ref={chapterRefs?.(index)}
            className='scroll-mt-24'
          >
            <ServiceChapterPanel
              item={item}
              index={index}
              dashboard={dashboard}
              isRtl={isRtl}
              prefersReducedMotion
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='relative'>
      <div className='mb-5 flex items-center gap-2.5'>
        <span
          className='size-2 rounded-full'
          style={{ background: accent }}
          aria-hidden='true'
        />
        <motion.span
          className='inline-block h-px w-8 opacity-60'
          animate={{ background: accent }}
          transition={{ duration: 0.5 }}
          aria-hidden='true'
        />
        <span className='text-[18px] font-bold uppercase tracking-[0.15em] text-[#1e2364]/65'>
          {content.titleLead} {content.titleAccent}
        </span>
      </div>

      <div role='tablist' aria-label={sectionLabel} className='mb-5 flex gap-2'>
        {cards.map((item, i) => {
          const isActive = i === activeIndex;
          const a = ACCENTS[i] ?? ACCENTS[0];
          return (
            <button
              key={item.title}
              type='button'
              role='tab'
              aria-selected={isActive}
              onClick={() => onSelect(i)}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1.5 rounded-[14px] border-2 px-2 py-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1e2364]/30',
                isActive
                  ? 'border-[#00a8f1]/30 bg-white shadow-sm'
                  : 'border-[#e5e7f0] bg-white/70 opacity-60'
              )}
            >
              <span
                className='flex size-7 items-center justify-center rounded-full text-[10px] font-extrabold text-white'
                style={{ background: isActive ? a : 'rgba(30,35,100,0.15)' }}
                aria-hidden='true'
              >
                {i + 1}
              </span>
              <span className='line-clamp-2 text-center text-[9.5px] font-extrabold leading-[1.3] text-[#1e2364]/70'>
                {item.title}
              </span>
              {isActive && (
                <motion.span
                  layoutId='tab-indicator'
                  className='absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full'
                  style={{ background: a }}
                  aria-hidden='true'
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={activeIndex}
          role='tabpanel'
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <ServiceChapterPanel
            item={activeItem}
            index={activeIndex}
            dashboard={dashboard}
            isRtl={isRtl}
            prefersReducedMotion={prefersReducedMotion}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface ServiceChapterPanelProps {
  item: B2BServiceItem;
  index: number;
  dashboard: Dictionary['b2b']['services']['dashboard'];
  isRtl: boolean;
  prefersReducedMotion: boolean;
}

function ServiceChapterPanel({
  item,
  index,
  dashboard,
  isRtl,
  prefersReducedMotion,
}: ServiceChapterPanelProps) {
  const accent = ACCENTS[index] ?? ACCENTS[0];
  const accentRgba = ACCENT_RGBA[index] ?? ACCENT_RGBA[0];

  return (
    <>
      <div
        className={cn(
          'mb-4 rounded-[20px] border-2 border-[#e5e7f0] bg-white px-4 py-5 shadow-sm',
          isRtl && 'text-end'
        )}
      >
        <div className='mb-3 flex items-center gap-3'>
          <div
            className='flex size-11 shrink-0 items-center justify-center rounded-[14px] text-white'
            style={{ background: accent }}
          >
            {getServiceIconByKey(item.iconKey)}
          </div>
          <div>
            <span className='block text-[9px] font-bold uppercase tracking-[0.18em] text-[#1e2364]/40'>
              {STEP_LABELS[index]}
            </span>
            <h3
              className={cn(
                'text-[24px] font-extrabold leading-[1.15] tracking-[-0.6px] text-[#1e2364]',
                isRtl && 'text-end'
              )}
            >
              {item.title}
            </h3>
          </div>
        </div>

        <p
          className={cn(
            'mb-3 text-[13px] font-semibold leading-[1.4]',
            isRtl && 'text-end'
          )}
          style={{ color: accent }}
        >
          {item.outcome}
        </p>

        <div
          className='mb-3 h-px w-full opacity-30'
          style={{
            background: `linear-gradient(to right, ${accent}, transparent)`,
          }}
          aria-hidden='true'
        />

        <ul className='flex flex-col gap-2'>
          {item.bullets.map((bullet, bi) => (
            <motion.li
              key={bullet}
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, x: isRtl ? 10 : -10 }
              }
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: bi * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className='flex items-start gap-2.5'
            >
              <span
                className='mt-0.5 flex size-[16px] shrink-0 items-center justify-center rounded-full'
                style={{
                  background: `rgba(${accentRgba},0.15)`,
                  color: accent,
                }}
                aria-hidden='true'
              >
                <CheckIcon className='size-2' />
              </span>
              <span className='text-[12px] leading-[1.55] text-[#6b7196]'>
                {bullet}
              </span>
            </motion.li>
          ))}
        </ul>

        <div
          className={cn(
            'mt-4 border-t border-[#e5e7f0] pt-3',
            isRtl && 'text-end'
          )}
        >
          <span
            className='inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.07em]'
            style={{
              background: `rgba(${accentRgba},0.1)`,
              color: accent,
              border: `1px solid rgba(${accentRgba},0.3)`,
            }}
          >
            {item.trustLabel}
          </span>
        </div>
      </div>

      <MobileDashboard
        item={item}
        dashboard={dashboard}
        accent={accent}
        accentRgba={accentRgba}
        prefersReducedMotion={prefersReducedMotion}
      />
    </>
  );
}

/* ─── MobileDashboard ─────────────────────────────────────────────── */

interface MobileDashboardProps {
  item: B2BServiceItem;
  dashboard: Dictionary['b2b']['services']['dashboard'];
  accent: string;
  accentRgba: string;
  prefersReducedMotion: boolean;
}

function MobileDashboard({
  item,
  dashboard,
  accent,
  accentRgba,
  prefersReducedMotion,
}: MobileDashboardProps) {
  const mock = item.dashboardMock;

  return (
    <div
      className='rounded-[18px] border-2 border-[#e5e7f0] bg-white overflow-hidden'
      style={{ boxShadow: '0 4px 20px rgba(30,35,100,0.05)' }}
    >
      <div className='flex flex-col gap-2.5 p-3'>
        <div
          className='rounded-[12px] px-3 py-2'
          style={{
            background: `rgba(${accentRgba},0.08)`,
            border: `1px solid rgba(${accentRgba},0.2)`,
          }}
        >
          <span className='block text-[8.5px] font-bold uppercase tracking-[0.4px] text-[#1e2364]/40'>
            {dashboard.viewingLabel}
          </span>
          <strong className='block text-[13px] font-extrabold text-[#1e2364]'>
            {item.title}
          </strong>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          {[
            {
              value: mock.stats.employees.value,
              label: dashboard.statEmployeesLabel,
            },
            {
              value: mock.stats.cleared.value,
              label: dashboard.statClearedLabel,
            },
            {
              value: mock.stats.pending.value,
              label: dashboard.statPendingLabel,
            },
          ].map(({ value, label }) => (
            <div
              key={label}
              className='rounded-[12px] p-2.5'
              style={{
                border: '1px solid #e5e7f0',
                background: 'rgba(30,35,100,0.03)',
              }}
            >
              <p className='text-[16px] font-extrabold leading-none text-[#1e2364]'>
                {value}
              </p>
              <p className='mt-0.5 text-[8.5px] text-[#6b7196]'>{label}</p>
            </div>
          ))}
        </div>

        <ul
          className='flex flex-col gap-1.5'
          aria-label={dashboard.tabEmployees}
        >
          {mock.employees.slice(0, 2).map((employee, idx) => (
            <motion.li
              key={`${employee.name}-${idx}`}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.28,
                delay: 0.15 + idx * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                'flex items-center gap-2 rounded-[12px] px-2.5 py-2',
                idx === 0
                  ? 'border-2 border-[#e5e7f0] bg-[#f4f4f6]'
                  : 'border border-[#e5e7f0]/60 bg-transparent opacity-70'
              )}
            >
              <span
                className='flex size-7 shrink-0 items-center justify-center rounded-full text-[8.5px] font-extrabold'
                style={
                  idx === 0
                    ? { background: accent, color: 'white' }
                    : { background: 'rgba(30,35,100,0.08)', color: '#6b7196' }
                }
                aria-hidden='true'
              >
                {employee.initials}
              </span>
              <div className='min-w-0 flex-1'>
                <strong className='block truncate text-[10.5px] font-extrabold leading-tight text-[#1e2364]'>
                  {employee.name}
                </strong>
                <span className='block truncate text-[8.5px] text-[#6b7196]'>
                  {employee.detail}
                </span>
              </div>
              <span
                className='shrink-0 rounded-full px-1.5 py-0.5 text-[7.5px] font-bold uppercase'
                style={
                  STATUS_STYLES[employee.status]
                    ? {
                        background: STATUS_STYLES[employee.status].bg,
                        color: STATUS_STYLES[employee.status].color,
                      }
                    : {
                        background: STATUS_STYLES.wait.bg,
                        color: STATUS_STYLES.wait.color,
                      }
                }
              >
                {employee.statusLabel}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
