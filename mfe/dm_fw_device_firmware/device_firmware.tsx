import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadSoftware from './components/UploadSoftware';
import UpdateSoftware from './components/UpdateSoftware';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`firmware-tabpanel-${index}`}
      aria-labelledby={`firmware-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StyledTabs = styled(Tabs)({
  borderBottom: '1px solid #e8e8e8',
  '& .MuiTabs-indicator': {
    backgroundColor: '#1890ff',
  },
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '16px',
  marginRight: '32px',
  '&.Mui-selected': {
    color: '#1890ff',
  },
});

export default function DeviceFirmware() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabs 
          value={selectedTab} 
          onChange={handleTabChange}
          aria-label="device firmware tabs"
        >
          <StyledTab label="Upload Software" />
          <StyledTab label="Update Software" />
        </StyledTabs>
      </Box>
      
      <TabPanel value={selectedTab} index={0}>
        <UploadSoftware />
      </TabPanel>
      
      <TabPanel value={selectedTab} index={1}>
        <UpdateSoftware />
      </TabPanel>
    </Box>
  );
}
