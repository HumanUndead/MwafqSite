import type { Metadata } from 'next';
import { getTranslations } from '@/i18n/server';
import { FamilyView } from '@/modules/family';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('family');
  return { title: t.metaTitle };
}

export default function FamilyPage() {
  return <FamilyView />;
}
