import type {
  PaginatedResponse,
  UpstreamApiResponse,
} from '@/shared/types/api.types';

export interface CourseCategoryTranslation {
  id: number;
  langId: number;
  categoryId: number;
  name: string;
  description: string;
}

export interface CourseCategoryListItem {
  id: number;
  parentId: number | null;
  rank: number;
  status: boolean;
  fullImagePath: string;
  hasChild: boolean;
  hasCourse: boolean;
  parentName: string | null;
  translations: CourseCategoryTranslation[];
}

export type CourseCategoryListPage = PaginatedResponse<CourseCategoryListItem>;

export type CourseCategoryListResponse =
  UpstreamApiResponse<CourseCategoryListPage>;
