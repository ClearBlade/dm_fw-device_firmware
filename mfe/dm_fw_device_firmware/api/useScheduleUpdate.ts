import { useMutation, useQueryClient } from 'react-query';
import { getAuthInfo } from "../utils/authInfo";
import { getPlatformInfo } from "../utils/platformInfo";
import { ScheduleUpdateParams } from '../types';
import { useUserInfo } from '@clearblade/ia-mfe-react';

function generateUUID(): string {
  return crypto.randomUUID();
}

async function scheduleUpdate(params: ScheduleUpdateParams, userEmail: string) {
  const authInfo = getAuthInfo();
  const platformInfo = getPlatformInfo();

  const { deviceIds, version, installDate, softwareName } = params;

  const install_updates = deviceIds.map(deviceId => {
    const uuid = generateUUID();
    return {
      id: uuid,
      install_request_date: new Date().toISOString(),
      installation_date: installDate,
      asset_id: deviceId,
      user_id: userEmail,
      version: version,
      software_descriptor: softwareName,
      status: 'pending',
    };
  });

  const status_updates = deviceIds.map((deviceId, index) => ({
    id: install_updates[index].id, // Use the same UUID for corresponding status record
    timestamp: installDate,
    status: 'pending',
    description: `Scheduled update to ${softwareName} version ${version}`
  }));

  const install_response = await fetch(`${platformInfo.url}/api/v/1/collection/${authInfo.systemKey}/device_software_installed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClearBlade-UserToken': authInfo.userToken,
    },
    body: JSON.stringify(install_updates)
  });

  const status_response = await fetch(`${platformInfo.url}/api/v/1/collection/${authInfo.systemKey}/device_software_install_status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClearBlade-UserToken': authInfo.userToken,
    },
    body: JSON.stringify(status_updates)
  });

  if (!install_response.ok || !status_response.ok) {
    throw new Error('Failed to schedule updates');
  }
  return status_response.json();
}

export function useScheduleUpdate() {
  const queryClient = useQueryClient();
  const userInfo = useUserInfo();

  return useMutation(
    (params: ScheduleUpdateParams) => scheduleUpdate(params, userInfo.data?.email || ''),
    {
      onSuccess: () => {
        // Invalidate the scheduled updates query to trigger a refetch
        queryClient.invalidateQueries('scheduledUpdates');
      },
    }
  );
} 