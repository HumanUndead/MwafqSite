'use client';
import { useEffect, useState } from 'react';
function formatCount(value: number, suffix = '', decimals = 0) {
  if (suffix === 'K+') return `${Math.round(value / 1000)}K+`;
  if (decimals > 0) return `${value.toFixed(decimals)}${suffix}`;
  return `${Math.round(value).toLocaleString()}${suffix}`;
}

export function CountUp({
  value,
  suffix,
  decimals,
  className,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(() =>
    formatCount(0, suffix, decimals)
  );

  useEffect(() => {
    const start = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatCount(value * eased, suffix, decimals));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [decimals, suffix, value]);

  return <span className={className}>{display}</span>;
}
