import type { User } from '@/shared/types/user.types';

export type DeactivateAccountStep = 'identify' | 'otp' | 'confirm' | 'deactivating';

export type DeactivateCompletionStatus = 'success' | 'error';

export interface DeactivateAccountState {
  step: DeactivateAccountStep;
  identifier: string;
  token: string | null;
  user: User | null;
  loading: boolean;
  fieldError: string | null;
}
