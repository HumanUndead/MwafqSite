/** Dashboard areas from `General/B2CManagement/List` (`type`). */
export const FeatureArea = {
  Academy: 1,
  Payment: 2,
  Onboarding: 4,
  Account: 8,
} as const;
export type FeatureArea = (typeof FeatureArea)[keyof typeof FeatureArea];

/** Toggle bits inside an area's `featureToggles` mask. */
export const FeatureToggle = {
  academy: { area: FeatureArea.Academy, bit: 1 },
  paymentGateway: { area: FeatureArea.Payment, bit: 1 },
  onboarding: { area: FeatureArea.Onboarding, bit: 1 },
  deleteAccount: { area: FeatureArea.Account, bit: 1 },
  selfRegistration: { area: FeatureArea.Account, bit: 2 },
} as const;
export type FeatureToggleKey = keyof typeof FeatureToggle;

export interface FeatureToggleItem {
  id: number;
  type: number;
  featureToggles: number;
}

/** A missing list or area reads as enabled (fails open, like mobile). */
export function isFeatureEnabled(
  items: FeatureToggleItem[] | null | undefined,
  key: FeatureToggleKey
): boolean {
  const { area, bit } = FeatureToggle[key];
  const item = items?.find((entry) => entry.type === area);
  if (!item) return true;
  return (item.featureToggles & bit) === bit;
}
