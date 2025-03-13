import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[50],
}));

interface DeviceType {
  id: string;
  label: string;
  device_type: string;
}

interface Software {
  id: string;
  name: string;
  version: string;
  filename: string;
}

interface Device {
  id: string;
  label: string;
  type: string;
}

interface Installation {
  asset_id: string;
  installation_date: string;
  user_id: string;
  version: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
}

// TODOs that need to be completed:
// The component is now ready to be integrated with your backend APIs. You'll need to:
// Replace the mock data in the useEffect with actual API calls
// Implement the actual update submission in handleSubmit
// Add any additional error handling specific to your backend
// Add any specific business logic required for your use case
// Would you like me to help with any of these integrations or make any adjustments to the current implementation?

export default function UpdateSoftware() {
  // State for form fields
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedSoftware, setSelectedSoftware] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [installDate, setInstallDate] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  
  // State for data
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [scheduledInstalls, setScheduledInstalls] = useState<Installation[]>([]);
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data loading - replace with actual API calls
  useEffect(() => {
    // Load device types
    setDeviceTypes([
      { id: '1', label: 'Temperature Sensor', device_type: 'temp_sensor' },
      { id: '2', label: 'Pressure Sensor', device_type: 'pressure_sensor' },
    ]);

    // Load software
    setSoftware([
      { id: '1', name: 'Firmware', version: '2.1.0', filename: 'firmware_2.1.0.bin' },
      { id: '2', name: 'Firmware', version: '2.0.0', filename: 'firmware_2.0.0.bin' },
    ]);

    // Load devices
    setDevices([
      { id: '1', label: 'Sensor 001', type: 'temp_sensor' },
      { id: '2', label: 'Sensor 002', type: 'pressure_sensor' },
    ]);

    // Load installations
    setInstallations([
      {
        asset_id: '1',
        installation_date: '2024-03-01',
        user_id: 'admin',
        version: '2.0.0',
        status: 'completed'
      },
    ]);

    // Load scheduled installations
    setScheduledInstalls([
      {
        asset_id: '2',
        installation_date: '2024-03-20',
        user_id: 'admin',
        version: '2.1.0',
        status: 'pending',
        description: 'Scheduled update'
      },
    ]);
  }, []);

  const handleDeviceTypeChange = (event: any) => {
    setSelectedDeviceType(event.target.value);
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
        ? devices.filter(d => d.type === selectedDeviceType).map(d => d.id)
        : []
    );
  };

  const handleSubmit = async () => {
    if (!selectedDeviceType || !selectedSoftware || !selectedVersion || !installDate || selectedDevices.length === 0) {
      setError('Please fill in all required fields and select at least one device.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual update submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success - in real implementation, this would be handled by the backend
      const newScheduledInstalls = selectedDevices.map(deviceId => ({
        asset_id: deviceId,
        installation_date: installDate,
        user_id: 'current_user',
        version: selectedVersion,
        status: 'pending' as const,
        description: 'Update scheduled'
      }));

      setScheduledInstalls(prev => [...prev, ...newScheduledInstalls]);
      
      // Reset form
      setSelectedDevices([]);
      setInstallDate('');
    } catch (error) {
      setError('Failed to schedule updates. Please try again.');
    } finally {
      setLoading(false);
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
            >
              {deviceTypes.map(type => (
                <MenuItem key={type.id} value={type.device_type}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Software</InputLabel>
            <Select
              value={selectedSoftware}
              onChange={handleSoftwareChange}
              label="Software"
            >
              {[...new Set(software.map(s => s.name))].map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Version</InputLabel>
            <Select
              value={selectedVersion}
              onChange={handleVersionChange}
              label="Version"
            >
              {software
                .filter(s => s.name === selectedSoftware)
                .map(s => (
                  <MenuItem key={s.version} value={s.version}>
                    {s.version}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Installation Date/Time"
            type="datetime-local"
            value={installDate}
            onChange={(e) => setInstallDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          {selectedDeviceType && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Devices
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedDevices.length === devices.filter(d => d.type === selectedDeviceType).length}
                    onChange={handleSelectAllDevices}
                  />
                }
                label="Select All"
              />

              <FormGroup>
                {devices
                  .filter(device => device.type === selectedDeviceType)
                  .map(device => (
                    <FormControlLabel
                      key={device.id}
                      control={
                        <Checkbox
                          checked={selectedDevices.includes(device.id)}
                          onChange={() => handleDeviceSelection(device.id)}
                        />
                      }
                      label={device.label}
                    />
                  ))}
              </FormGroup>
            </Paper>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            fullWidth
          >
            {loading ? (
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
        {/* Currently Installed Versions */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Currently Installed Versions
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Device</StyledTableCell>
                  <StyledTableCell>Install Date</StyledTableCell>
                  <StyledTableCell>User</StyledTableCell>
                  <StyledTableCell>Version</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {installations.map((install, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {devices.find(d => d.id === install.asset_id)?.label}
                    </TableCell>
                    <TableCell>{new Date(install.installation_date).toLocaleString()}</TableCell>
                    <TableCell>{install.user_id}</TableCell>
                    <TableCell>{install.version}</TableCell>
                  </TableRow>
                ))}
                {installations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No installations found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Scheduled Updates */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scheduled Updates
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Device</StyledTableCell>
                  <StyledTableCell>Scheduled For</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Description</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduledInstalls.map((install, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {devices.find(d => d.id === install.asset_id)?.label}
                    </TableCell>
                    <TableCell>{new Date(install.installation_date).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={install.status.toUpperCase()}
                        color={
                          install.status === 'completed' ? 'success' :
                          install.status === 'failed' ? 'error' : 'primary'
                        }
                      />
                    </TableCell>
                    <TableCell>{install.description}</TableCell>
                  </TableRow>
                ))}
                {scheduledInstalls.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No scheduled updates
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
} 