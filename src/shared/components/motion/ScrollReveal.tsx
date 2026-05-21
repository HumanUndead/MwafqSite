'use client';

import {
  motion,
  useInView,
  useReducedMotion,
  type Easing,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import styles from './ScrollReveal.module.css';

const ease: Easing = [0.22, 1, 0.36, 1];

const transitionReveal = { duration: 1, ease };
const transitionWord = { duration: 0.9, ease };

const inViewOpts = {
  once: true,
  amount: 0.12,
  margin: '0px 0px -50px 0px' as const,
};

export type ScrollRevealVariant = 'y' | 'x' | 'word';

export type ScrollRevealProps = {
  children: React.ReactNode;
  variant?: ScrollRevealVariant;
  className?: string;
  id?: string;
  /** Delay in seconds before the reveal transition (e.g. staggered children). */
  transitionDelay?: number;
  /** Skip intersection / load delay — visible immediately (like `.pkg`). */
  instant?: boolean;
  /**
   * After `window` `load` + this many ms, animate in without IntersectionObserver
   * (like `.profile-section .reveal`).
   */
  revealAfterLoadMs?: number;
};

export function ScrollReveal({
  children,
  variant = 'y',
  className,
  id,
  transitionDelay = 0,
  instant = false,
  revealAfterLoadMs,
}: ScrollRevealProps) {
  const blockRef = useRef<HTMLDivElement>(null);
  const wordOuterRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const useIntersection = revealAfterLoadMs == null;
  const inView = useInView(
    variant === 'word' ? wordOuterRef : blockRef,
    inViewOpts
  );
  const [loadShown, setLoadShown] = useState(false);

  useEffect(() => {
    if (revealAfterLoadMs == null) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      timeoutId = setTimeout(() => {
        if (!cancelled) setLoadShown(true);
      }, revealAfterLoadMs);
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      window.removeEventListener('load', schedule);
    };
  }, [revealAfterLoadMs]);

  const shown =
    prefersReducedMotion || instant || loadShown || (useIntersection && inView);

  if (variant === 'word') {
    return (
      <motion.span
        ref={wordOuterRef}
        className={[styles.wordReveal, className].filter(Boolean).join(' ')}
      >
        <motion.span
          className={styles.wordRevealInner}
          initial={{ y: '110%' }}
          animate={shown ? { y: 0 } : { y: '110%' }}
          transition={{ ...transitionWord, delay: transitionDelay }}
        >
          {children}
        </motion.span>
      </motion.span>
    );
  }

  const hidden =
    variant === 'x' ? { opacity: 0, x: 60, y: 0 } : { opacity: 0, y: 40, x: 0 };
  const visible = { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      ref={blockRef}
      id={id}
      className={className}
      initial={hidden}
      animate={shown ? visible : hidden}
      transition={{ ...transitionReveal, delay: transitionDelay }}
    >
      {children}
    </motion.div>
  );
}
