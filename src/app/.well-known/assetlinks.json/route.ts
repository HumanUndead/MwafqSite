import {
  androidAssetLinks,
  jsonAssociationResponse,
} from '@/modules/deep-linking';

/** Digital Asset Links file Google fetches to verify Android App Links. */
export const dynamic = 'force-static';

export function GET() {
  return jsonAssociationResponse(androidAssetLinks);
}
