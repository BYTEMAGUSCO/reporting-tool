import { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  Snackbar,
  Alert,
  Badge,
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
import DescriptionIcon from '@mui/icons-material/Description';

import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsTab from './tabs/NotificationsTab';

import EventIcon from '@mui/icons-material/Event';
import EventsTab from './tabs/EventsTab';
import ChartsTab from './tabs/ChartsTab';

import {
  signOutUser,
  setupTabCloseLogout,
  getStoredToken,
} from '@/services/SessionManager';

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const drawerWidth = 260;

const DashboardOrgA = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Notifications & unread count state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Snackbar states for new notif popups
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Session info
  const storedSession = sessionStorage.getItem('session');
  const parsedSession = storedSession ? JSON.parse(storedSession) : null;
  const token =
    parsedSession?.access_token || parsedSession?.[0]?.access_token || null;

  const userRole =
    parsedSession?.user?.user_metadata?.role ||
    parsedSession?.[0]?.identity_data?.role;
  const userId =
    parsedSession?.user?.id || parsedSession?.[0]?.user_id || null;

  // Fetch notifications function
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const url =
        userRole === 'B' && userId
          ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications/${userId}`
          : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(await res.text());
      const { data } = await res.json();
      setNotifications(data || []);
      setUnreadCount(data.filter((n) => !n.is_viewed).length);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [token]);
useEffect(() => {
  if (!token) return;

  const channel = supabase
    .channel('realtime:notifications')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      () => {
        fetchNotifications(); // Reload all notifications fresh every time anything changes
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('🔥 Supabase realtime listener started successfully!');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [token, userRole, userId]);

  // Snackbar close handler
  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Tabs with unread count badge on Notifications label
  const tabs = [
    { label: 'Overview', icon: <DashboardIcon />, component: <OverviewTab /> },
    { label: 'Account Management', icon: <PeopleIcon />, component: <ViewAccountsTab /> },
    { label: 'Form Management', icon: <AssignmentIcon />, component: <FormTabs /> },
    { label: 'Report Management', icon: <DescriptionIcon />, component: <ViewReportsTab /> },
    {
      label: 'Notifications',
      icon: <NotificationsActiveIcon />,
      component: (
        <NotificationsTab
          notifications={notifications}
          setNotifications={setNotifications}
        />
      ),
    },
    { label: 'Charts', icon: <DashboardIcon />, component: <ChartsTab /> },
    { label: 'Events', icon: <EventIcon />, component: <EventsTab /> },
    { label: 'Settings', icon: <SettingsIcon />, component: <Typography>Settings</Typography> },
  ];

  const handleTabChange = (index) => {
    setActiveTab(index);
    sessionStorage.setItem('activeTab', index.toString());
  };

  // Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOutUser(navigate);
    setIsLoggingOut(false);
  };

  // Startup/session checks you already got, just keep your logic here...

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
                key={index}
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
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListItemIcon
                      sx={{ minWidth: 36, color: theme.palette.text.primary }}
                    >
                      {tab.icon}
                    </ListItemIcon>
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
                  </Box>

                  {/* Show badge only on Notifications tab */}
                  {tab.label === 'Notifications' && unreadCount > 0 && (
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18,
                          marginRight:'20px'
                        },
                      }}
                    />
                  )}
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

      {/* Snackbar for new notifications */}
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
