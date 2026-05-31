import type {
  PaginatedResponse,
  UpstreamApiResponse,
} from '@/shared/types/api.types';
import type { EntityTranslation } from '@/shared/types/entity-translation.types';

export interface CourseCategoryListItem {
  id: number;
  parentId: number | null;
  rank: number;
  status: boolean;
  fullImagePath: string;
  hasChild: boolean;
  hasCourse: boolean;
  parentName: string | null;
  translations: EntityTranslation[];
}

export type CourseCategoryListPage = PaginatedResponse<CourseCategoryListItem>;

export type CourseCategoryListResponse =
  UpstreamApiResponse<CourseCategoryListPage>;
