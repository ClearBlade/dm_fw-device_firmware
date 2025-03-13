import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import UploadSoftware from './components/UploadSoftware';
import UpdateSoftware from './components/UpdateSoftware';
import { TabPanel } from './components/TabPanel';

const StyledTabs = styled(Tabs)({
  borderBottom: '1px solid #e8e8e8',
  '& .MuiTabs-indicator': {
    backgroundColor: '#1890ff',
  },
  '& .MuiTabs-flexContainer': {
    gap: '32px',
    padding: '0 16px',
  },
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '16px',
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
