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
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';

import OverviewTab from './tabs/OverviewTab';
import ViewAccountsTab from './tabs/ViewAccountsTab';
import GovLogoOnly from './../../reusables/GovLogoOnly';
import FormTabs from './tabs/FormTabs';

const drawerWidth = 260;

const tabs = [
  { label: 'Overview', icon: <DashboardIcon />, component: <OverviewTab /> },
  { label: 'Account Management', icon: <PeopleIcon />, component: <ViewAccountsTab /> },
  { label: 'Form Management', icon: <AssignmentIcon />, component: <FormTabs /> },
  { label: 'Settings', icon: <SettingsIcon />, component: <Typography>Settings</Typography> },
];

const DashboardOrgA = () => {
  const theme = useTheme();
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
      const token = JSON.parse(storedSession)?.access_token;
      if (!token) navigate('/login/LogInOrgA');
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
    <Box sx={{ display: 'flex', height: '100vh', overflowX: 'hidden' }}>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            pt: 2,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <GovLogoOnly logoWidth={250} logoHeight={85} />
        </Box>

        <List sx={{ flexGrow: 1 }}>
          {tabs.map((tab, index) => (
            <ListItem key={tab.label} disablePadding sx={{ mx: 1.5, borderRadius: '0.5rem' }}>
              <ListItemButton
                selected={activeTab === index}
                onClick={() => handleTabChange(index)}
                sx={{
                  borderRadius: '0.5rem',
                  px: 2,
                  py: 1,
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f9c016ff', // 🍊 orange hover
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#f9e616ff', // keep it orange even when selected
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: theme.palette.text.primary,
                  }}
                >
                  {tab.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontSize="0.95rem"
                      sx={{
                        fontWeight: activeTab === index ? 600 : 500,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {tab.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2 }}>
     <Button
  onClick={handleLogout}
  fullWidth
  variant="contained"
  size="small"
  color="primary"
  startIcon={<LogoutIcon fontSize="small" />}
  sx={{
    textTransform: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    borderRadius: '0.5rem', // 👈 match the tab buttons
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
    '&:active': {
      transform: 'scale(0.97)',
    },
  }}
>
  Log Out
</Button>

        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
        {tabs[activeTab]?.component || (
          <Typography variant="body1">😵 Unknown Tab</Typography>
        )}
      </Box>
    </Box>
  );
};

export default DashboardOrgA;
