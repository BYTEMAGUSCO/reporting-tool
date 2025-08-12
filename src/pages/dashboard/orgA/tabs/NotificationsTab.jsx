import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Fade,
  Button,
  Stack,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { createClient } from '@supabase/supabase-js';
import CheckIcon from '@mui/icons-material/Check';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const storedSession = sessionStorage.getItem('session');
  const parsedSession = storedSession ? JSON.parse(storedSession) : null;
  const token =
    parsedSession?.access_token || parsedSession?.[0]?.access_token || null;

  const userRole =
    parsedSession?.user?.user_metadata?.role ||
    parsedSession?.[0]?.identity_data?.role;
  const userId =
    parsedSession?.user?.id || parsedSession?.[0]?.user_id || null;

const fetchNotifications = async () => {
  if (!token) return;
  setLoading(true);
  try {
    const url =
      userRole === 'B' && userId
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications/${userId}`
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications`;

    console.log('🔥 Fetching notifications from URL:', url); 

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error(await res.text());

    const { data } = await res.json();
    setNotifications(data || []);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    setError('Uh oh… couldn’t load your notifications 😔');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchNotifications();
  }, []);

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
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [token, userRole, userId]);

  const markAsViewed = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications/${id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_viewed: true }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const { data } = await res.json();
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? data[0] : n))
      );
    } catch (err) {
      console.error('❌ Error marking notification as viewed:', err);
    }
  };

  const filteredNotifications = showUnreadOnly
    ? notifications.filter((n) => !n.is_viewed)
    : notifications;

  // Counts for badge display
  const unreadCount = notifications.filter((n) => !n.is_viewed).length;
  const readCount = notifications.length - unreadCount;

  return (
     <Box sx={{ p: 2 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
        }}
      >
        <NotificationsActiveIcon sx={{ mr: 1, color: '#ff9800' }} />
        Your Notifications
      </Typography>

      {/* Counts */}
      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Read: {readCount}
        </Typography>
        <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
          Unread: {unreadCount}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
  <Button
    variant={showUnreadOnly === false ? 'contained' : 'outlined'}
    color="primary"
    onClick={() => setShowUnreadOnly(false)} // always sets to show all
    endIcon={showUnreadOnly === false ? <CheckIcon sx={{ fontSize: 18 }} /> : null}
  >
    All
  </Button>
  <Button
    variant={showUnreadOnly === true ? 'contained' : 'outlined'}
    color="primary"
    onClick={() => setShowUnreadOnly((prev) => (prev === true ? false : true))}
    endIcon={showUnreadOnly === true ? <CheckIcon sx={{ fontSize: 18 }} /> : null}
  >
    Unread
  </Button>
</Stack>

      {loading ? (
        <>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={50}
              sx={{ mb: 1, borderRadius: 1 }}
            />
          ))}
        </>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      ) : filteredNotifications.length > 0 ? (
        <List>
          {filteredNotifications.map((n) => (
            <Fade in key={n.id} timeout={500}>
   <ListItem
  button={!n.is_viewed}
  onClick={() => !n.is_viewed && markAsViewed(n.id)}
  sx={{
    border: '1px solid #eee',
    borderRadius: 2,
    mb: 1,
    backgroundColor: n.is_viewed ? '#f9f9f9' : '#fffdf8',
    boxShadow: n.is_viewed ? 0 : 1,
    cursor: n.is_viewed ? 'default' : 'pointer',
    position: 'relative',
    pr: 5, // more right padding for dot space
  }}
>
  <ListItemText
    primary={
      <Typography
        sx={{
          fontWeight: 600,
          fontStyle: n.is_viewed ? 'normal' : 'italic',
          color: n.is_viewed ? 'text.secondary' : 'text.primary',
        }}
      >
        {n.title}
      </Typography>
    }
    secondary={
      <>
        {n.content}
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}
        >
          {new Date(n.created_at).toLocaleString()}
        </Typography>
      </>
    }
  />

  {!n.is_viewed && (
    <FiberManualRecordIcon
      color="error"
      fontSize="small"
      sx={{
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    />
  )}
</ListItem>

            </Fade>
          ))}
        </List>
      ) : (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', mt: 4 }}
        >
          🎉 You’re all caught up! <br />
          Go touch grass 🌱 or grab a coffee ☕
        </Typography>
      )}
    </Box>
  );
};

export default NotificationsTab;
