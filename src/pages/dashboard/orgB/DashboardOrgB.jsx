import { useState, useEffect, useRef } from 'react';
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
  Badge,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons (all black)
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';

import GovLogoOnly from './../../reusables/GovLogoOnly';

import {
  signOutUser,
  setupTabCloseLogout,
  getStoredToken,
} from '@/services/SessionManager';

import { createClient } from '@supabase/supabase-js';

import OverviewTab from './tabs/OverviewTab';
import ViewReportsTabFilteredByBarangay from './tabs/ViewReportsTab';
import CreateReportTab from './tabs/CreateReportTab/index';

// Notifications tab from orgA
import NotificationsTab from '../orgA/tabs/NotificationsTab';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const drawerWidth = 260;

const DashboardOrgB = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Notifications related states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const prevNotificationsRef = useRef([]);

  // Session and user info
  const storedSession = sessionStorage.getItem('session');
  const parsedSession = storedSession ? JSON.parse(storedSession) : null;
  const token = parsedSession?.access_token || parsedSession?.[0]?.access_token || null;
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

  // Fetch notifications on mount or token change
  useEffect(() => {
    fetchNotifications();
  }, [token]);

  // Realtime listener for notifications
  useEffect(() => {
    if (!token) return;

    const channel = supabase
      .channel('realtime:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
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

  // Detect new unread notifications and show snackbar popup
  useEffect(() => {
    if (!notifications.length) return;

    const prevNotifications = prevNotificationsRef.current;

    const newNotifs = notifications.filter(
      (n) => !n.is_viewed && !prevNotifications.some((prev) => prev.id === n.id)
    );

    if (newNotifs.length > 0) {
      setSnackbarMessage(newNotifs[0].title);
      setSnackbarOpen(true);
      setUnreadCount(notifications.filter((n) => !n.is_viewed).length);
    }

    prevNotificationsRef.current = notifications;
  }, [notifications]);

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const cleanup = setupTabCloseLogout();
    return cleanup;
  }, []);

  useEffect(() => {
    const storedSession = sessionStorage.getItem('session');
    const storedIndex = sessionStorage.getItem('activeTab');

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
    sessionStorage.setItem('activeTab', index.toString());
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOutUser(navigate);
    setIsLoggingOut(false);
  };

  // Tabs with unread badge on Notifications label
  const tabs = [
    {
      label: 'Overview',
      icon: <DashboardIcon sx={{ color: 'black' }} />,
      component: <OverviewTab />,
    },
    {
      label: 'Reports',
      icon: <AssignmentIcon sx={{ color: 'black' }} />,
      component: <ViewReportsTabFilteredByBarangay />,
    },
    {
      label: 'Create Report',
      icon: <PeopleIcon sx={{ color: 'black' }} />,
      component: <CreateReportTab />,
    },
    {
      label: (
        <>
          Notifications{' '}
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error" sx={{ ml: 9 }} />
          )}
        </>
      ),
      icon: <NotificationsIcon sx={{ color: 'black' }} />,
      component: (
        <NotificationsTab
          notifications={notifications}
          setNotifications={setNotifications}
        />
      ),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon sx={{ color: 'black' }} />,
      component: <Typography sx={{ p: 2 }}>Settings coming soon...</Typography>,
    },
  ];

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
                      color: activeTab === index ? theme.palette.text.primary : 'black',
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
                          color: activeTab === index ? theme.palette.text.primary : 'black',
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
                  <LogoutIcon sx={{ color: 'black' }} fontSize="small" />
                )
              }
              disabled={isLoggingOut}
              sx={{
                textTransform: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
                color: 'black',
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 320,
            maxWidth: 400,
            borderRadius: '0.5rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            mt: 2,
          },
        }}
      >
        <Alert
          onClose={closeSnackbar}
          severity="info"
          icon={
            <NotificationsActiveRoundedIcon
              sx={{ fontSize: 28, mr: 1, color: '#fbbf24' }}
            />
          }
          sx={{
            width: '100%',
            fontWeight: 700,
            fontSize: '1.1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#e0f2fe',
            color: '#000000ff',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DashboardOrgB;
