export interface ArticleCategoryTranslationDto {
  id: number;
  articleCategoryId: number;
  name: string;
  description: string | null;
  langId: number;
}

export interface ArticleTranslationDto {
  id: number;
  articleId: number;
  langId: number;
  name: string;
  description: string | null;
  shortDescription: string | null;
  extraInfo: string | null;
}

export interface RecursiveArticleDto {
  id: number;
  articleCategoryId: number;
  rank: number;
  published: boolean;
  image: string | null;
  images: string | null | undefined;
  path: string | null | undefined;
  translations: ArticleTranslationDto[];
}

export interface RecursiveArticleCategoryDto {
  id: number;
  rank: number;
  published: boolean;
  parentId: number | null;
  image: string | null;
  hasChild: boolean;
  hasArticle: boolean;
  translations: ArticleCategoryTranslationDto[];
  children: RecursiveArticleCategoryDto[];
  articles: RecursiveArticleDto[];
}

export interface RecursiveArticleCategoryResponse {
  value: RecursiveArticleCategoryDto | null;
  isSuccess: boolean;
}
