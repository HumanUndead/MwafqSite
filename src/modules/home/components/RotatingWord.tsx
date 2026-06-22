'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const TYPE_MS = 75;
const HOLD_MS = 2000;
const ERASE_MS = 45;
const PAUSE_MS = 280;

interface Props {
  words: readonly string[];
  isRtl?: boolean;
}

export function RotatingWord({ words, isRtl = false }: Props) {
  const [text, setText] = useState('');
  const [blinking, setBlinking] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const cancelRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const longestWord = useMemo(
    () => words.reduce((longest, word) => (word.length > longest.length ? word : longest), words[0] ?? ''),
    [words]
  );

  useEffect(() => {
    if (!words.length) return;

    const word = words[wordIndex] ?? '';
    const chars = [...word];
    let pos = 0;

    cancelRef.current = false;

    const clear = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const after = (fn: () => void, ms: number) => {
      clear();
      timerRef.current = setTimeout(() => {
        if (!cancelRef.current) fn();
      }, ms);
    };

    const type = () => {
      pos++;
      setText(chars.slice(0, pos).join(''));
      if (pos < chars.length) {
        after(type, TYPE_MS);
      } else {
        setBlinking(true);
        after(erase, HOLD_MS);
      }
    };

    const erase = () => {
      setBlinking(false);
      doErase();
    };

    const doErase = () => {
      if (pos <= 0) {
        after(() => {
          setWordIndex((i) => (i + 1) % words.length);
        }, PAUSE_MS);
        return;
      }
      pos--;
      setText(chars.slice(0, pos).join(''));
      after(doErase, ERASE_MS);
    };

    after(() => {
      setText('');
      setBlinking(false);
      after(type, TYPE_MS);
    }, 0);

    return () => {
      cancelRef.current = true;
      clear();
    };
  }, [wordIndex, words]);

  if (!words.length) return null;

  return (
    <span
      className='relative inline-block align-baseline whitespace-nowrap ps-1 font-normal italic text-[#00a8f1]'
      aria-live='polite'
    >
      <span className='invisible select-none' aria-hidden='true'>
        {longestWord}
      </span>
      <span
        className={
          isRtl
            ? 'absolute right-0 top-0 inline-flex items-baseline ps-1'
            : 'absolute left-0 top-0 inline-flex items-baseline ps-1'
        }
      >
        <span>{text}</span>
        <motion.span
          aria-hidden='true'
          className='ms-0.5 inline-block h-[0.9em] w-[2.5px] shrink-0 translate-y-[0.05em] rounded-full bg-[#00a8f1]'
          animate={{ opacity: blinking ? [1, 0] : 1 }}
          transition={
            blinking
              ? { duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
              : { duration: 0 }
          }
        />
      </span>
    </span>
  );
}
