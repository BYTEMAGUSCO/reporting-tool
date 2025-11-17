import { useEffect, useState, useRef } from 'react';
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
  ThemeProvider,
  createTheme,
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
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';

import ELibraryTab from './tabs/ELibraryTab';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

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

const getRoleTheme = (role) => {
  const base = {
    background: { default: '#fefdfb', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#475569' },
    divider: '#e2e8f0',
  };

  switch (role) {
    case 'S':
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#facc15', contrastText: '#000' },
        },
        customGradient: 'linear-gradient(135deg, #facc15, #fde68a)',
      });
    case 'D':
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#059669', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(135deg, #059669, #34d399)',
      });
    case 'B':
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#2563eb', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      });
    default:
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#64748b', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
      });
  }
};

const DashboardOrgA = () => {
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
  const token =
    parsedSession?.access_token || parsedSession?.[0]?.access_token || null;

  const userRole =
    parsedSession?.user?.user_metadata?.role ||
    parsedSession?.[0]?.identity_data?.role;
  const userId =
    parsedSession?.user?.id || parsedSession?.[0]?.user_id || null;
  
  const roleTheme = getRoleTheme(userRole);
  const roleLabels = {
    S: 'Super Admin',
    D: 'DILG STAFF',
    B: `Barangay`,
  };
  const userRoleLabel = roleLabels[userRole] || 'User';

  

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
        () => fetchNotifications()
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('🔥 Supabase realtime listener started!');
      });

    return () => supabase.removeChannel(channel);
  }, [token, userRole, userId]);

  useEffect(() => {
    if (!notifications.length) return;
    const prev = prevNotificationsRef.current;
    const newNotifs = notifications.filter(
      (n) => !n.is_viewed && !prev.some((p) => p.id === n.id)
    );

    if (newNotifs.length > 0) {
      setSnackbarMessage(newNotifs[0].title);
      setSnackbarOpen(true);
      setUnreadCount(notifications.filter((n) => !n.is_viewed).length);
    }

    prevNotificationsRef.current = notifications;
  }, [notifications]);

  const closeSnackbar = () => setSnackbarOpen(false);

  const tabs = [
    { label: 'Overview', icon: <DashboardIcon />, component: <OverviewTab /> },
    ...(userRole === 'S'
      ? [{ label: 'Account Management', icon: <PeopleIcon />, component: <ViewAccountsTab /> }]
      : []),
    { label: 'Form Management', icon: <AssignmentIcon />, component: <FormTabs /> },
    { label: 'Report Management', icon: <DescriptionIcon />, component: <ViewReportsTab /> },
    {
      label: 'Notifications',
      icon: <NotificationsActiveIcon />,
      component: <NotificationsTab notifications={notifications} setNotifications={setNotifications} />,
    },
    { label: 'Charts', icon: <DashboardIcon />, component: <ChartsTab /> },
    { label: 'Events', icon: <EventIcon />, component: <EventsTab /> },
    { label: 'E-Library', icon: <LibraryBooksIcon />, component: <ELibraryTab /> },
  ];

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
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              pt: 2,
            },
          }}
        >
          <Box
  sx={{
    px: 2,
    py: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  }}
>
  <GovLogoOnly logoWidth={250} logoHeight={85} />
  <Typography
    variant="subtitle2"
    sx={{
      mt: 1,
      fontWeight: 600,
      fontSize: '0.9rem',
      color: roleTheme.palette.text.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    }}
  >
    {userRoleLabel}
  </Typography>
</Box>
          <List sx={{ flexGrow: 1 }}>
            {tabs.map((tab, index) => (
              <ListItem key={index} disablePadding sx={{ mx: 1.5, borderRadius: '0.5rem' }}>
                <ListItemButton
                  selected={activeTab === index}
                  onClick={() => handleTabChange(index)}
                  sx={{
                    borderRadius: '0.5rem',
                    px: 2,
                    py: 1,
                    transition: 'background 0.3s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      backgroundColor: `${roleTheme.palette.primary.light || '#ddd'}`,
                    },
                    '&.Mui-selected': {
                      background: roleTheme.customGradient,
                      color: roleTheme.palette.primary.contrastText,
                      fontWeight: 600,
                      '&:hover': {
                        background: roleTheme.customGradient,
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      {tab.icon}
                    </ListItemIcon>
                    <Typography
                      variant="body2"
                      fontSize="0.95rem"
                      sx={{
                        fontWeight: activeTab === index ? 600 : 500,
                        color: 'inherit',
                      }}
                    >
                      {tab.label}
                    </Typography>
                  </Box>

                  {tab.label === 'Notifications' && unreadCount > 0 && (
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18,
                          marginRight: '20px',
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
                color: roleTheme.palette.primary.contrastText,
                background: roleTheme.customGradient,
                '&:hover': {
                  background: roleTheme.customGradient,
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
              color: '#000',
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
      </Box>
    </ThemeProvider>
  );
};

export default DashboardOrgA;
