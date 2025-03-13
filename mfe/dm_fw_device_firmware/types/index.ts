export interface DeviceType {
  id?: string;
  type: string;
  label?: string;
  device_type: string;
}

export interface Asset {
  id: string;
  type: string;
  label: string;
}

export interface Software {
  id: string;
  name: string;
  version: string;
  filename: string;
}

export interface Installation {
  id: string;
  label?: string;
  install_request_date: string;
  installation_date: string;
  user_id: string;
  asset_id: string;
  software_descriptor: string;
  version: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface ScheduleUpdateParams {
  deviceIds: string[];
  version: string;
  installDate: string;
  softwareName: string;
}

export interface SoftwareVersion {
  device_type: string;
  name: string;
  version: string;
  file_name: string;
  file_path: string;
}

export interface FileSpec {
  device_type: string;
  software_name: string;
  version: string;
  file_name: string;
  file_path: string;
  upload_date: string;
  upload_user: string;
  contents: string;
} 