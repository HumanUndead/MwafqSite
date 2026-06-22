'use client';

import { RefObject, useEffect, useRef, useState } from 'react';

type ScrollCaptureOptions = {
  enabled: boolean;
  distance: number;
  stepSize: number;
  itemCount: number;
  /** Direct DOM updates — avoids per-frame React re-renders during scroll. */
  onFrame?: (step: number, subProgress: number) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getSectionTop(section: HTMLElement) {
  return section.getBoundingClientRect().top + window.scrollY;
}

function computeStepProgress(
  raw: number,
  distance: number,
  stepSize: number,
  itemCount: number
) {
  const isComplete = raw >= distance - 1;
  const progressValue = isComplete
    ? itemCount
    : clamp(raw / stepSize, 0, itemCount);
  const step = isComplete
    ? itemCount - 1
    : Math.min(itemCount - 1, Math.floor(progressValue));
  const subProgress =
    isComplete && step === itemCount - 1
      ? 1
      : clamp(progressValue - step, 0, 1);

  return { step, subProgress };
}

export function useSectionScrollCapture(
  sectionRef: RefObject<HTMLElement | null>,
  { enabled, distance, stepSize, itemCount, onFrame }: ScrollCaptureOptions
) {
  const [step, setStep] = useState(0);
  const lastStepRef = useRef(0);
  const onFrameRef = useRef(onFrame);

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!enabled) {
      lastStepRef.current = 0;
      return;
    }

    if (distance <= 0 || stepSize <= 0) return;

    let frameId = 0;

    function syncFromWindow() {
      const section = sectionRef.current;
      if (!section) return;

      const raw = clamp(window.scrollY - getSectionTop(section), 0, distance);
      const { step: nextStep, subProgress } = computeStepProgress(
        raw,
        distance,
        stepSize,
        itemCount
      );

      onFrameRef.current?.(nextStep, subProgress);

      if (nextStep !== lastStepRef.current) {
        lastStepRef.current = nextStep;
        setStep(nextStep);
      }
    }

    function requestSync() {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        syncFromWindow();
      });
    }

    requestSync();
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
    };
  }, [distance, enabled, itemCount, sectionRef, stepSize]);

  return { step };
}
