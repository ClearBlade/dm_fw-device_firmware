import { useQuery } from 'react-query';

export interface SoftwareVersion {
  id: string;
  name: string;
  version: string;
  filename: string;
}

async function fetchSoftwareVersions(): Promise<SoftwareVersion[]> {
  // TODO: Replace with your actual API endpoint
  const response = await fetch('/api/software/versions');
  if (!response.ok) {
    throw new Error('Failed to fetch software versions');
  }
  return response.json();
}

export function useSoftwareVersions() {
  return useQuery<SoftwareVersion[], Error>({
    queryKey: ['softwareVersions'],
    queryFn: fetchSoftwareVersions,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  });
} 