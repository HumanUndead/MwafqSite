export interface EntityTranslation {
  id: number;
  langId: number;
  categoryId?: number;
  name: string;
  description?: string | null;
}
