import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const IA_COMPONENT_NAME = "daum";
const BUCKET_NAME = "devicemanager-files";
const BUCKET_BOX = "sandbox";
const BUCKET_API_PATH = "/api/v/4/bucket_sets/{systemKey}/{bucketSetName}/file/create";
const FILE_PATH = `components/${IA_COMPONENT_NAME}/firmware/{device_type}/{version}`;

interface DeviceType {
  id: string;
  label: string;
  device_type: string;
}

interface FileSpec {
  device_type: string;
  software_name: string;
  version: string;
  file_name: string;
  file_path: string;
  upload_date: string;
  upload_user: string;
  contents: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: '0 auto',
}));

// TODOs that need to be completed:
// Replace YOUR_SYSTEM_KEY with the actual system key
// Replace YOUR_API_URL with the actual API URL
// Replace YOUR_AUTH_TOKEN with the actual auth token mechanism
// Replace the mock device types data with actual API call
// Implement the actual database record creation in createFilesRowInDB
// Would you like me to help with implementing any of these TODOs or make any adjustments to the current implementation?


export default function UploadSoftware() {
  // Form state
  const [deviceType, setDeviceType] = useState('');
  const [softwareName, setSoftwareName] = useState('');
  const [version, setVersion] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Data state
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  // Load device types
  useEffect(() => {
    // TODO: Replace with actual API call
    setDeviceTypes([
      { id: '1', label: 'Temperature Sensor', device_type: 'temp_sensor' },
      { id: '2', label: 'Pressure Sensor', device_type: 'pressure_sensor' },
    ]);
  }, []);

  const validateDeviceType = () => {
    if (!deviceType) {
      setError(prev => ({
        ...prev,
        deviceType: 'Device type is required. You must select a device type to associate the upload with.'
      }));
      return false;
    }
    setError(prev => ({ ...prev, deviceType: '' }));
    return true;
  };

  const validateSoftwareName = () => {
    if (!softwareName) {
      setError(prev => ({
        ...prev,
        softwareName: 'Software name must be specified. The software name should be used to distinguish software/firmware packages.'
      }));
      return false;
    }
    setError(prev => ({ ...prev, softwareName: '' }));
    return true;
  };

  const validateVersion = () => {
    const semverRegEx = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-((?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    
    if (!version || !semverRegEx.test(version)) {
      setError(prev => ({
        ...prev,
        version: 'Invalid format. Version numbers should follow the semver format: xxx.yyy.zzz (1.0.147)'
      }));
      return false;
    }
    setError(prev => ({ ...prev, version: '' }));
    return true;
  };

  const validateFile = () => {
    if (!selectedFile) {
      setError(prev => ({
        ...prev,
        file: 'No file selected. You must select a file to upload.'
      }));
      return false;
    }
    setError(prev => ({ ...prev, file: '' }));
    return true;
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (evt) => {
        if (evt.target?.result && typeof evt.target.result === 'string') {
          const contents = evt.target.result.slice(evt.target.result.indexOf(',') + 1);
          resolve(contents);
        } else {
          reject(new Error("File contents not read correctly"));
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const createFileInBucket = async (fileSpec: FileSpec) => {
    const uriPath = BUCKET_API_PATH
      .replace("{systemKey}", "YOUR_SYSTEM_KEY") // TODO: Replace with actual system key
      .replace("{bucketSetName}", BUCKET_NAME);

    const url = "YOUR_API_URL" + uriPath; // TODO: Replace with actual API URL

    const urlbody = {
      box: BUCKET_BOX,
      path: fileSpec.file_path + "/" + fileSpec.file_name,
      contents: fileSpec.contents
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ClearBlade-UserToken": "YOUR_AUTH_TOKEN", // TODO: Replace with actual auth token
      },
      body: JSON.stringify(urlbody)
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  };

  const createFilesRowInDB = async (fileSpec: FileSpec) => {
    // TODO: Replace with actual API call
    console.log('Creating file record:', fileSpec);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleSubmit = async () => {
    setError({});
    setSuccess(false);

    const isValid = 
      validateDeviceType() &&
      validateSoftwareName() &&
      validateVersion() &&
      validateFile();

    if (!isValid || !selectedFile) return;

    setLoading(true);

    try {
      const fileSpec: FileSpec = {
        device_type: deviceType,
        software_name: softwareName,
        version: version,
        file_name: selectedFile.name,
        file_path: FILE_PATH
          .replace("{device_type}", deviceType)
          .replace("{version}", version),
        upload_date: new Date().toISOString(),
        upload_user: "current_user", // TODO: Replace with actual user
        contents: ""
      };

      // Read file contents
      fileSpec.contents = await readFile(selectedFile);

      // Upload file to bucket
      await createFileInBucket(fileSpec);

      // Create database record
      await createFilesRowInDB(fileSpec);

      // Reset form
      setDeviceType('');
      setSoftwareName('');
      setVersion('');
      setSelectedFile(null);
      setSuccess(true);
    } catch (err) {
      setError(prev => ({
        ...prev,
        submit: 'Failed to upload file. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPaper elevation={2}>
      <Typography variant="h6" gutterBottom>
        Upload Firmware/Software File
      </Typography>

      {error.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.submit}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          File uploaded successfully!
        </Alert>
      )}

      <FormControl fullWidth error={!!error.deviceType} sx={{ mb: 3 }}>
        <InputLabel>Device Type</InputLabel>
        <Select
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
          label="Device Type"
        >
          {deviceTypes.map(type => (
            <MenuItem key={type.id} value={type.device_type}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
        {error.deviceType && (
          <Typography color="error" variant="caption">
            {error.deviceType}
          </Typography>
        )}
      </FormControl>

      <TextField
        fullWidth
        label="Software Name"
        value={softwareName}
        onChange={(e) => setSoftwareName(e.target.value)}
        error={!!error.softwareName}
        helperText={error.softwareName}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        label="Version Number (semver format)"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        error={!!error.version}
        helperText={error.version}
        placeholder="e.g., 1.0.0"
        sx={{ mb: 3 }}
      />

      <Box sx={{ mb: 3 }}>
        <input
          accept=".bin,.hex,.fw"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            component="span"
            fullWidth
          >
            {selectedFile ? selectedFile.name : 'Choose File'}
          </Button>
        </label>
        {error.file && (
          <Typography color="error" variant="caption">
            {error.file}
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading}
        fullWidth
      >
        {loading ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
            Uploading...
          </>
        ) : (
          'Upload Software'
        )}
      </Button>
    </StyledPaper>
  );
} 