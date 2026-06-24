'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
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
const ACCENTS = ['#00a8f1', '#00a8f1', '#00a8f1'] as const;
const ACCENT_RGBA = ['0,168,241', '0,168,241', '0,168,241'] as const;
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

export function B2BServicesStack({
  cards,
  content,
  isRtl,
  sectionLabel,
}: Props) {
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
          if (Math.abs(window.scrollY - target) < SNAP_DONE_PX)
            snapping = false;
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
    window.scrollTo({
      top: scrollYForCard(getTrackTop(el), i),
      behavior: 'smooth',
    });
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
        className='sticky top-0 h-dvh min-h-[560px] z-[201] overflow-hidden bg-[#f4f4f6]'
        aria-label={sectionLabel}
      >
        {/* Dot grid */}
        <div
          className='pointer-events-none absolute inset-0 opacity-[0.16]'
          aria-hidden='true'
          style={{
            backgroundImage: 'radial-gradient(circle, #1e2364 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Top rule */}
        <div className='pointer-events-none absolute left-0 right-0 top-0 h-px bg-[#1e2364]/[0.1]' aria-hidden='true' />

        {/* ── Content layout ── */}
        <div className='relative flex h-full flex-col px-10 xl:px-16'>
          <div className='mx-auto flex w-full max-w-[1600px] flex-col flex-1'>
            {/* Section header — plain flex; dir="rtl" on <html> flips order naturally */}
            <div
              className='flex items-end justify-between gap-6 py-5'
              style={{ borderBottom: `1px solid #e5e7f0` }}
            >
              {/* Eyebrow + big title */}
              <div className={cn('flex flex-col gap-1.5', isRtl && 'text-right')}>
                {/* Eyebrow row */}
                <div className='flex items-center gap-2.5'>
                  <motion.span
                    className='block size-2 shrink-0 rounded-full'
                    animate={{ background: accent }}
                    transition={{ duration: 0.5 }}
                    aria-hidden='true'
                  />
                  <motion.span
                    className='inline-block h-px w-8 opacity-50'
                    animate={{ background: accent }}
                    transition={{ duration: 0.5 }}
                    aria-hidden='true'
                  />
                  <span className='text-[10px] font-bold uppercase tracking-[0.3em] text-[#1e2364]/45'>
                    Mwafq
                  </span>
                </div>
                {/* Big title line */}
                <div className='flex items-baseline gap-3'>
                  <span className='text-[clamp(22px,2.2vw,36px)] font-extrabold leading-none tracking-[-0.5px] text-[#1e2364]'>
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

              {/* Trust chips */}
              <ul className='mb-0.5 flex shrink-0 gap-2' aria-label='Service highlights'>
                {content.trustChips.slice(0, 3).map((chip) => (
                  <li
                    key={chip}
                    className='rounded-full border-2 border-[#e5e7f0] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6b7196]'
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Main chapter split ── */}
            {/* No flex-row-reverse for RTL: the document-level dir="rtl" already
                makes flex-row flow right→left, giving text-right / stats-left
                naturally. Adding flex-row-reverse would double-flip it back to LTR. */}
            <div className='flex flex-1 items-center gap-10 xl:gap-16 pb-6'>
              {/* LEFT — text narrative */}
              <div className={cn('relative min-w-0 flex-[5] 2xl:flex-[4]', isRtl && 'text-right')}>
                {/* Decorative large step number */}
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={`step-bg-${stepLabel}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      'pointer-events-none absolute -top-6 select-none text-[clamp(120px,14vw,180px)] font-extrabold leading-none tracking-[-6px] text-[#1e2364]/[0.06]',
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
                    {/* Decorative rule */}
                    <div className='mb-3'>
                      <span
                        className='block h-px w-full opacity-30'
                        style={{
                          background: `linear-gradient(to ${isRtl ? 'left' : 'right'}, ${accent}, transparent)`,
                        }}
                        aria-hidden='true'
                      />
                    </div>

                    {/* Icon + title — dir="rtl" on <html> flips flex-row naturally */}
                    <div className='mb-3 flex items-center gap-4'>
                      <div
                        className='flex size-[52px] shrink-0 items-center justify-center rounded-[16px] text-white'
                        style={{
                          background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
                        }}
                      >
                        {getServiceIconByKey(activeItem.iconKey)}
                      </div>
                      <h2
                        className={cn(
                          'text-[clamp(26px,2.8vw,52px)] font-extrabold leading-[1.08] tracking-[-1.5px] text-[#1e2364]',
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
                      className='mb-4 h-px w-full opacity-30'
                      style={{
                        background: `linear-gradient(to ${isRtl ? 'left' : 'right'}, ${accent}, transparent 60%)`,
                      }}
                      aria-hidden='true'
                    />

                    {/* Bullets — dir="rtl" flips flex-row; text-right cascades from panel */}
                    <ul className='mb-4 flex flex-col gap-2'>
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
                          className='flex items-start gap-3'
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
                              'text-[clamp(13px,1.05vw,16px)] leading-[1.5] text-[#6b7196]',
                              isRtl && 'text-right'
                            )}
                          >
                            {bullet}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Trust badge — block wrapper lets text-right push it to the correct edge */}
                    <div>
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
                    </div>
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
                    <ServiceVisual
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
                        background: isActive ? accent : 'rgba(30,35,100,0.2)',
                      }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className='block h-2 rounded-full'
                      aria-hidden='true'
                    />
                  </button>
                );
              })}
            </div>
          </div>
          {/* /max-w wrapper */}
        </div>
      </div>
    </div>
  );
}

/* ─── ServiceVisual ──────────────────────────────────────────────── */

interface DashboardProps {
  item: B2BServiceItem;
  dashboard: Dictionary['b2b']['services']['dashboard'];
  accent: string;
  accentRgba: string;
}

function FloatWrapper({
  children,
  delay = 0,
  amplitude = 9,
}: {
  children: ReactNode;
  delay?: number;
  amplitude?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ duration: 4.5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  );
}

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
      setCount(Math.round((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return count;
}

function ServiceVisual({ item, dashboard, accent, accentRgba }: DashboardProps) {
  const mock = item.dashboardMock;
  const { num: clearedNum, suffix: clearedSuffix } = parseStatValue(mock.stats.cleared.value);
  const { num: empNum } = parseStatValue(mock.stats.employees.value);
  const { num: pendingNum } = parseStatValue(mock.stats.pending.value);

  const R = 54;
  const SW = 9;
  const CIRC = 2 * Math.PI * R;
  const ringPercent = Math.min(clearedNum, 100);
  const ringOffset = CIRC * (1 - ringPercent / 100);

  const card = (extra?: string) =>
    cn('rounded-[18px] border-2 border-[#e5e7f0] bg-white', extra);

  return (
    <div className='flex gap-4 select-none'>

      {/* ── LEFT: Radial Gauge ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className='w-[200px] shrink-0'
        style={{ filter: 'none' }}
      >
        <FloatWrapper delay={0} amplitude={10}>
          <div
            className={card('p-4')}
            style={{
              background: `linear-gradient(160deg, rgba(${accentRgba},0.06) 0%, white 55%)`,
              boxShadow: `0 0 0 2px #e5e7f0, 0 6px 16px rgba(30,35,100,0.04)`,
            }}
          >
            <div className='mb-4 flex items-center justify-between'>
              <span className='text-[9.5px] font-bold uppercase tracking-[0.28em] text-[#1e2364]/45'>
                {dashboard.statClearedLabel}
              </span>
              <span
                className='flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold'
                style={{ background: `rgba(${accentRgba},0.15)`, color: accent }}
              >
                <motion.span
                  className='block size-1.5 rounded-full'
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ background: accent }}
                  aria-hidden='true'
                />
                LIVE
              </span>
            </div>

            {/* Ring */}
            <div className='relative mx-auto mb-5' style={{ width: 124, height: 124 }}>
              <svg
                width={124} height={124}
                className='absolute inset-0 opacity-0'
                style={{ transform: 'rotate(-90deg)' }}
                aria-hidden='true'
              >
                <motion.circle
                  cx={62} cy={62} r={R}
                  fill='none' stroke={accent} strokeWidth={SW + 5} strokeLinecap='round'
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
              </svg>
              <svg width={124} height={124} style={{ transform: 'rotate(-90deg)' }} aria-hidden='true'>
                <circle cx={62} cy={62} r={R} fill='none' stroke='#e5e7f0' strokeWidth={SW} />
                <motion.circle
                  cx={62} cy={62} r={R}
                  fill='none' stroke={accent} strokeWidth={SW} strokeLinecap='round'
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
              </svg>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <RingCounter target={ringPercent} suffix={clearedSuffix || '%'} accent={accent} />
              </div>
            </div>

            {/* Sub-stats */}
            <div className='grid grid-cols-2 gap-2'>
              <MiniStat value={empNum} label={dashboard.statEmployeesLabel} accent={accent} />
              <MiniStat value={pendingNum} label={dashboard.statPendingLabel} accent={accent} muted />
            </div>
          </div>
        </FloatWrapper>
      </motion.div>

      {/* ── RIGHT: Bar chart + Activity feed ──────── */}
      <div className='flex min-w-0 flex-1 flex-col gap-3'>

        {/* Trend chart */}
        <motion.div
          initial={{ opacity: 0, x: 24, y: -12 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{ filter: 'none' }}
        >
          <FloatWrapper delay={0.5} amplitude={7}>
            <div className={card('p-4')} style={{ boxShadow: '0 2px 10px rgba(30,35,100,0.04)' }}>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-[9.5px] font-bold uppercase tracking-[0.28em] text-[#1e2364]/45'>
                  {dashboard.statEmployeesLabel}
                </span>
                <motion.span
                  className='text-[14px] font-extrabold leading-none'
                  animate={{ color: accent }}
                  transition={{ duration: 0.5 }}
                >
                  {mock.stats.employees.value}
                </motion.span>
              </div>
              <TrendBars bars={mock.stats.employees.bars} accent={accent} accentRgba={accentRgba} />
              <div className='mt-2.5 flex items-center justify-between'>
                <span className='text-[9px] text-[#6b7196]/70'>Last 7 periods</span>
                <span className='text-[9px] font-bold' style={{ color: accent }}>
                  ↑ {mock.stats.cleared.value} rate
                </span>
              </div>
            </div>
          </FloatWrapper>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, x: 24, y: 12 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
        >
          <FloatWrapper delay={1} amplitude={8}>
            <div className={card('p-4')} style={{ boxShadow: '0 2px 10px rgba(30,35,100,0.04)' }}>
              <div className='mb-3 flex items-center gap-2'>
                <motion.span
                  className='block size-2 rounded-full'
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                  style={{ background: accent }}
                  aria-hidden='true'
                />
                <span className='text-[9.5px] font-bold uppercase tracking-[0.28em] text-[#1e2364]/45'>
                  {dashboard.tabEmployees}
                </span>
              </div>
              <ul className='flex flex-col gap-2'>
                {mock.employees.slice(0, 3).map((emp, idx) => (
                  <motion.li
                    key={`${emp.name}-${idx}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.09, ease: [0.22, 1, 0.36, 1] }}
                    className='flex items-center gap-2.5'
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
                      {emp.initials}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <strong className='block truncate text-[10.5px] font-bold text-[#1e2364]/80'>{emp.name}</strong>
                      <span className='block truncate text-[9px] text-[#6b7196]/80'>{emp.detail}</span>
                    </div>
                    <StatusBadge status={emp.status} label={emp.statusLabel} />
                  </motion.li>
                ))}
              </ul>
            </div>
          </FloatWrapper>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── ServiceVisual helpers ──────────────────────────────────────── */

function RingCounter({ target, suffix, accent }: { target: number; suffix: string; accent: string }) {
  const count = useCountUp(target, 1300);
  return (
    <>
      <span className='text-[28px] font-extrabold leading-none text-[#1e2364]'>{count}</span>
      <span className='mt-0.5 text-[11px] font-semibold' style={{ color: accent }}>{suffix}</span>
    </>
  );
}

function MiniStat({ value, label, muted }: { value: number; label: string; accent?: string; muted?: boolean }) {
  const count = useCountUp(value, 1000);
  return (
    <div
      className='rounded-[10px] p-2.5'
      style={{ background: 'rgba(30,35,100,0.04)', border: '1px solid #e5e7f0' }}
    >
      <p className='text-[15px] font-extrabold leading-none' style={{ color: muted ? '#6b7196' : '#1e2364' }}>
        {count}
      </p>
      <p className='mt-0.5 text-[8.5px] text-[#6b7196]/80'>{label}</p>
    </div>
  );
}

function TrendBars({ bars, accent, accentRgba }: { bars: readonly number[]; accent: string; accentRgba: string }) {
  const max = Math.max(...bars);
  const lastIdx = bars.length - 1;
  return (
    <svg viewBox={`0 0 ${bars.length * 13} 44`} className='w-full' aria-hidden='true'>
      {bars.map((val, i) => {
        const h = Math.max(4, Math.round((val / max) * 40));
        const isLast = i === lastIdx;
        return (
          <g key={i}>
            {isLast && (
              <motion.rect
                x={i * 13 + 1} y={44 - h - 2} width={10} height={h + 2} rx={3}
                fill={`rgba(${accentRgba},0.12)`}
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'bottom', transformBox: 'fill-box' }}
              />
            )}
            <motion.rect
              x={i * 13 + 1} y={44 - h} width={10} height={h} rx={3}
              fill={isLast ? accent : `rgba(${accentRgba},0.28)`}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'bottom', transformBox: 'fill-box' }}
            />
          </g>
        );
      })}
    </svg>
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
