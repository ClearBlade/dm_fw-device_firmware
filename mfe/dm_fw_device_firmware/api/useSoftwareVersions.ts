import { useQuery } from 'react-query';
import { getAuthInfo } from "../utils/authInfo";
import { getPlatformInfo } from "../utils/platformInfo";
import { SoftwareVersion } from '../types';

async function fetchSoftwareVersions(deviceType: string, softwareName: string): Promise<SoftwareVersion[]> {
  const authInfo = getAuthInfo();

  const response = await fetch(`${getPlatformInfo().url}/api/v/4/database/${authInfo.systemKey}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClearBlade-UserToken': authInfo.userToken,
    },
    body: JSON.stringify({
      query: "select device_type, name, version, file_name, file_path from device_software_versions where device_type = '" + deviceType + "' and name = '" + softwareName + "'"
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch software versions');
  }
  return response.json();
}

export function useSoftwareVersions(deviceType: string, softwareName: string) {
  return useQuery<SoftwareVersion[], Error>({
    queryKey: ['softwareVersions', deviceType, softwareName],
    queryFn: () => fetchSoftwareVersions(deviceType, softwareName),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
} 