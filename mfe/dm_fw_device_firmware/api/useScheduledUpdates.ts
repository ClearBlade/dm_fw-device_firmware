import { useQuery } from 'react-query';
import { getAuthInfo } from "../utils/authInfo";
import { getPlatformInfo } from "../utils/platformInfo";
import { Installation } from '../types';

async function fetchScheduledUpdates(assetType: string, softwareName: string): Promise<Installation[]> {
  const authInfo = getAuthInfo();

  console.log('fetching scheduled updates for assetType:', assetType);
  console.log('fetching scheduled updates for softwareName:', softwareName);

  const response = await fetch(`${getPlatformInfo().url}/api/v/4/database/${authInfo.systemKey}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClearBlade-UserToken': authInfo.userToken,
    },
    body: JSON.stringify({
      query: `select asset_id, installation_date, user_id, version, status, software_descriptor 
              from device_software_installed 
              where status = 'pending' 
              and software_descriptor = '${softwareName}' 
              and asset_id in (select id from assets where type = '${assetType}')`
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch scheduled updates');
  }
  return response.json();
}

interface UseScheduledUpdatesOptions {
  enabled?: boolean;
  assetType?: string;
  softwareName?: string;
}

export function useScheduledUpdates(options: UseScheduledUpdatesOptions = {}) {
  return useQuery<Installation[], Error>({
    queryKey: ['scheduledUpdates', options.assetType, options.softwareName],
    queryFn: () => fetchScheduledUpdates(options.assetType || '', options.softwareName || ''),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: true,
    enabled: options.enabled ?? true,
  });
} 