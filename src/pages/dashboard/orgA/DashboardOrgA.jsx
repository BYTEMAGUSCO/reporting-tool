import { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AssignmentIcon from '@mui/icons-material/Assignment';


import OverviewTab from './tabs/OverviewTab';
import FormBuilderTab from './tabs/FormBuilderTab';
import ManageFormsTab from './tabs/ManageFormsTab';
import GovLogoOnly from './../../reusables/GovLogoOnly';
import ViewAccountsTab from './tabs/ViewAccountsTab';

const drawerWidth = 260;

const tabs = [
  { label: 'Overview', icon: <DashboardIcon sx={{ color: 'black' }} />, component: <OverviewTab /> },
  { label: 'Account Management', icon: <PeopleIcon sx={{ color: 'black' }} />, component: <ViewAccountsTab /> },
  { label: 'Form Builder', icon: <FormatListBulletedIcon sx={{ color: 'black' }} />, component: <FormBuilderTab /> },
  { label: 'Form Manager', icon: <AssignmentIcon sx={{ color: 'black' }} />, component: <ManageFormsTab /> },
  { label: 'Settings', icon: <SettingsIcon sx={{ color: 'black' }} />, component: <Typography variant="body1">⚙️ Settings</Typography> },
];

const DashboardOrgA = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSession = sessionStorage.getItem('session');
    const storedIndex = sessionStorage.getItem('activeTab');

    if (!storedSession) {
      navigate('/login/LogInOrgA');
      return;
    }

    try {
      const parsed = JSON.parse(storedSession);
      const token = parsed?.access_token;

      if (!token) {
        navigate('/login/LogInOrgA');
      }
    } catch {
      navigate('/login/LogInOrgA');
    }

    if (storedIndex !== null) {
      setActiveTab(Number(storedIndex));
    }
  }, [navigate]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    sessionStorage.setItem('activeTab', index.toString());
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login/LogInOrgA');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            pt: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <GovLogoOnly logoWidth={250} logoHeight={85} />
        </Box>
        <List>
          {tabs.map((tab, index) => (
            <ListItem key={tab.label} disablePadding>
              <ListItemButton
                selected={activeTab === index}
                onClick={() => handleTabChange(index)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#facc15',
                    color: '#000000ff',
                    fontWeight: 'bold',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: '#fab115ff',
                  },
                  '&:hover': {
                    backgroundColor: '#fab115ff',
                  },
                }}
              >
                <ListItemIcon sx={{ color: activeTab === index ? '#000000ff' : 'inherit' }}>
                  {tab.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontSize="1rem">
                      {tab.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button onClick={handleLogout} fullWidth variant="outlined" size="small">
            Log Out
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
        {tabs[activeTab]?.component || (
          <Typography variant="body1">😵 Unknown Tab</Typography>
        )}
      </Box>
    </Box>
  );
};

export default DashboardOrgA;
