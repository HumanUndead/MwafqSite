'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { CheckIcon } from '@/shared/components/icons/home';
import { getServiceIconByKey } from '@/shared/components/icons/home/serviceIcons';
import type { Dictionary } from '@/locales/types';
import type { B2BServiceItem } from './B2BServiceCapabilityCard';

const ACCENTS = ['#38BDF8', '#34D399', '#A78BFA'] as const;
const ACCENT_RGBA = ['56,189,248', '52,211,153', '167,139,250'] as const;
const STEP_LABELS = ['01', '02', '03'] as const;

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
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const activeItem = cards[activeIndex] ?? cards[0];
  const accent = ACCENTS[activeIndex] ?? ACCENTS[0];
  const accentRgba = ACCENT_RGBA[activeIndex] ?? ACCENT_RGBA[0];

  return (
    <div className='lg:hidden bg-[#050B1A] px-4 pb-10 pt-6 sm:px-6'>
      {/* Ambient background glow */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden='true'>
        {ACCENT_RGBA.map((rgba, i) => (
          <motion.div
            key={i}
            className='absolute inset-0'
            animate={{ opacity: i === activeIndex ? 1 : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              background: `radial-gradient(ellipse 70% 40% at 50% 20%, rgba(${rgba},0.12), transparent 70%)`,
            }}
          />
        ))}
      </div>

      <div className='relative'>
        {/* Section label */}
        <div
          className={cn(
            'mb-5 flex items-center gap-2.5',
            isRtl && 'flex-row-reverse'
          )}
        >
          <motion.span
            className='inline-block h-px w-6'
            animate={{ background: accent }}
            transition={{ duration: 0.5 }}
            aria-hidden='true'
          />
          <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-white/35'>
            {content.titleLead} {content.titleAccent}
          </span>
        </div>

        {/* Chapter selector */}
        <div
          role='tablist'
          aria-label={sectionLabel}
          className='mb-5 flex gap-2'
        >
          {cards.map((item, i) => {
            const isActive = i === activeIndex;
            const a = ACCENTS[i] ?? ACCENTS[0];
            return (
              <button
                key={item.title}
                type='button'
                role='tab'
                aria-selected={isActive}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'relative flex flex-1 flex-col items-center gap-1.5 rounded-[14px] border px-2 py-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40',
                  isActive
                    ? 'border-white/[0.18] bg-white/[0.07]'
                    : 'border-white/[0.06] bg-white/[0.025] opacity-55'
                )}
              >
                <span
                  className='flex size-7 items-center justify-center rounded-full text-[10px] font-extrabold text-[#050B1A]'
                  style={{ background: isActive ? a : 'rgba(255,255,255,0.2)' }}
                  aria-hidden='true'
                >
                  {i + 1}
                </span>
                <span className='line-clamp-2 text-center text-[9.5px] font-extrabold leading-[1.3] text-white/70'>
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

        {/* Active chapter content */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeIndex}
            role='tabpanel'
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Service card */}
            <div
              className='mb-4 rounded-[20px] p-px'
              style={{
                background: `linear-gradient(135deg, rgba(${accentRgba},0.4), rgba(${accentRgba},0.05) 50%, rgba(${accentRgba},0.15))`,
              }}
            >
              <div className='rounded-[20px] bg-[#0B1221] px-4 py-5'>
                {/* Icon + title */}
                <div
                  className={cn('mb-3 flex items-center gap-3', isRtl && 'flex-row-reverse')}
                >
                  <div
                    className='flex size-11 shrink-0 items-center justify-center rounded-[14px] text-[#050B1A]'
                    style={{
                      background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
                      boxShadow: `0 6px 18px rgba(${accentRgba},0.28)`,
                    }}
                  >
                    {getServiceIconByKey(activeItem.iconKey)}
                  </div>
                  <div>
                    <span className='block text-[9px] font-bold uppercase tracking-[0.18em] text-white/30'>
                      {STEP_LABELS[activeIndex]}
                    </span>
                    <h3
                      className={cn(
                        'text-[17px] font-extrabold leading-[1.15] tracking-[-0.4px] text-white',
                        isRtl && 'text-right'
                      )}
                    >
                      {activeItem.title}
                    </h3>
                  </div>
                </div>

                {/* Outcome */}
                <p
                  className={cn(
                    'mb-3 text-[13px] font-semibold leading-[1.4]',
                    isRtl && 'text-right'
                  )}
                  style={{ color: accent }}
                >
                  {activeItem.outcome}
                </p>

                {/* Divider */}
                <div
                  className='mb-3 h-px w-full opacity-20'
                  style={{
                    background: `linear-gradient(to right, ${accent}, transparent)`,
                  }}
                  aria-hidden='true'
                />

                {/* Bullets */}
                <ul className={cn('flex flex-col gap-2', isRtl && 'items-end')}>
                  {activeItem.bullets.map((bullet, bi) => (
                    <motion.li
                      key={bullet}
                      initial={prefersReducedMotion ? false : { opacity: 0, x: isRtl ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: bi * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className={cn('flex items-start gap-2.5', isRtl && 'flex-row-reverse')}
                    >
                      <span
                        className='mt-0.5 flex size-[16px] shrink-0 items-center justify-center rounded-full'
                        style={{
                          background: `rgba(${accentRgba},0.18)`,
                          color: accent,
                        }}
                        aria-hidden='true'
                      >
                        <CheckIcon className='size-2' />
                      </span>
                      <span
                        className={cn(
                          'text-[12px] leading-[1.55] text-white/58',
                          isRtl && 'text-right'
                        )}
                      >
                        {bullet}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Trust badge */}
                <div className={cn('mt-4 pt-3 border-t border-white/[0.07]', isRtl && 'text-right')}>
                  <span
                    className='inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.07em]'
                    style={{
                      background: `rgba(${accentRgba},0.12)`,
                      color: accent,
                      border: `1px solid rgba(${accentRgba},0.3)`,
                    }}
                  >
                    {activeItem.trustLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Mini dashboard preview */}
            <MobileDashboard
              item={activeItem}
              dashboard={dashboard}
              accent={accent}
              accentRgba={accentRgba}
              prefersReducedMotion={prefersReducedMotion ?? false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Trust chips row */}
        <ul className='mt-5 flex flex-wrap justify-center gap-1.5' aria-label='Service highlights'>
          {content.trustChips.map((chip) => (
            <li
              key={chip}
              className='rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-white/35'
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </div>
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
      className='rounded-[18px] p-px'
      style={{
        background: `linear-gradient(135deg, rgba(${accentRgba},0.35), rgba(${accentRgba},0.04) 50%, rgba(${accentRgba},0.15))`,
      }}
    >
      <div
        className='rounded-[18px] bg-[#0B1221] overflow-hidden'
        style={{ boxShadow: `0 0 50px rgba(${accentRgba},0.1), 0 20px 40px rgba(0,0,0,0.5)` }}
      >
        {/* Chrome */}
        <div className='flex items-center gap-1.5 border-b border-white/[0.05] bg-white/[0.02] px-3 py-2'>
          <span className='size-2 rounded-full bg-white/[0.08]' aria-hidden='true' />
          <span className='size-2 rounded-full bg-white/[0.08]' aria-hidden='true' />
          <span className='size-2 rounded-full bg-white/[0.08]' aria-hidden='true' />
        </div>

        <div className='flex flex-col gap-2.5 p-3'>
          {/* Service label */}
          <div
            className='rounded-[12px] px-3 py-2'
            style={{
              background: `rgba(${accentRgba},0.1)`,
              border: `1px solid rgba(${accentRgba},0.2)`,
            }}
          >
            <span className='block text-[8.5px] font-bold uppercase tracking-[0.4px] text-white/30'>
              {dashboard.viewingLabel}
            </span>
            <strong className='block text-[13px] font-extrabold text-white'>{item.title}</strong>
          </div>

          {/* Stats grid */}
          <div className='grid grid-cols-3 gap-2'>
            {[
              { value: mock.stats.employees.value, label: dashboard.statEmployeesLabel },
              { value: mock.stats.cleared.value, label: dashboard.statClearedLabel },
              { value: mock.stats.pending.value, label: dashboard.statPendingLabel },
            ].map(({ value, label }) => (
              <div
                key={label}
                className='rounded-[12px] p-2.5'
                style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
              >
                <p className='text-[16px] font-extrabold leading-none text-white'>{value}</p>
                <p className='mt-0.5 text-[8.5px] text-white/28'>{label}</p>
              </div>
            ))}
          </div>

          {/* Employee list */}
          <ul className='flex flex-col gap-1.5' aria-label={dashboard.tabEmployees}>
            {mock.employees.slice(0, 2).map((employee, idx) => (
              <motion.li
                key={`${employee.name}-${idx}`}
                initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.15 + idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'flex items-center gap-2 rounded-[12px] px-2.5 py-2',
                  idx === 0
                    ? 'border border-white/[0.1] bg-white/[0.05]'
                    : 'border border-white/[0.04] bg-white/[0.015] opacity-60'
                )}
              >
                <span
                  className='flex size-7 shrink-0 items-center justify-center rounded-full text-[8.5px] font-extrabold'
                  style={
                    idx === 0
                      ? { background: accent, color: '#050B1A' }
                      : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }
                  }
                  aria-hidden='true'
                >
                  {employee.initials}
                </span>
                <div className='min-w-0 flex-1'>
                  <strong className='block truncate text-[10.5px] font-extrabold leading-tight text-white'>
                    {employee.name}
                  </strong>
                  <span className='block truncate text-[8.5px] text-white/30'>{employee.detail}</span>
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
    </div>
  );
}
