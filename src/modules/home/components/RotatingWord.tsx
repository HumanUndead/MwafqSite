'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const TYPE_MS = 75;
const ERASE_MS = 50;
const HOLD_MS = 1800;
const PAUSE_MS = 250;
const REDUCED_MOTION_CYCLE_MS = 3000;

interface Props {
  words: readonly string[];
}

function toChars(value: string) {
  return [...value];
}

export function RotatingWord({ words }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const timeoutsRef = useRef<number[]>([]);

  const activeWord = words[wordIndex] ?? words[0] ?? '';

  useEffect(() => {
    const clearTimers = () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timeoutsRef.current.push(id);
    };

    if (!activeWord) {
      setDisplayText('');
      return clearTimers;
    }

    if (prefersReducedMotion) {
      setDisplayText(activeWord);

      if (words.length < 2) {
        return clearTimers;
      }

      const intervalId = window.setInterval(() => {
        setWordIndex((current) => (current + 1) % words.length);
      }, REDUCED_MOTION_CYCLE_MS);

      return () => {
        window.clearInterval(intervalId);
        clearTimers();
      };
    }

    clearTimers();
    let cancelled = false;
    const chars = toChars(activeWord);
    let charCount = 0;

    const typeNext = () => {
      if (cancelled) {
        return;
      }

      if (charCount < chars.length) {
        charCount += 1;
        setDisplayText(chars.slice(0, charCount).join(''));
        schedule(typeNext, TYPE_MS);
        return;
      }

      schedule(eraseNext, HOLD_MS);
    };

    const eraseNext = () => {
      if (cancelled) {
        return;
      }

      if (charCount > 0) {
        charCount -= 1;
        setDisplayText(chars.slice(0, charCount).join(''));
        schedule(eraseNext, ERASE_MS);
        return;
      }

      schedule(advanceWord, PAUSE_MS);
    };

    const advanceWord = () => {
      if (cancelled) {
        return;
      }

      if (words.length < 2) {
        typeNext();
        return;
      }

      setWordIndex((current) => (current + 1) % words.length);
    };

    typeNext();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [activeWord, words, prefersReducedMotion]);

  if (!activeWord) {
    return null;
  }

  return (
    <span className='relative px-2 inline-flex font-normal italic text-sky-500 min-w-[200px]'>
      <span>{displayText}</span>
      <motion.span
        aria-hidden='true'
        className='ml-1 inline-block w-[0.08em] rounded-full bg-sky-500'
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: [1, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 0.55,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }
        }
      />
    </span>
  );
}
