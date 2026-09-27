import type {
  CheckoutSlotDay,
  CheckoutState,
  CheckoutStepId,
  CheckoutTimeSlot,
} from './types/checkout.types';

/** How far ahead a date can be booked. */
export const BOOKING_HORIZON_DAYS = 180;

/** A saved, unfinished checkout expires after this. */
export const CHECKOUT_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** `CustomDays` flag per JS weekday (0 = Sunday). Saturday=1 … Friday=64. */
const CUSTOM_DAY_FLAG = [2, 4, 8, 16, 32, 64, 1] as const;

/** Saturday-first order used for the working-days chips. */
export const CUSTOM_DAYS_ORDER = [6, 0, 1, 2, 3, 4, 5] as const;

export function customDayFlag(jsWeekday: number): number {
  return CUSTOM_DAY_FLAG[jsWeekday] ?? 0;
}

export function checkoutSteps(hasCourseStep: boolean): CheckoutStepId[] {
  return hasCourseStep
    ? ['family', 'facility', 'time', 'course', 'confirm']
    : ['family', 'facility', 'time', 'confirm'];
}

/** Local `YYYY-MM-DD` (no UTC shift). */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse `YYYY-MM-DD` as a local date. */
export function fromIsoDate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function weekdayName(date: Date): string {
  return WEEKDAY_NAMES[date.getDay()];
}

export function slotsForDate(
  days: CheckoutSlotDay[] | undefined,
  date: Date
): CheckoutTimeSlot[] {
  const name = weekdayName(date);
  return days?.find((entry) => entry.day === name)?.slotTimes ?? [];
}

interface BookableContext {
  closingDays: number[];
  scheduleOffs: string[];
  isClosedToday: boolean;
  days: CheckoutSlotDay[] | undefined;
}

export function isDateBookable(date: Date, ctx: BookableContext): boolean {
  const today = startOfToday();
  if (date < today) return false;
  if (date > addDays(today, BOOKING_HORIZON_DAYS)) return false;
  if (toIsoDate(date) === toIsoDate(today) && ctx.isClosedToday) return false;
  if (ctx.closingDays.includes(customDayFlag(date.getDay()))) return false;
  if (ctx.scheduleOffs.includes(toIsoDate(date))) return false;
  return slotsForDate(ctx.days, date).length > 0;
}

export function firstBookableDate(ctx: BookableContext): Date | null {
  const today = startOfToday();
  for (let offset = 0; offset <= BOOKING_HORIZON_DAYS; offset += 1) {
    const date = addDays(today, offset);
    if (isDateBookable(date, ctx)) return date;
  }
  return null;
}

export interface GroupedSlots {
  serviceProviderBranchServiceId: number;
  label: string;
  price: number;
  taxPrice: number;
  slots: CheckoutTimeSlot[];
}

/** One card per branch-service; each needs exactly one chosen slot. */
export function groupSlotsByService(slots: CheckoutTimeSlot[]): GroupedSlots[] {
  const groups = new Map<number, GroupedSlots>();
  for (const slot of slots) {
    const key = slot.serviceProviderBranchServiceId;
    const existing = groups.get(key);
    if (existing) {
      existing.slots.push(slot);
      continue;
    }
    groups.set(key, {
      serviceProviderBranchServiceId: key,
      label: slot.serviceGroupName?.trim() || slot.serviceName?.trim() || '',
      price: slot.price,
      taxPrice: slot.taxPrice,
      slots: [slot],
    });
  }
  return [...groups.values()].map((group) => ({
    ...group,
    slots: [...group.slots].sort((a, b) => a.from.localeCompare(b.from)),
  }));
}

/** `HH:mm:ss` → `HH:mm`. */
export function formatSlotTime(value: string): string {
  return value.slice(0, 5);
}

/** Great-circle distance in km. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export { utcOffsetLabel } from '@/shared/lib/dates';

export const EMPTY_CHECKOUT_STATE: CheckoutState = {
  service: null,
  ownerId: null,
  facility: null,
  appointment: { selectedSlots: [] },
  course: { selectedCertified: false, selectedSadad: false },
};

/** Price summary shown on confirm (display only; the server charges). */
export function checkoutTotals(state: CheckoutState) {
  const base = state.appointment.selectedSlots.reduce(
    (sum, slot) => sum + slot.price,
    0
  );
  const tax = state.appointment.selectedSlots.reduce(
    (sum, slot) => sum + slot.taxPrice,
    0
  );
  const course = state.course.courseId ? state.course.courseTotalPrice ?? 0 : 0;
  return { base, tax, course, total: base + tax + course };
}
