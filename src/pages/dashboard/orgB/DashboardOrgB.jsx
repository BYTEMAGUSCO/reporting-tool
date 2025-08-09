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
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import GovLogoOnly from './../../reusables/GovLogoOnly';
import CreateReportTab from './tabs/CreateReportTab';

import {
  signOutUser,
  setupSessionPing,
  setupTabCloseLogout,
  getStoredToken,
} from '@/services/SessionManager';

import OverviewTab from './tabs/OverviewTab';
// Example: Client form filling & history
// import AvailableFormsTab from './tabs/AvailableFormsTab';
// import MySubmissionsTab from './tabs/MySubmissionsTab';

const drawerWidth = 260;

const tabs = [
  { label: 'Overview', icon: <DashboardIcon />, component: <OverviewTab /> },
  { label: 'Create Report', icon: <AssignmentIcon />, component: <CreateReportTab /> },
];

const DashboardOrgB = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // 🔁 Session ping every 5 minutes
  useEffect(() => {
    const interval = setupSessionPing(navigate);
    return () => clearInterval(interval);
  }, [navigate]);

  // 💀 Auto logout on tab/browser close
  useEffect(() => {
    const cleanup = setupTabCloseLogout();
    return cleanup;
  }, []);

  // 🛡️ Initial auth + restore last tab
  useEffect(() => {
    const storedSession = sessionStorage.getItem('session');
    const storedIndex = sessionStorage.getItem('activeTabOrgB');

    if (!storedSession) {
      navigate('/login/LogInOrgB');
      return;
    }

    try {
      const token = getStoredToken();
      if (!token) navigate('/login/LogInOrgB');
    } catch {
      navigate('/login/LogInOrgB');
    }

    if (storedIndex !== null) {
      setActiveTab(Number(storedIndex));
    }
  }, [navigate]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    sessionStorage.setItem('activeTabOrgB', index.toString());
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOutUser(navigate);
    setIsLoggingOut(false);
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
        {/* Logo */}
        <Box sx={{ px: 2, py: 1 }}>
          <GovLogoOnly logoWidth={250} logoHeight={85} />
        </Box>

        {/* Sidebar Tabs */}
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
                    backgroundColor: '#f9c016ff',
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#f9e616ff',
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

        {/* Logout Button */}
        <Box sx={{ p: 2 }}>
          <Button
            onClick={handleLogout}
            fullWidth
            variant="contained"
            size="small"
            color="primary"
            startIcon={
              isLoggingOut ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <LogoutIcon fontSize="small" />
              )
            }
            disabled={isLoggingOut}
            sx={{
              textTransform: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '0.5rem',
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
              '&:active': {
                transform: 'scale(0.97)',
              },
            }}
          >
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
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

export default DashboardOrgB;
