import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Skeleton, Fade } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pull token & user info from session
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
        (payload) => {
          console.log('🔔 Realtime change:', payload);

          setNotifications((prev) => {
            let updated = [...prev];

            if (payload.eventType === 'INSERT') {
              if (
                userRole === 'B'
                  ? payload.new.specified_to === userId
                  : payload.new.specified_to === null
              ) {
                updated = [payload.new, ...updated];
              }
            } else if (payload.eventType === 'UPDATE') {
              updated = updated.map((n) =>
                n.id === payload.new.id ? payload.new : n
              );
            } else if (payload.eventType === 'DELETE') {
              updated = updated.filter((n) => n.id !== payload.old.id);
            }

            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [token, userRole, userId]);

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

      {loading ? (
        <>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : notifications.length > 0 ? (
        <List>
          {notifications.map((n) => (
            <Fade in key={n.id} timeout={500}>
              <ListItem
                sx={{
                  border: '1px solid #eee',
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: '#fffdf8',
                  boxShadow: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 600 }}>{n.title}</Typography>
                  }
                  secondary={
                    <>
                      {n.content}
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                        {new Date(n.created_at).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
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
