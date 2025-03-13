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
import { useAssetTypes } from '../api/useAssetTypes';
import { useUploadSoftware } from '../api/useUploadSoftware';
import { FileSpec } from '../types';
import { useSnackbar } from 'notistack'

const IA_COMPONENT_NAME = "daum";
const FILE_PATH = `components/${IA_COMPONENT_NAME}/firmware/{device_type}/{version}`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: '0 auto',
}));

const StyledMenuItem = styled(MenuItem)({
  '&.MuiMenuItem-root': {
    display: 'block',
    width: '100%',
    margin: 0,
    padding: '8px 16px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    '&:last-child': {
      borderBottom: 'none'
    }
  }
});

export default function UploadSoftware() {
  // Form state
  const [deviceType, setDeviceType] = useState('');
  const [softwareName, setSoftwareName] = useState('');
  const [version, setVersion] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Data state
  const { data: assetTypes = [], isLoading: isLoadingAssetTypes, error: assetTypesError } = useAssetTypes();
  const uploadSoftwareMutation = useUploadSoftware();
  
  // UI state
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Display hook errors in snackbars
  useEffect(() => {
    if (assetTypesError) {
      enqueueSnackbar('Failed to load device types. Please try again.', { variant: 'error' });
    }
  }, [assetTypesError, enqueueSnackbar]);

  useEffect(() => {
    if (uploadSoftwareMutation.error) {
      enqueueSnackbar('Failed to upload file. Please try again.', { variant: 'error' });
    }
  }, [uploadSoftwareMutation.error, enqueueSnackbar]);

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

  const handleSubmit = async () => {
    setError({});
    setSuccess(false);

    const isValid = 
      validateDeviceType() &&
      validateSoftwareName() &&
      validateVersion() &&
      validateFile();

    if (!isValid || !selectedFile) return;

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
        upload_user: "system", // Using system as the user since we don't have user info
        contents: ""
      };

      // Read file contents
      fileSpec.contents = await readFile(selectedFile);

      // Upload file and create database record
      await uploadSoftwareMutation.mutateAsync(fileSpec);

      // Reset form
      setDeviceType('');
      setSoftwareName('');
      setVersion('');
      setSelectedFile(null);
      setSuccess(true);
      enqueueSnackbar('File uploaded successfully!', { variant: 'success' });
    } catch (err) {
      setError(prev => ({
        ...prev,
        submit: 'Failed to upload file. Please try again.'
      }));
      enqueueSnackbar('Failed to upload file. Please try again.', { variant: 'error' });
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

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Device Type</InputLabel>
        <Select
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
          label="Device Type"
          disabled={isLoadingAssetTypes}
          error={!!error.deviceType}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300
              }
            }
          }}
        >
          {isLoadingAssetTypes ? (
            <MenuItem disabled>Loading device types...</MenuItem>
          ) : (
            assetTypes.map(type => (
              <StyledMenuItem key={type.id} value={type.device_type} divider>
                {type.label || type.device_type}
              </StyledMenuItem>
            ))
          )}
        </Select>
        {error.deviceType && (
          <Typography color="error" variant="caption">
            {error.deviceType}
          </Typography>
        )}
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Software Name"
          value={softwareName}
          onChange={(e) => setSoftwareName(e.target.value)}
          error={!!error.softwareName}
          helperText={error.softwareName}
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
          label="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          error={!!error.version}
          helperText={error.version}
          placeholder="1.0.0"
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
          id="software-file-input"
        />
        <label htmlFor="software-file-input">
          <Button
            variant="contained"
            component="span"
            fullWidth
            color={error.file ? 'error' : 'primary'}
            sx={{
              backgroundColor: 'transparent',
              border: '1px solid',
              borderColor: error.file ? 'error.main' : 'primary.main',
              color: error.file ? 'error.main' : 'primary.main',
              '&:hover': {
                backgroundColor: 'transparent',
                borderColor: error.file ? 'error.dark' : 'primary.dark',
                color: error.file ? 'error.dark' : 'primary.dark',
              }
            }}
          >
            {selectedFile ? selectedFile.name : 'Select File'}
          </Button>
        </label>
        {error.file && (
          <Typography color="error" variant="caption">
            {error.file}
          </Typography>
        )}
      </FormControl>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={uploadSoftwareMutation.isLoading}
        fullWidth
      >
        {uploadSoftwareMutation.isLoading ? (
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