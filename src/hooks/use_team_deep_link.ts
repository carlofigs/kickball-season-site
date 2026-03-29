import { useLocation } from 'react-router-dom';
import { teamDeepLinkTo } from '../utils/routing';

export function useTeamDeepLinkTo(team: string): string {
  const location = useLocation();
  return teamDeepLinkTo(location, team);
}
