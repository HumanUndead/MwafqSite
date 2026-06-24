'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/components/icons/home';
import { getServiceIconByKey } from '@/shared/components/icons/home/serviceIcons';
import type { Dictionary } from '@/locales/types';
import type { B2BServiceItem } from './B2BServiceCapabilityCard';
import { B2BServicesStaticList } from './B2BServicesStaticList';

/* ─── Chapter theme per service ──────────────────────────────────── */
const ACCENTS = ['#38BDF8', '#34D399', '#A78BFA'] as const;
const ACCENT_RGBA = ['56,189,248', '52,211,153', '167,139,250'] as const;
const STEP_LABELS = ['01', '02', '03'] as const;

/* ─── Scroll constants ────────────────────────────────────────────── */
const STEP_PX = 600;
const STICKY_TOP_PX = 0;
const LAST_CHAPTER_DWELL_PX = 400;
const SNAP_IDLE_MS = 100;
const SNAP_DONE_PX = 5;

function getTrackTop(el: HTMLElement) {
  return el.getBoundingClientRect().top + window.scrollY;
}

function sceneDistance(count: number) {
  return count > 1 ? STEP_PX * (count - 1) : 0;
}

function scrollYForCard(trackTop: number, index: number) {
  return Math.round(trackTop + index * STEP_PX);
}

function isPinned(track: HTMLElement) {
  const rect = track.getBoundingClientRect();
  if (track.offsetHeight - window.innerHeight <= 0) return false;
  return rect.top <= STICKY_TOP_PX + 8 && rect.bottom > window.innerHeight;
}

/* ─── Main component ──────────────────────────────────────────────── */

interface Props {
  cards: B2BServiceItem[];
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
  sectionLabel: string;
}

export function B2BServicesStack({ cards, content, isRtl, sectionLabel }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const position = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const count = cards.length;
  const dist = sceneDistance(count);

  useEffect(() => {
    if (prefersReducedMotion || count < 2) return;
    const el = trackRef.current;
    if (!el) return;

    let frameId = 0;
    let idleTimer: ReturnType<typeof setTimeout>;
    let snapping = false;

    const sync = () => {
      const track = trackRef.current;
      if (!track) return;
      const trackTop = getTrackTop(track);
      const raw = Math.max(0, Math.min(window.scrollY - trackTop, dist));
      position.set(count > 1 ? raw / STEP_PX : 0);
    };

    const snapToNearest = () => {
      const track = trackRef.current;
      if (!track || !isPinned(track)) return;
      const trackTop = getTrackTop(track);
      const raw = Math.max(0, Math.min(window.scrollY - trackTop, dist));
      const pos = count > 1 ? raw / STEP_PX : 0;
      const nearest = Math.min(count - 1, Math.max(0, Math.round(pos)));
      const target = scrollYForCard(trackTop, nearest);
      if (Math.abs(window.scrollY - target) < SNAP_DONE_PX) return;
      snapping = true;
      window.scrollTo({ top: target, behavior: 'smooth' });
    };

    const onScroll = () => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        frameId = 0;
        sync();
        const track = trackRef.current;
        if (!track) return;
        if (snapping) {
          const trackTop = getTrackTop(track);
          const raw = Math.max(0, Math.min(window.scrollY - trackTop, dist));
          const pos = count > 1 ? raw / STEP_PX : 0;
          const nearest = Math.min(count - 1, Math.max(0, Math.round(pos)));
          const target = scrollYForCard(trackTop, nearest);
          if (Math.abs(window.scrollY - target) < SNAP_DONE_PX) snapping = false;
          return;
        }
        if (!isPinned(track)) return;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(snapToNearest, SNAP_IDLE_MS);
      });
    };

    const cancelSnap = () => {
      snapping = false;
    };

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('wheel', cancelSnap, { passive: true });
    window.addEventListener('touchstart', cancelSnap, { passive: true });

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', cancelSnap);
      window.removeEventListener('touchstart', cancelSnap);
    };
  }, [count, dist, position, prefersReducedMotion]);

  useMotionValueEvent(position, 'change', (p) => {
    const next = Math.min(count - 1, Math.max(0, Math.round(p)));
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  if (prefersReducedMotion) {
    return (
      <div className='px-8 py-14'>
        <B2BServicesStaticList
          cards={cards}
          dashboard={content.dashboard}
          isRtl={isRtl}
          sectionLabel={sectionLabel}
        />
      </div>
    );
  }

  const jumpTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    window.scrollTo({ top: scrollYForCard(getTrackTop(el), i), behavior: 'smooth' });
  };

  const accent = ACCENTS[activeIndex] ?? ACCENTS[0];
  const accentRgba = ACCENT_RGBA[activeIndex] ?? ACCENT_RGBA[0];
  const stepLabel = STEP_LABELS[activeIndex] ?? '01';
  const activeItem = cards[activeIndex] ?? cards[0];

  return (
    <div
      ref={trackRef}
      className='relative'
      style={{ height: `calc(100dvh + ${dist + LAST_CHAPTER_DWELL_PX}px)` }}
    >
      {/* ── Sticky scene ── */}
      <div
        className='sticky top-0 h-dvh min-h-[560px] z-[201] overflow-hidden bg-[#050B1A]'
        aria-label={sectionLabel}
      >
        {/* Ambient chapter glow */}
        <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
          {ACCENT_RGBA.map((rgba, i) => (
            <motion.div
              key={i}
              className='absolute inset-0'
              animate={{ opacity: i === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              style={{
                background: `radial-gradient(ellipse 60% 55% at ${isRtl ? '65%' : '35%'} 52%, rgba(${rgba},0.13), transparent 68%)`,
              }}
            />
          ))}
          {ACCENT_RGBA.map((rgba, i) => (
            <motion.div
              key={`r-${i}`}
              className='absolute inset-0'
              animate={{ opacity: i === activeIndex ? 1 : 0 }}
              transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.1 }}
              style={{
                background: `radial-gradient(ellipse 42% 38% at ${isRtl ? '28%' : '72%'} 55%, rgba(${rgba},0.08), transparent 68%)`,
              }}
            />
          ))}
        </div>

        {/* Subtle dot grid */}
        <div
          className='pointer-events-none absolute inset-0 opacity-[0.025]'
          aria-hidden='true'
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.85) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Top horizontal rule line */}
        <div className='pointer-events-none absolute left-0 right-0 top-0 h-px bg-white/[0.06]' aria-hidden='true' />

        {/* ── Content layout ── */}
        <div className='relative flex h-full flex-col px-10 xl:px-16'>
          <div className='mx-auto flex w-full max-w-[1600px] flex-col flex-1'>
          {/* Section header */}
          <div
            className={cn(
              'flex items-end justify-between gap-6 py-5',
              isRtl && 'flex-row-reverse'
            )}
            style={{ borderBottom: `1px solid rgba(255,255,255,0.07)` }}
          >
            {/* Left: eyebrow + big title */}
            <div className={cn('flex flex-col gap-1.5', isRtl && 'items-end')}>
              {/* Eyebrow row */}
              <div className={cn('flex items-center gap-2.5', isRtl && 'flex-row-reverse')}>
                <motion.span
                  className='block size-2 shrink-0 rounded-full'
                  animate={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
                  transition={{ duration: 0.5 }}
                  aria-hidden='true'
                />
                <motion.span
                  className='inline-block h-px w-8 opacity-50'
                  animate={{ background: accent }}
                  transition={{ duration: 0.5 }}
                  aria-hidden='true'
                />
                <span className='text-[10px] font-bold uppercase tracking-[0.3em] text-white/35'>
                  Mwafq Platform
                </span>
              </div>
              {/* Big title line */}
              <div className={cn('flex items-baseline gap-3', isRtl && 'flex-row-reverse')}>
                <span className='text-[clamp(22px,2.2vw,36px)] font-extrabold leading-none tracking-[-0.5px] text-white'>
                  {content.titleLead}
                </span>
                {content.titleAccent && (
                  <motion.span
                    className='text-[clamp(22px,2.2vw,36px)] font-extrabold leading-none tracking-[-0.5px]'
                    animate={{ color: accent }}
                    transition={{ duration: 0.5 }}
                  >
                    {content.titleAccent}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Right: trust chips */}
            <ul className='mb-0.5 flex shrink-0 gap-2' aria-label='Service highlights'>
              {content.trustChips.slice(0, 3).map((chip) => (
                <li
                  key={chip}
                  className='rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-white/55'
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Main chapter split ── */}
          <div
            className={cn(
              'flex flex-1 items-center gap-10 xl:gap-16 pb-6',
              isRtl && 'flex-row-reverse'
            )}
          >
            {/* LEFT — text narrative */}
            <div className='relative min-w-0 flex-[5] 2xl:flex-[4]'>
              {/* Decorative large step number */}
              <AnimatePresence mode='wait'>
                <motion.div
                  key={`step-bg-${stepLabel}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'pointer-events-none absolute -top-6 select-none text-[clamp(120px,14vw,180px)] font-extrabold leading-none tracking-[-6px] text-white/[0.035]',
                    isRtl ? 'right-0' : 'left-[-8px]'
                  )}
                  aria-hidden='true'
                >
                  {stepLabel}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode='wait'>
                <motion.div
                  key={`chapter-${activeIndex}`}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className='relative'
                >
                  {/* Step badge row */}
                  <div
                    className={cn('mb-3 flex items-center gap-3', isRtl && 'flex-row-reverse')}
                  >
                    <span
                      className='inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-[#050B1A]'
                      style={{ background: accent }}
                      aria-hidden='true'
                    >
                      {activeIndex + 1}
                    </span>
                    <span className='text-[11px] font-bold uppercase tracking-[0.18em] text-white/35'>
                      {stepLabel}
                    </span>
                    <span
                      className='h-px flex-1 opacity-30'
                      style={{
                        background: `linear-gradient(to ${isRtl ? 'left' : 'right'}, ${accent}, transparent)`,
                      }}
                      aria-hidden='true'
                    />
                  </div>

                  {/* Icon + title */}
                  <div
                    className={cn('mb-3 flex items-center gap-4', isRtl && 'flex-row-reverse')}
                  >
                    <div
                      className='flex size-[52px] shrink-0 items-center justify-center rounded-[16px] text-[#050B1A]'
                      style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
                        boxShadow: `0 8px 24px rgba(${accentRgba},0.3)`,
                      }}
                    >
                      {getServiceIconByKey(activeItem.iconKey)}
                    </div>
                    <h2
                      className={cn(
                        'text-[clamp(26px,2.8vw,52px)] font-extrabold leading-[1.08] tracking-[-1.5px] text-white',
                        isRtl && 'text-right'
                      )}
                    >
                      {activeItem.title}
                    </h2>
                  </div>

                  {/* Outcome */}
                  <p
                    className={cn(
                      'mb-4 text-[clamp(14px,1.3vw,20px)] font-semibold leading-[1.45]',
                      isRtl && 'text-right'
                    )}
                    style={{ color: accent }}
                  >
                    {activeItem.outcome}
                  </p>

                  {/* Divider */}
                  <div
                    className='mb-4 h-px w-full opacity-10'
                    style={{ background: `linear-gradient(to ${isRtl ? 'left' : 'right'}, ${accent}, transparent 60%)` }}
                    aria-hidden='true'
                  />

                  {/* Bullets */}
                  <ul
                    className={cn('mb-4 flex flex-col gap-2', isRtl && 'items-end')}
                  >
                    {activeItem.bullets.map((bullet, bi) => (
                      <motion.li
                        key={bullet}
                        initial={{ opacity: 0, x: isRtl ? 14 : -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.18 + bi * 0.07,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={cn(
                          'flex items-start gap-3',
                          isRtl && 'flex-row-reverse'
                        )}
                      >
                        <span
                          className='mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full'
                          style={{
                            background: `rgba(${accentRgba},0.18)`,
                            color: accent,
                          }}
                          aria-hidden='true'
                        >
                          <CheckIcon className='size-2.5' />
                        </span>
                        <span
                          className={cn(
                            'text-[clamp(13px,1.05vw,16px)] leading-[1.5] text-white/60',
                            isRtl && 'text-right'
                          )}
                        >
                          {bullet}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Trust badge */}
                  <span
                    className='inline-flex rounded-full px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em]'
                    style={{
                      background: `rgba(${accentRgba},0.12)`,
                      color: accent,
                      border: `1px solid rgba(${accentRgba},0.35)`,
                    }}
                  >
                    {activeItem.trustLabel}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT — animated dashboard */}
            <div className='min-w-0 flex-[7] 2xl:flex-[5]'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={`dash-${activeIndex}`}
                  initial={{ opacity: 0, scale: 0.97, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -18 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <StoryDashboard
                    item={activeItem}
                    dashboard={content.dashboard}
                    accent={accent}
                    accentRgba={accentRgba}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Chapter progress dots */}
          <div className='flex items-center justify-center gap-2.5 pb-6'>
            {cards.map((card, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={`dot-${i}`}
                  type='button'
                  onClick={() => jumpTo(i)}
                  aria-label={card.title}
                  aria-current={isActive ? 'true' : undefined}
                  className='group flex h-8 items-center px-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-full'
                >
                  <motion.span
                    animate={{
                      width: isActive ? 28 : 8,
                      opacity: isActive ? 1 : 0.3,
                      background: isActive ? accent : '#ffffff',
                    }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className='block h-2 rounded-full'
                    aria-hidden='true'
                  />
                </button>
              );
            })}
          </div>
          </div>{/* /max-w wrapper */}
        </div>
      </div>
    </div>
  );
}

/* ─── StoryDashboard ─────────────────────────────────────────────── */

interface DashboardProps {
  item: B2BServiceItem;
  dashboard: Dictionary['b2b']['services']['dashboard'];
  accent: string;
  accentRgba: string;
}

function StoryDashboard({ item, dashboard, accent, accentRgba }: DashboardProps) {
  const mock = item.dashboardMock;

  return (
    <div
      className='relative rounded-[22px] 2xl:rounded-[28px] p-px'
      style={{
        background: `linear-gradient(135deg, rgba(${accentRgba},0.45), rgba(${accentRgba},0.05) 50%, rgba(${accentRgba},0.2))`,
      }}
    >
      <div
        className='overflow-hidden rounded-[22px] 2xl:rounded-[28px] bg-[#0B1221]'
        style={{
          boxShadow: `0 0 80px rgba(${accentRgba},0.12), 0 32px 64px rgba(0,0,0,0.55)`,
        }}
      >
        {/* Browser chrome */}
        <div className='flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.025] px-4 py-2.5'>
          <span className='size-2.5 rounded-full bg-white/[0.1]' aria-hidden='true' />
          <span className='size-2.5 rounded-full bg-white/[0.1]' aria-hidden='true' />
          <span className='size-2.5 rounded-full bg-white/[0.1]' aria-hidden='true' />
          <div className='mx-3 flex-1 rounded-md bg-white/[0.04] py-1 text-center text-[9.5px] font-medium text-white/20'>
            dashboard.mwafq.com
          </div>
        </div>

        <div className='flex flex-col gap-2 p-3 2xl:gap-3 2xl:p-4'>
          {/* Active service card */}
          <div
            className='rounded-[14px] px-3 py-2.5'
            style={{
              background: `linear-gradient(120deg, rgba(${accentRgba},0.12), rgba(${accentRgba},0.04))`,
              border: `1px solid rgba(${accentRgba},0.25)`,
            }}
          >
            <span className='block text-[9px] font-bold uppercase tracking-[0.45px] text-white/35'>
              {dashboard.viewingLabel}
            </span>
            <strong className='block text-[14px] font-extrabold leading-snug text-white'>
              {item.title}
            </strong>
            <span className='mt-0.5 block text-[10.5px] leading-[1.4] text-white/45'>
              {item.outcome}
            </span>
          </div>

          {/* Tab bar */}
          <div className='flex gap-0.5 rounded-full bg-white/[0.04] p-1'>
            <span
              className='flex-1 rounded-full py-1.5 text-center text-[10px] font-extrabold'
              style={{ background: `rgba(${accentRgba},0.18)`, color: accent }}
            >
              {dashboard.tabOverview}
            </span>
            <span className='flex-1 py-1.5 text-center text-[10px] font-medium text-white/25'>
              {dashboard.tabEmployees}
            </span>
            <span className='flex-1 py-1.5 text-center text-[10px] font-medium text-white/25'>
              {dashboard.tabReports}
            </span>
          </div>

          {/* Stats row */}
          <div className='grid grid-cols-3 gap-2'>
            <AnimatedStatCard
              value={mock.stats.employees.value}
              label={dashboard.statEmployeesLabel}
              bars={mock.stats.employees.bars}
              accent={accent}
            />
            <AnimatedStatCard
              value={mock.stats.cleared.value}
              label={dashboard.statClearedLabel}
              bars={mock.stats.cleared.bars}
              accent={accent}
            />
            <AnimatedStatCard
              value={mock.stats.pending.value}
              label={dashboard.statPendingLabel}
              bars={mock.stats.pending.bars}
              accent={accent}
            />
          </div>

          {/* Employee list */}
          <ul className='flex flex-col gap-1.5 2xl:gap-2' aria-label={dashboard.tabEmployees}>
            {mock.employees.slice(0, 3).map((employee, idx) => (
              <motion.li
                key={`${employee.name}-${idx}`}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.22 + idx * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  'flex items-center gap-2.5 rounded-[12px] px-3 py-2',
                  idx === 0
                    ? 'border border-white/[0.12] bg-white/[0.055]'
                    : 'border border-white/[0.05] bg-white/[0.02] opacity-65'
                )}
              >
                <span
                  className='flex size-8 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold'
                  style={
                    idx === 0
                      ? { background: accent, color: '#050B1A' }
                      : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }
                  }
                  aria-hidden='true'
                >
                  {employee.initials}
                </span>
                <div className='min-w-0 flex-1'>
                  <strong className='block truncate text-[11px] font-extrabold leading-tight text-white'>
                    {employee.name}
                  </strong>
                  <span className='block truncate text-[9.5px] text-white/35'>
                    {employee.detail}
                  </span>
                </div>
                <StatusBadge status={employee.status} label={employee.statusLabel} />
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── AnimatedStatCard ───────────────────────────────────────────── */

function parseStatValue(val: string): { num: number; suffix: string } {
  const match = val.match(/^(\d+)(.*)$/);
  if (!match) return { num: 0, suffix: val };
  return { num: parseInt(match[1], 10), suffix: match[2] ?? '' };
}

function useCountUp(target: number, durationMs = 1100): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return count;
}

function AnimatedStatCard({
  value,
  label,
  bars,
  accent,
}: {
  value: string;
  label: string;
  bars: readonly number[];
  accent: string;
}) {
  const { num, suffix } = parseStatValue(value);
  const count = useCountUp(num);
  const max = Math.max(...bars);

  return (
    <div
      className='rounded-[12px] p-2.5'
      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)' }}
    >
      <p className='text-[16px] font-extrabold leading-none text-white'>
        {count}
        {suffix}
      </p>
      <p className='mt-0.5 text-[9px] text-white/30'>{label}</p>
      <svg viewBox='0 0 64 18' className='mt-1.5 w-full' aria-hidden='true'>
        {bars.map((val, i) => {
          const h = Math.round((val / max) * 18);
          return (
            <motion.rect
              key={i}
              x={i * 9 + 0.5}
              y={18 - h}
              width='7'
              height={h}
              rx='1.5'
              fill={accent}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 0.75 }}
              transition={{
                duration: 0.45,
                delay: 0.1 + i * 0.045,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformOrigin: 'bottom', transformBox: 'fill-box' }}
            />
          );
        })}
      </svg>
      {/* Glow pulse under stat */}
      <div
        className='mt-2 h-px w-full rounded-full opacity-40'
        style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }}
        aria-hidden='true'
      />
    </div>
  );
}

/* ─── StatusBadge ────────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  done: { bg: 'rgba(52,211,153,0.14)', color: '#34D399' },
  active: { bg: 'rgba(251,191,36,0.14)', color: '#FBBF24' },
  wait: { bg: 'rgba(148,163,184,0.14)', color: '#94A3B8' },
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.wait;
  return (
    <span
      className='shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.3px]'
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </span>
  );
}
