import { HomePage } from '@/modules/home/HomePage'

export default async function MarketingHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await params
  return <HomePage />
}
