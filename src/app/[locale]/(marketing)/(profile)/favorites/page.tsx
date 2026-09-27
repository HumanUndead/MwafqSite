import type { Metadata } from 'next';
import { getTranslations } from '@/i18n/server';
import { FavoritesView } from '@/modules/services/FavoritesView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profileLayout');
  return { title: t.nav.favorites };
}

export default function FavoritesPage() {
  return <FavoritesView />;
}
