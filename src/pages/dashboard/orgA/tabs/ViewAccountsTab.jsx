import { useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
} from '@mui/material';

import ApprovedAccountsTab from './ApprovedAccountsTab';
import RejectedAccountsTab from './RejectedAccountsTab';
import PendingAccountsTab from './PendingAccountsTab';

const ViewAccountsTab = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        👥 All Accounts
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Pending" />
        <Tab label="Rejected" />
        <Tab label="Approved" />
      </Tabs>

      <Divider sx={{ mb: 2 }} />

      {selectedTab === 0 && <PendingAccountsTab />}
      {selectedTab === 1 && <RejectedAccountsTab />}
      {selectedTab === 2 && <ApprovedAccountsTab />}
    </Box>
  );
};

export default ViewAccountsTab;
