import 'server-only';

import type { PersonalStatistics } from '@/modules/profile-personal/types/personalStats.types';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';
export const getPersonalStatistics = (): Promise<PersonalStatistics> =>
  fetchWithErrorHandling<PersonalStatistics>(
    '/api/Academy/UserServices/GetMyStats'
  );
