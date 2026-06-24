'use client';

import { memo } from 'react';
import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import {
  B2BServiceCapabilityCard,
  type B2BServiceItem,
} from './B2BServiceCapabilityCard';

/**
 * Circular drum/wheel card.
 *
 * Uses circular (shortest-path) distance so the last card wraps above the
 * first and the first wraps below the last, creating a true cycle illusion.
 *
 * d = 0  → active card, facing viewer flat
 * d = -1 → card above active (prev, or last wrapping around)
 * d = +1 → card below active (next, or first wrapping around)
 */
const SLOT_Y    = 168;   // px between card centres
const TILT_DEG  = 38;    // rotateX degrees per step
const Z_STEP    = 90;    // depth recession per step
const SCALE_STEP = 0.14; // scale shrink per step
const OP_STEP   = 0.32;  // opacity fade per step
const MAX_DEPTH = 1.6;   // clamp so far cards don't overshoot

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Shortest signed distance on a ring of `count` items.
 * Always in the range (-count/2, +count/2].
 */
function circularDist(index: number, pos: number, count: number): number {
  const raw = index - pos;
  return raw - Math.round(raw / count) * count;
}

interface Props {
  item: B2BServiceItem;
  index: number;
  count: number;
  position: MotionValue<number>;
  isActive: boolean;
  isRtl: boolean;
}

export const B2BServiceStackCard = memo(function B2BServiceStackCard({
  item,
  index,
  count,
  position,
  isActive,
  isRtl,
}: Props) {
  const prefersReducedMotion = useReducedMotion();

  const y = useTransform(position, (p) => {
    const d = clamp(circularDist(index, p, count), -MAX_DEPTH, MAX_DEPTH);
    return d * SLOT_Y;
  });

  const rotateX = useTransform(position, (p) => {
    const d = clamp(circularDist(index, p, count), -MAX_DEPTH, MAX_DEPTH);
    return -d * TILT_DEG;
  });

  const z = useTransform(position, (p) => {
    const d = Math.abs(clamp(circularDist(index, p, count), -MAX_DEPTH, MAX_DEPTH));
    return -d * Z_STEP;
  });

  const scale = useTransform(position, (p) => {
    const d = Math.abs(clamp(circularDist(index, p, count), -MAX_DEPTH, MAX_DEPTH));
    return clamp(1 - d * SCALE_STEP, 0.1, 1);
  });

  const opacity = useTransform(position, (p) => {
    const d = Math.abs(clamp(circularDist(index, p, count), -MAX_DEPTH, MAX_DEPTH));
    return clamp(1 - d * OP_STEP, 0, 1);
  });

  const zIndex = useTransform(position, (p) => {
    const d = Math.abs(circularDist(index, p, count));
    return Math.round(40 - d * 10);
  });

  return (
    <motion.div
      className='absolute inset-0 flex items-center justify-center will-change-transform'
      style={
        prefersReducedMotion
          ? { zIndex }
          : { y, z, scale, opacity, rotateX, zIndex }
      }
      aria-hidden={!isActive}
    >
      <div
        className={
          isActive
            ? 'w-full max-w-[420px] px-2'
            : 'pointer-events-none w-full max-w-[420px] px-2'
        }
      >
        <B2BServiceCapabilityCard
          item={item}
          isRtl={isRtl}
          isActive={isActive}
        />
      </div>
    </motion.div>
  );
});
