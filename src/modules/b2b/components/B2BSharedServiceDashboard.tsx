'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import type { Dictionary } from '@/locales/types';
import type { B2BServiceItem } from './B2BServiceCapabilityCard';

const STATUS_STYLES: Record<string, string> = {
  done: 'bg-[#00dec9]/15 text-[#00897b]',
  active: 'bg-[#ff9800]/20 text-[#e65100]',
  wait: 'bg-[#78909c]/15 text-[#546e7a]',
};

interface Props {
  items: B2BServiceItem[];
  activeIndex: number;
  dashboard: Dictionary['b2b']['services']['dashboard'];
}

export function B2BSharedServiceDashboard({
  items,
  activeIndex,
  dashboard,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const activeItem = items[activeIndex] ?? items[0];

  return (
    <div className='overflow-hidden rounded-[18px] border-2 border-[#1e2364] bg-white shadow-[0_20px_60px_rgba(30,35,100,0.12)]'>
      <div className='flex items-center gap-2 border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-3 py-2'>
        <div className='flex gap-1.5' aria-hidden='true'>
          <span className='size-2 rounded-full bg-[#c0c3d4]' />
          <span className='size-2 rounded-full bg-[#c0c3d4]' />
          <span className='size-2 rounded-full bg-[#c0c3d4]' />
        </div>
      </div>

      <div className='flex flex-col gap-3 p-3 sm:p-4'>
        <div className='relative min-h-[64px] overflow-hidden rounded-[12px] border border-[#00a8f1]/25 bg-[#00a8f1]/6 px-3 py-2'>
          <AnimatePresence mode='wait' initial={false}>
            <motion.div
              key={activeItem?.title}
              initial={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }
              }
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className='block text-[9px] font-bold uppercase tracking-[0.5px] text-[#6b7196]'>
                {dashboard.viewingLabel}
              </span>
              <strong className='block text-[13px] font-extrabold text-[#1e2364] sm:text-[14px]'>
                {activeItem?.title}
              </strong>
              <span className='mt-0.5 block text-[10px] leading-[1.4] text-[#6b7196]'>
                {activeItem?.outcome}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className='flex gap-0.5 rounded-full bg-[#f4f4f6] p-1'>
          <span className='flex-1 rounded-full bg-white py-1 text-center text-[10px] font-extrabold text-[#1e2364] shadow-sm'>
            {dashboard.tabOverview}
          </span>
          <span className='flex-1 py-1 text-center text-[10px] font-medium text-[#6b7196]'>
            {dashboard.tabEmployees}
          </span>
          <span className='flex-1 py-1 text-center text-[10px] font-medium text-[#6b7196]'>
            {dashboard.tabReports}
          </span>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          <StatCard
            value='248'
            label={dashboard.statEmployeesLabel}
            numColor='#1565c0'
            barColor='#1e88e5'
            bars={[8, 12, 6, 14, 10, 16, 18]}
          />
          <StatCard
            value='96%'
            label={dashboard.statClearedLabel}
            numColor='#00897b'
            barColor='#00dec9'
            bars={[6, 10, 8, 16, 12, 14, 18]}
          />
          <StatCard
            value='12'
            label={dashboard.statPendingLabel}
            numColor='#e65100'
            barColor='#ff9800'
            bars={[10, 14, 8, 12, 6, 16, 10]}
          />
        </div>

        <ul className='flex flex-col gap-2' aria-label={dashboard.tabEmployees}>
          {items.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <li
                key={item.title}
                className={cn(
                  'flex items-center gap-2.5 rounded-[14px] border px-3 py-2.5 transition-colors duration-200',
                  isActive
                    ? 'border-[#00a8f1] bg-[#00a8f1]/6 shadow-[0_0_0_1px_rgba(0,168,241,0.15)]'
                    : 'border-[#e5e7f0] bg-white opacity-80'
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-[9.5px] font-extrabold',
                    isActive
                      ? 'bg-[#1e2364] text-white'
                      : 'bg-[#f4f4f6] text-[#1e2364]'
                  )}
                >
                  {item.preview.initials}
                </span>
                <div className='min-w-0 flex-1'>
                  <strong className='block truncate text-[11px] font-extrabold leading-tight text-[#1e2364]'>
                    {item.preview.name}
                  </strong>
                  <span className='block truncate text-[9.5px] text-[#6b7196]'>
                    {item.preview.detail}
                  </span>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.3px]',
                    STATUS_STYLES[item.preview.status] ?? STATUS_STYLES.wait
                  )}
                >
                  {item.preview.statusLabel}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  numColor,
  barColor,
  bars,
}: {
  value: string;
  label: string;
  numColor: string;
  barColor: string;
  bars: number[];
}) {
  const max = Math.max(...bars);

  return (
    <div className='rounded-[12px] border border-[#e5e7f0] p-2.5'>
      <p
        className='text-[18px] font-extrabold leading-none'
        style={{ color: numColor }}
      >
        {value}
      </p>
      <p className='mt-0.5 text-[9px] text-[#6b7196]'>{label}</p>
      <svg viewBox='0 0 64 20' className='mt-2 w-full' aria-hidden='true'>
        {bars.map((val, i) => {
          const h = Math.round((val / max) * 20);
          return (
            <rect
              key={i}
              x={i * 9 + 0.5}
              y={20 - h}
              width='7'
              height={h}
              rx='1.5'
              fill={barColor}
            />
          );
        })}
      </svg>
    </div>
  );
}
