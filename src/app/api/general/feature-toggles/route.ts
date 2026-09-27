import { getFeatureToggles } from '@/shared/lib/featureToggles';
import { routeOk } from '@/shared/lib/upstream';

export async function GET() {
  return routeOk(await getFeatureToggles());
}
