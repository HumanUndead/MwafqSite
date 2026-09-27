/** Two-decimal SAR amount with western digits (e.g. `1,250.00`). */
export function formatSar(amount: number | null | undefined): string {
  const value = Number.isFinite(amount) ? Number(amount) : 0;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Round to halalas precision to avoid float drift in sums. */
export function roundSar(amount: number): number {
  return Math.round(amount * 100) / 100;
}
