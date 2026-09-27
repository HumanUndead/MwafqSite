import type { Metadata } from 'next';
import { getTranslations } from '@/i18n/server';
import { FamilyRequestsView } from '@/modules/family';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('family');
  return { title: t.requests.title };
}

export default function FamilyRequestsPage() {
  return <FamilyRequestsView />;
}
