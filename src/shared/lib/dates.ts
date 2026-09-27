/** `DD/MM/YYYY` from an ISO date or date-time (calendar date, no TZ shift). */
export function formatDateDMY(value: string | null | undefined): string {
  if (!value) return '';
  const [y, m, d] = value.slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : value;
}

/** Parse a backend UTC timestamp that may lack the trailing `Z`. */
export function parseUtc(value: string): Date {
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasZone ? value : `${value}Z`);
}

/** Local date + time for a UTC timestamp, e.g. status logs. */
export function formatUtcDateTime(value: string | null | undefined, locale: string): string {
  if (!value) return '';
  const date = parseUtc(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Whole minutes between two ISO timestamps (never negative). */
export function minutesBetween(start: string, end: string): number {
  const diff = parseUtc(end).getTime() - parseUtc(start).getTime();
  return Number.isFinite(diff) ? Math.max(0, Math.round(diff / 60000)) : 0;
}

/** Device UTC offset label, e.g. `UTC+3`. */
export function utcOffsetLabel(): string {
  const offset = -new Date().getTimezoneOffset();
  const sign = offset < 0 ? '-' : '+';
  const abs = Math.abs(offset);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return minutes
    ? `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`
    : `UTC${sign}${hours}`;
}
