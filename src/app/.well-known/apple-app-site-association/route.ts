import {
  appleAppSiteAssociation,
  jsonAssociationResponse,
} from '@/modules/deep-linking';

/**
 * Association file Apple's CDN fetches to verify Universal Links. Served
 * without a `.json` extension, as Apple requires.
 */
export const dynamic = 'force-static';

export function GET() {
  return jsonAssociationResponse(appleAppSiteAssociation);
}
