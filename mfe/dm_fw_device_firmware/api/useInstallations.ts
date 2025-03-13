import { useQuery } from 'react-query';
import { getAuthInfo } from "../utils/authInfo";
import { getPlatformInfo } from "../utils/platformInfo";
import { Installation } from '../types';

async function fetchInstallations(assetType: string, softwareName: string): Promise<Installation[]> {
  const authInfo = getAuthInfo();

  console.log('fetching installations for assetType:', assetType);
  console.log('fetching installations for softwareName:', softwareName);

  const response = await fetch(`${getPlatformInfo().url}/api/v/4/database/${authInfo.systemKey}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClearBlade-UserToken': authInfo.userToken,
    },
    body: JSON.stringify({
      query: `select asset_id, installation_date, user_id, version, status, software_descriptor 
              from device_software_installed 
              where software_descriptor = '${softwareName}' 
              and asset_id in (select id from assets where type = '${assetType}')`
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch installations');
  }
  return response.json();
}

interface UseInstallationsOptions {
  enabled?: boolean;
  assetType?: string;
  softwareName?: string;
}

export function useInstallations(options: UseInstallationsOptions = {}) {
  return useQuery<Installation[], Error>({
    queryKey: ['installations', options.assetType, options.softwareName],
    queryFn: () => fetchInstallations(options.assetType || '', options.softwareName || ''),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 3,
    refetchOnWindowFocus: true, // Refetch when window regains focus to keep data fresh
    enabled: options.enabled ?? true,
  });
} 