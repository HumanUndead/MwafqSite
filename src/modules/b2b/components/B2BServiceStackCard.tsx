'use client';

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
 * One card in the 3D scroll deck. The geometric transforms (y / translateZ /
 * scale / opacity / blur) live on a single layer that is a direct child of the
 * perspective stage, so translateZ renders with real depth. The card face is
 * reused from {@link B2BServiceCapabilityCard}. An inner layer adds a subtle
 * float to the active card only. Transform + opacity only — GPU friendly.
 */

// Deck tunables (px per step of distance from the active card).
// Both upcoming and passed cards stay BELOW the active card so the space above
// it is always clean — no peeking edges reading as a "shadow" above the card.
const PEEK_Y = 28; // upcoming cards peek just below the active card (behind it)
const EXIT_Y = 128; // passed cards sink further down + back as they leave
const Z_STEP = 150; // depth recede per step
const SCALE_UP = 0.07; // upcoming shrink per step
const SCALE_DOWN = 0.06; // passed shrink per step
const OP_UP = 0.34; // upcoming fade per step
const OP_DOWN = 0.6; // passed fade per step (leave faster)
const MAX_DEPTH = 3; // clamp far cards so transforms stay bounded

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

interface Props {
  item: B2BServiceItem;
  index: number;
  /** Continuous active position in [0, count - 1]. */
  position: MotionValue<number>;
  isActive: boolean;
  isRtl: boolean;
}

export function B2BServiceStackCard({
  item,
  index,
  position,
  isActive,
  isRtl,
}: Props) {
  const prefersReducedMotion = useReducedMotion();

  const y = useTransform(position, (p) => {
    const d = index - p;
    return d >= 0
      ? PEEK_Y * Math.min(d, MAX_DEPTH)
      : EXIT_Y * Math.min(-d, MAX_DEPTH);
  });

  const z = useTransform(
    position,
    (p) => -Z_STEP * Math.min(Math.abs(index - p), MAX_DEPTH)
  );

  const scale = useTransform(position, (p) => {
    const d = index - p;
    return d >= 0
      ? 1 - SCALE_UP * Math.min(d, MAX_DEPTH)
      : 1 + SCALE_DOWN * Math.max(d, -MAX_DEPTH);
  });

  const opacity = useTransform(position, (p) => {
    const d = index - p;
    return clamp01(d >= 0 ? 1 - OP_UP * d : 1 - OP_DOWN * -d);
  });

  const filter = useTransform(position, (p) => {
    const blur = Math.min(Math.abs(index - p) * 1.6, 4);
    return `blur(${blur}px)`;
  });

  const zIndex = useTransform(position, (p) =>
    Math.round(40 - Math.abs(index - p) * 8)
  );

  return (
    <motion.div
      className='absolute inset-0 flex items-center justify-center will-change-transform'
      style={
        prefersReducedMotion
          ? { zIndex }
          : { y, z, scale, opacity, filter, zIndex }
      }
      aria-hidden={!isActive}
    >
      <motion.div
        className={
          isActive
            ? 'w-full max-w-[440px] px-2'
            : 'pointer-events-none w-full max-w-[440px] px-2'
        }
        animate={
          isActive && !prefersReducedMotion ? { y: [0, -9, 0] } : { y: 0 }
        }
        transition={
          isActive && !prefersReducedMotion
            ? { duration: 6.5, ease: 'easeInOut', repeat: Infinity }
            : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <B2BServiceCapabilityCard
          item={item}
          isRtl={isRtl}
          isActive={isActive}
        />
      </motion.div>
    </motion.div>
  );
}
