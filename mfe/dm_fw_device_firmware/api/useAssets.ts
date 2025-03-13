import { useQuery } from 'react-query';
import { getAuthInfo } from "../utils/authInfo";
import { getPlatformInfo } from "../utils/platformInfo";
import { Asset } from '../types';

//api/v/4/database/<systemKey>/query with a body like {"query": "select * from foo"}

async function fetchAssets(assetType: string): Promise<Asset[]> {
  const authInfo = getAuthInfo();
  const response = await fetch(`${getPlatformInfo().url}/api/v/4/database/${authInfo.systemKey}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClearBlade-UserToken': authInfo.userToken,
    },
    body: JSON.stringify({
      query: "select id, type, label from assets where type = '" + assetType + "' order by id"
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch device types');
  }

  return response.json();
}

export function useAssets(assetType: string) {
  return useQuery<Asset[], Error>({
    queryKey: ['assets', assetType],
    queryFn: () => fetchAssets(assetType),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 3, // Retry failed requests 3 times
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
} 