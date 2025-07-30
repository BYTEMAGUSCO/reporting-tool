import { useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Stack,
} from '@mui/material';

import GroupIcon from '@mui/icons-material/Group';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import ApprovedAccountsTab from './accountabcomponents/ApprovedAccountsTab';
import RejectedAccountsTab from './accountabcomponents/RejectedAccountsTab';
import PendingAccountsTab from './accountabcomponents/PendingAccountsTab';

const ViewAccountsTab = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <GroupIcon color="black" />
        <Typography variant="h6">Account Management</Typography>
      </Stack>

      <Paper elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<HourglassEmptyIcon />} iconPosition="start" label="Pending" />
          <Tab icon={<CancelIcon />} iconPosition="start" label="Rejected" />
          <Tab icon={<CheckCircleIcon />} iconPosition="start" label="Approved" />
        </Tabs>
      </Paper>

      {selectedTab === 0 && <PendingAccountsTab />}
      {selectedTab === 1 && <RejectedAccountsTab />}
      {selectedTab === 2 && <ApprovedAccountsTab />}
    </Box>
  );
};

export default ViewAccountsTab;
