import { useMutation } from 'react-query';
import { getAuthInfo } from "../utils/authInfo";
import { getPlatformInfo } from "../utils/platformInfo";
import { FileSpec } from '../types';

const BUCKET_NAME = "devicemanager-files";
const BUCKET_BOX = "sandbox";
const BUCKET_API_PATH = "/api/v/4/bucket_sets/{systemKey}/{bucketSetName}/file/create";

async function uploadSoftware(fileSpec: FileSpec) {
  const authInfo = getAuthInfo();
  const platformInfo = getPlatformInfo();

  // Upload file to bucket
  const uriPath = BUCKET_API_PATH
    .replace("{systemKey}", authInfo.systemKey)
    .replace("{bucketSetName}", BUCKET_NAME);

  const url = platformInfo.url + uriPath;

  const urlbody = {
    box: BUCKET_BOX,
    path: fileSpec.file_path + "/" + fileSpec.file_name,
    contents: fileSpec.contents
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ClearBlade-UserToken": authInfo.userToken,
    },
    body: JSON.stringify(urlbody)
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  // Create database record
  const collresponse = await fetch(`${platformInfo.url}/api/v/1/collection/${authInfo.systemKey}/device_software_versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClearBlade-UserToken': authInfo.userToken,
    },
    body: JSON.stringify([
      {
        "device_type": fileSpec.device_type,
        "name": fileSpec.software_name,
        "version": fileSpec.version,
        "file_name": fileSpec.file_name,
        "file_path": fileSpec.file_path,
        "upload_date": fileSpec.upload_date,
        "upload_user": fileSpec.upload_user
      }
    ])
  });

  if (!collresponse.ok) {
    throw new Error('Failed to create database record');
  }

  return collresponse.json();
}

export function useUploadSoftware() {
  return useMutation(uploadSoftware);
} 