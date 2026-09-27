import 'server-only';

export {
  resolveRouteToken as resolveAcademyToken,
  routeUnauthorized as academyUnauthorized,
  routeOk as academyOk,
  routeError as academyRouteError,
} from '@/shared/lib/upstream';
