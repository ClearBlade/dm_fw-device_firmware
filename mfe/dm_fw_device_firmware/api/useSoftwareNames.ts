import { useQuery } from 'react-query';
import { getAuthInfo } from "../utils/authInfo";
import { getPlatformInfo } from "../utils/platformInfo";

interface SoftwareName {
  id?: string;
  name: string;
}

async function fetchSoftwareNames(deviceType: string): Promise<SoftwareName[]> {
  const authInfo = getAuthInfo();

  const response = await fetch(`${getPlatformInfo().url}/api/v/4/database/${authInfo.systemKey}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClearBlade-UserToken': authInfo.userToken,
    },
    body: JSON.stringify({
      query: "select distinct(name) from device_software_versions where device_type = '" + deviceType + "'"
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch software names');
  }
  return response.json();
}

export function useSoftwareNames(deviceType: string) {
  return useQuery<SoftwareName[], Error>({
    queryKey: ['softwareNames', deviceType],
    queryFn: () => fetchSoftwareNames(deviceType),
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
} 