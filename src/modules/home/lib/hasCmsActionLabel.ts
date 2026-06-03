import type { HomeActionContent } from '@/modules/home/home.types';

export function hasCmsActionLabel(
  action: HomeActionContent | null | undefined
): action is HomeActionContent {
  return Boolean(action?.label.trim());
}
