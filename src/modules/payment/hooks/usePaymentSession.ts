'use client';

import { useEffect, useRef } from 'react';
import { PAYMENT_SESSION_DURATION_MS } from '../paymentOutcome.shared';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

/**
 * Idle guard for an open card form: calls `onExpire` after
 * `PAYMENT_SESSION_DURATION_MS` without user activity.
 */
export function usePaymentSession(active: boolean, onExpire: () => void) {
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!active) return;

    let timer = window.setTimeout(
      () => onExpireRef.current(),
      PAYMENT_SESSION_DURATION_MS
    );
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => onExpireRef.current(),
        PAYMENT_SESSION_DURATION_MS
      );
    };

    ACTIVITY_EVENTS.forEach((name) =>
      window.addEventListener(name, refresh, { passive: true })
    );
    return () => {
      window.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((name) =>
        window.removeEventListener(name, refresh)
      );
    };
  }, [active]);
}
