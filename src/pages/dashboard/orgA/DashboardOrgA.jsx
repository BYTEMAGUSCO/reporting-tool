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
  Snackbar,
  Alert,
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

import ViewReportsTab from './tabs/ViewReportsTab';
import DescriptionIcon from '@mui/icons-material/Description'; // for reports icon

import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsTab from './tabs/NotificationsTab';

import {
  signOutUser,
  setupTabCloseLogout,
  getStoredToken,
} from '@/services/SessionManager';

import useNotificationAlerts from '@/services/useNotificationsAlerts';

const drawerWidth = 260;

import ChartsTab from './tabs/ChartsTab';

const tabs = [
  { label: 'Overview', icon: <DashboardIcon />, component: <OverviewTab /> },
  { label: 'Account Management', icon: <PeopleIcon />, component: <ViewAccountsTab /> },
  { label: 'Form Management', icon: <AssignmentIcon />, component: <FormTabs /> },
  { label: 'Report Management', icon: <DescriptionIcon />, component: <ViewReportsTab /> },
  { label: 'Notifications', icon: <NotificationsActiveIcon />, component: <NotificationsTab /> },
  { label: 'Charts', icon: <DashboardIcon />, component: <ChartsTab /> }, // 🆕 Empty charts tab
  { label: 'Settings', icon: <SettingsIcon />, component: <Typography>Settings</Typography> },
];


const DashboardOrgA = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // 🔥 Use your notification alert hook for snackbars
  const { snackbarOpen, snackbarMessage, closeSnackbar } = useNotificationAlerts();

  // 💀 Sign out on tab close
  useEffect(() => {
    const cleanup = setupTabCloseLogout();
    return cleanup;
  }, []);

  // 🚪 Startup check
  useEffect(() => {
    const storedSession = sessionStorage.getItem('session');
    const storedIndex = sessionStorage.getItem('activeTab');

    if (!storedSession) {
      navigate('/login/LogInOrgA');
      return;
    }

    try {
      const token = getStoredToken();
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOutUser(navigate);
    setIsLoggingOut(false);
  };

  return (
    <>
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
              <ListItem
                key={tab.label}
                disablePadding
                sx={{ mx: 1.5, borderRadius: '0.5rem' }}
              >
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

        <Box component="main" sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
          {tabs[activeTab]?.component || (
            <Typography variant="body1">😵 Unknown Tab</Typography>
          )}
        </Box>
      </Box>

      {/* Snackbar alert for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DashboardOrgA;
