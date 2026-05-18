import {
  PaginatedResponse,
  UpstreamApiResponse,
} from '@/shared/types/api.types';

export interface CourseListTranslation {
  langId: number;
  name: string;
  description: string;
  tags: string;
  whatYouWillLearn: string;
}

export interface CourseListItem {
  id: number;
  rank: number;
  status: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  target: string;
  fullImagePath: string;
  translations: CourseListTranslation[];
}

export interface CourseListResponse extends UpstreamApiResponse<
  PaginatedResponse<CourseListItem>
> {}
