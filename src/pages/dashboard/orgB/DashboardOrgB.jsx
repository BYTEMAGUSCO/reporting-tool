import { useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import FormBuilderTab from '../orgA/tabs/FormBuilderTab';

const DashboardOrgB = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = () => {
    alert('Logged out! (but not really)');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="dashboard-root">
      <AppBar position="static">
        <Toolbar className="dashboard-toolbar">
          <Typography variant="h6">Org B Dashboard</Typography>
          <Button className="logout-btn" color="inherit" onClick={handleLogout}>
            Log Out
          </Button>
        </Toolbar>
      </AppBar>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        className="dashboard-tabs"
        variant="fullWidth"
      >
        <Tab label="📝 Form Builder" />
      </Tabs>

      <Box className="dashboard-content">
        {activeTab === 0 && <FormBuilderTab />}
      </Box>
    </Box>
  );
};

export default DashboardOrgB;
