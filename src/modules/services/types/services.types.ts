export type ExamType =
  | 'pre-employment'
  | 'driving'
  | 'residency'
  | 'visa'
  | 'general';

export type PackageTag = 'popular' | 'new';

export type ServicePackage = {
  id: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  duration: number;
  tests: number;
  price: number;
  tag?: PackageTag;
  image: string;
  examType: ExamType;
};
