import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAssets } from '../api/useAssets';
import { useAssetTypes } from '../api/useAssetTypes';
import { useSoftwareVersions } from '../api/useSoftwareVersions';
import { useSoftwareNames } from '../api/useSoftwareNames';
import { useInstallations } from '../api/useInstallations';
import { useScheduledUpdates } from '../api/useScheduledUpdates';
import { useScheduleUpdate } from '../api/useScheduleUpdate';
import { InstalledVersionsTable } from './InstalledVersionsTable';
import { ScheduledUpdatesTable } from './ScheduledUpdatesTable';
import { useSnackbar } from 'notistack';

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

export default function UpdateSoftware() {
  // State for form fields
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedSoftware, setSelectedSoftware] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [installDate, setInstallDate] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  
  // Fetch data using our custom hooks
  const { data: assets = [], isLoading: isLoadingAssets, error: assetsError } = useAssets(selectedAssetType);
  const { data: assetTypes = [], isLoading: isLoadingAssetTypes, error: assetTypesError } = useAssetTypes();
  const { data: softwareNames = [], isLoading: isLoadingSoftwareNames, error: softwareNamesError } = useSoftwareNames(selectedDeviceType);
  const { data: softwareVersions = [], isLoading: isLoadingSoftware, error: softwareError } = useSoftwareVersions(selectedDeviceType, selectedSoftware);
  const { data: installations = [], isLoading: isLoadingInstallations, error: installationsError } = useInstallations({
    enabled: !!selectedDeviceType && !!selectedSoftware,
    assetType: selectedAssetType,
    softwareName: selectedSoftware
  });
  const { data: scheduledUpdates = [], isLoading: isLoadingScheduled, error: scheduledError } = useScheduledUpdates({
    enabled: !!selectedDeviceType && !!selectedSoftware,
    assetType: selectedAssetType,
    softwareName: selectedSoftware
  });
  const scheduleUpdateMutation = useScheduleUpdate();
  
  // State for UI
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Display hook errors in snackbars
  useEffect(() => {
    if (assetsError) {
      enqueueSnackbar('Failed to load assets. Please try again.', { variant: 'error' });
    }
  }, [assetsError, enqueueSnackbar]);

  useEffect(() => {
    if (assetTypesError) {
      enqueueSnackbar('Failed to load device types. Please try again.', { variant: 'error' });
    }
  }, [assetTypesError, enqueueSnackbar]);

  useEffect(() => {
    if (softwareNamesError) {
      enqueueSnackbar('Failed to load software names. Please try again.', { variant: 'error' });
    }
  }, [softwareNamesError, enqueueSnackbar]);

  useEffect(() => {
    if (softwareError) {
      enqueueSnackbar('Failed to load software versions. Please try again.', { variant: 'error' });
    }
  }, [softwareError, enqueueSnackbar]);

  useEffect(() => {
    if (installationsError) {
      enqueueSnackbar('Failed to load installations. Please try again.', { variant: 'error' });
    }
  }, [installationsError, enqueueSnackbar]);

  useEffect(() => {
    if (scheduledError) {
      enqueueSnackbar('Failed to load scheduled updates. Please try again.', { variant: 'error' });
    }
  }, [scheduledError, enqueueSnackbar]);

  useEffect(() => {
    if (scheduleUpdateMutation.error) {
      enqueueSnackbar('Failed to schedule updates. Please try again.', { variant: 'error' });
    }
  }, [scheduleUpdateMutation.error, enqueueSnackbar]);

  // Reset software and version selections when device type changes
  useEffect(() => {
    setSelectedSoftware('');
    setSelectedVersion('');
  }, [selectedDeviceType]);

  // Reset version selection when software changes
  useEffect(() => {
    setSelectedVersion('');
  }, [selectedSoftware]);

  const handleDeviceTypeChange = (event: any) => {
    setSelectedDeviceType(event.target.value);
    setSelectedAssetType(assetTypes.find(assetType => assetType.device_type === event.target.value)?.id || '');
    setSelectedDevices([]);
  };

  const handleSoftwareChange = (event: any) => {
    setSelectedSoftware(event.target.value);
  };

  const handleVersionChange = (event: any) => {
    setSelectedVersion(event.target.value);
  };

  const handleDeviceSelection = (deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSelectAllDevices = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDevices(
      event.target.checked
        ? assetTypes
            .filter(d => d.device_type === selectedDeviceType)
            .map(d => d.id || '')
            .filter(Boolean)
        : []
    );
  };

  const handleSubmit = async () => {
    if (!selectedDeviceType || !selectedSoftware || !selectedVersion || !installDate || selectedDevices.length === 0) {
      const errorMessage = 'Please fill in all required fields and select at least one device.';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return;
    }

    setError(null);

    try {
      await scheduleUpdateMutation.mutateAsync({
        deviceIds: selectedDevices,
        version: selectedVersion,
        installDate,
        softwareName: selectedSoftware,
      });
      
      // Reset form
      setSelectedDevices([]);
      setInstallDate('');
      enqueueSnackbar('Updates scheduled successfully!', { variant: 'success' });
    } catch (error) {
      const errorMessage = 'Failed to schedule updates. Please try again.';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Left Column - Update Form */}
      <Box sx={{ flex: 1 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Schedule Software Update
          </Typography>

          {(assetTypesError || softwareNamesError || softwareError || installationsError || scheduledError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {assetTypesError?.message || softwareNamesError?.message || softwareError?.message || 
               installationsError?.message || scheduledError?.message || 'Failed to load data. Please try again later.'}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Device Type</InputLabel>
            <Select
              value={selectedDeviceType}
              onChange={handleDeviceTypeChange}
              label="Device Type"
              disabled={isLoadingAssetTypes}
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
                    {type.label || type.id}
                  </StyledMenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Software</InputLabel>
            <Select
              value={selectedSoftware}
              onChange={handleSoftwareChange}
              label="Software"
              disabled={isLoadingSoftwareNames || !selectedDeviceType}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300
                  }
                }
              }}
            >
              {isLoadingSoftwareNames ? (
                <MenuItem disabled>Loading software names...</MenuItem>
              ) : (
                softwareNames.map(sw => (
                  <StyledMenuItem key={sw.name} value={sw.name} divider>
                    {sw.name}
                  </StyledMenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Version</InputLabel>
            <Select
              value={selectedVersion}
              onChange={handleVersionChange}
              label="Version"
              disabled={isLoadingSoftware || !selectedSoftware}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300
                  }
                }
              }}
            >
              {isLoadingSoftware ? (
                <MenuItem disabled>Loading versions...</MenuItem>
              ) : (
                softwareVersions.map(s => (
                  <StyledMenuItem key={s.version} value={s.version} divider>
                    {s.version}
                  </StyledMenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Installation Date/Time"
            type="datetime-local"
            value={installDate}
            onChange={(e) => setInstallDate(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />

          {selectedDeviceType && assets.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Devices
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      selectedDevices.length === 
                      assets.filter(d => d.type === selectedAssetType).length
                    }
                    onChange={handleSelectAllDevices}
                  />
                }
                label="Select All"
              />

              <FormGroup>
                {assets
                  .filter(asset => asset.type === selectedAssetType)
                  .map(asset => (
                    <FormControlLabel
                      key={asset.id}
                      control={
                        <Checkbox
                          checked={selectedDevices.includes(asset.id || '')}
                          onChange={() => handleDeviceSelection(asset.id || '')}
                        />
                      }
                      label={asset.label || asset.id}
                    />
                  ))}
              </FormGroup>
            </Paper>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={scheduleUpdateMutation.isLoading}
            fullWidth
          >
            {scheduleUpdateMutation.isLoading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Scheduling Updates...
              </>
            ) : (
              'Schedule Updates'
            )}
          </Button>
        </Paper>
      </Box>

      {/* Right Column - Current Status */}
      <Box sx={{ flex: 1 }}>
        {isLoadingInstallations || isLoadingScheduled ? (
          <CircularProgress />
        ) : (
          <>
            <InstalledVersionsTable 
              installations={installations}
              assets={assets}
            />
            <ScheduledUpdatesTable
              scheduledInstalls={scheduledUpdates}
              assets={assets}
            />
          </>
        )}
      </Box>
    </Box>
  );
} 