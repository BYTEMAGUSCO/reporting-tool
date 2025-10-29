import { useState, useEffect, useRef, useMemo } from 'react';
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
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';

import GovLogoOnly from './../../reusables/GovLogoOnly';

import ELibraryTab from '../orgA/tabs/ELibraryTab';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

import EventListTab from './tabs/EventListTab';
import EventNoteIcon from '@mui/icons-material/EventNote';

import OverviewTab from './tabs/OverviewTab';
import ViewReportsTabFilteredByBarangay from './tabs/ViewReportsTab';
import CreateReportTab from './tabs/CreateReportTab/index';
import NotificationsTab from '../orgA/tabs/NotificationsTab';

import { createClient } from '@supabase/supabase-js';
import { signOutUser, setupTabCloseLogout, getStoredToken } from '@/services/SessionManager';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const drawerWidth = 260;

// Role-based theme function
const getRoleTheme = (role) => {
  const base = {
    background: { default: '#fefdfb', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#475569' },
    divider: '#e2e8f0',
  };

  switch (role) {
    case 'S': // Super Admin → yellow
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#facc15', light: '#fde68a', dark: '#b45309', contrastText: '#000' },
          secondary: { main: '#2563eb', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(90deg, #facc15, #fde68a)',
      });
    case 'D': // DILG → green
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#059669', light: '#34d399', dark: '#047857', contrastText: '#fff' },
          secondary: { main: '#06b6d4', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(90deg, #059669, #34d399)',
      });
    case 'B': // Barangay → blue
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8', contrastText: '#fff' },
          secondary: { main: '#f59e0b', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(90deg, #2563eb, #3b82f6)',
      });
    default:
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#64748b', light: '#94a3b8', dark: '#334155', contrastText: '#fff' },
          secondary: { main: '#475569', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(90deg, #64748b, #94a3b8)',
      });
  }
};

const DashboardOrgB = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const prevNotificationsRef = useRef([]);

  const storedSession = sessionStorage.getItem('session');
  const parsedSession = storedSession ? JSON.parse(storedSession) : null;
  const token = parsedSession?.access_token || parsedSession?.[0]?.access_token || null;
  const userRole =
    parsedSession?.user?.user_metadata?.role ||
    parsedSession?.[0]?.identity_data?.role;
  const userId =
    parsedSession?.user?.id || parsedSession?.[0]?.user_id || null;

  const roleTheme = useMemo(() => getRoleTheme(userRole), [userRole]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const url =
        userRole === 'B' && userId
          ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications/${userId}`
          : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(await res.text());
      const { data } = await res.json();
      setNotifications(data || []);
      setUnreadCount(data.filter((n) => !n.is_viewed).length);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
    }
  };

  useEffect(() => { fetchNotifications(); }, [token]);

  // Realtime notifications listener
  useEffect(() => {
    if (!token) return;
    const channel = supabase
      .channel('realtime:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchNotifications())
      .subscribe(status => {
        if (status === 'SUBSCRIBED') console.log('🔥 Supabase realtime listener active!');
      });
    return () => supabase.removeChannel(channel);
  }, [token, userRole, userId]);

  // Detect new unread notifications for snackbar
  useEffect(() => {
    if (!notifications.length) return;
    const prevNotifications = prevNotificationsRef.current;
    const newNotifs = notifications.filter(
      n => !n.is_viewed && !prevNotifications.some(prev => prev.id === n.id)
    );
    if (newNotifs.length > 0) {
      setSnackbarMessage(newNotifs[0].title);
      setSnackbarOpen(true);
      setUnreadCount(notifications.filter(n => !n.is_viewed).length);
    }
    prevNotificationsRef.current = notifications;
  }, [notifications]);

  const closeSnackbar = () => setSnackbarOpen(false);

  useEffect(() => {
    const cleanup = setupTabCloseLogout();
    return cleanup;
  }, []);

  useEffect(() => {
    const storedIndex = sessionStorage.getItem('activeTab');
    if (storedIndex !== null) setActiveTab(Number(storedIndex));
  }, []);
  // Tabs definition
  const tabs = [
    { label: 'Overview', icon: <DashboardIcon />, component: <OverviewTab /> },
    { label: 'Reports', icon: <AssignmentIcon />, component: <ViewReportsTabFilteredByBarangay /> },
    { label: 'Create Report', icon: <PeopleIcon />, component: <CreateReportTab /> },
    { label: 'Events', icon: <EventNoteIcon />, component: <EventListTab /> },
    {
      label: 'Notifications',
      icon: <NotificationsIcon />,
      component: <NotificationsTab notifications={notifications} setNotifications={setNotifications} />,
    },
    { label: 'E-Library', icon: <LibraryBooksIcon />, component: <ELibraryTab /> },
  ];

  return (
    <ThemeProvider theme={roleTheme}>
      <Box sx={{ display: 'flex', height: '100vh', overflowX: 'hidden' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: roleTheme.palette.background.default,
              borderRight: `1px solid ${roleTheme.palette.divider}`,
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
                  onClick={() => { setActiveTab(index); sessionStorage.setItem('activeTab', index.toString()); }}
                  sx={{
                    borderRadius: '0.5rem',
                    px: 2,
                    py: 1,
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      background: roleTheme.customGradient,
                      opacity: 0.7,
                    },
                    '&.Mui-selected': {
                      background: roleTheme.customGradient,
                      color: roleTheme.palette.primary.contrastText,
                      fontWeight: 600,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: activeTab === index ? roleTheme.palette.primary.contrastText : '#1e293b',
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
                          color: activeTab === index ? roleTheme.palette.primary.contrastText : '#1e293b',
                        }}
                      >
                        {tab.label}
                      </Typography>
                    }
                  />
                  {tab.label === 'Notifications' && unreadCount > 0 && (
                    <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }} />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ p: 2 }}>
            <Button
              onClick={async () => {
                setIsLoggingOut(true);
                await signOutUser(navigate);
                setIsLoggingOut(false);
              }}
              fullWidth
              variant="contained"
              size="small"
              startIcon={
                isLoggingOut ? <CircularProgress size={16} color="inherit" /> : <LogoutIcon fontSize="small" />
              }
              disabled={isLoggingOut}
              sx={{
                textTransform: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
                background: roleTheme.customGradient,
                color: roleTheme.palette.primary.contrastText,
                '&:hover': {
                  opacity: 0.85,
                },
                '&:active': { transform: 'scale(0.97)' },
              }}
            >
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </Button>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
          {tabs[activeTab]?.component || <Typography variant="body1">😵 Unknown Tab</Typography>}
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity="info"
          icon={<NotificationsActiveRoundedIcon sx={{ fontSize: 28, mr: 1, color: '#fbbf24' }} />}
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
    </ThemeProvider>
  );
};

export default DashboardOrgB;
