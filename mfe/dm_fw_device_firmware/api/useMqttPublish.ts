import { useMutation } from 'react-query';
import { getAuthInfo } from "../utils/authInfo";
import { getPlatformInfo } from "../utils/platformInfo";
import { useUserInfo } from '@clearblade/ia-mfe-react';

const SOFTWARE_UPDATE_TOPIC = "devices/software/update";

interface MqttPublishParams {
  softwareName: string;
  version: string;
  assets: string[];
}

async function publishMqttPayload(params: MqttPublishParams, userEmail: string) {
  const authInfo = getAuthInfo();
  const response = await fetch(`${getPlatformInfo().url}/api/v/1/message/${authInfo.systemKey}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClearBlade-UserToken': authInfo.userToken,
    },
    body: JSON.stringify({
      topic: SOFTWARE_UPDATE_TOPIC,
      body: JSON.stringify({
        softwareName: params.softwareName,
        version: params.version,
        install_timestamp: new Date().toISOString(),
        userId: userEmail,
        assets: params.assets
      }),
      qos: 0
    })
  });

  if (!response.ok) {
    throw new Error('Failed to publish software update message');
  }

  var theResponse = response.text();

  return theResponse;
}

export function useMqttPublish() {
  const userInfo = useUserInfo();

  return useMutation(
    (params: MqttPublishParams) => publishMqttPayload(params, userInfo.data?.email || ''),
    {
      onSuccess: () => {
        // The message has been published successfully
      },
    }
  );
} 