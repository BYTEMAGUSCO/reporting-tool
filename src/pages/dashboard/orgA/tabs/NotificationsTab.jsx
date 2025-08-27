import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Fade,
  IconButton,
  Stack,
  Tooltip,
  Chip,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ArchiveIcon from '@mui/icons-material/Archive';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import MarkunreadIcon from '@mui/icons-material/Markunread';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all"); // "all" | "unread" | "archived"

  const storedSession = sessionStorage.getItem('session');
  const parsedSession = storedSession ? JSON.parse(storedSession) : null;
  const token =
    parsedSession?.access_token || parsedSession?.[0]?.access_token || null;

  const userRole =
    parsedSession?.user?.user_metadata?.role ||
    parsedSession?.[0]?.identity_data?.role;
  const userId =
    parsedSession?.user?.id || parsedSession?.[0]?.user_id || null;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
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
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError('Uh oh… couldn’t load your notifications 😔');
    } finally {
      setLoading(false);
    }
  }, [token, userRole, userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // realtime refresh
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
  }, [token, fetchNotifications]);

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

  const handleArchive = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications/${id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_archived: true }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const { data } = await res.json();
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? data[0] : n))
      );
    } catch (err) {
      console.error('❌ Error archiving notification:', err);
    }
  };

  // counts
  const unreadCount = notifications.filter((n) => !n.is_viewed && !n.is_archived).length;
  const readCount = notifications.filter((n) => n.is_viewed && !n.is_archived).length;
  const archivedCount = notifications.filter((n) => n.is_archived).length;

  // filtered view
  let filteredNotifications = [];
  if (tab === "all") {
    filteredNotifications = notifications.filter((n) => !n.is_archived);
  } else if (tab === "unread") {
    filteredNotifications = notifications.filter((n) => !n.is_viewed && !n.is_archived);
  } else if (tab === "archived") {
    filteredNotifications = notifications.filter((n) => n.is_archived);
  }

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

      {/* Tabs */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Tooltip title="All Notifications">
          <Chip
            icon={<AllInboxIcon />}
            label={`All (${readCount + unreadCount})`}
            color={tab === "all" ? "primary" : "default"}
            onClick={() => setTab("all")}
            clickable
          />
        </Tooltip>
        <Tooltip title="Unread">
          <Chip
            icon={<MarkunreadIcon />}
            label={`Unread (${unreadCount})`}
            color={tab === "unread" ? "primary" : "default"}
            onClick={() => setTab("unread")}
            clickable
          />
        </Tooltip>
        <Tooltip title="Archived">
          <Chip
            icon={<ArchiveIcon />}
            label={`Archived (${archivedCount})`}
            color={tab === "archived" ? "primary" : "default"}
            onClick={() => setTab("archived")}
            clickable
          />
        </Tooltip>
      </Stack>

      {loading ? (
        <>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={60}
              sx={{ mb: 1, borderRadius: 2 }}
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
                button={tab !== "archived" && !n.is_viewed}
                onClick={() => tab !== "archived" && !n.is_viewed && markAsViewed(n.id)}
                sx={{
                  border: '1px solid #eee',
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: n.is_viewed ? '#f9f9f9' : '#fffef6',
                  boxShadow: n.is_viewed ? 0 : 1,
                  position: 'relative',
                  alignItems: "flex-start",
                  py: 1.5,
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

                {/* Unread red dot */}
                {tab !== "archived" && !n.is_viewed && (
                  <FiberManualRecordIcon
                    color="error"
                    fontSize="small"
                    sx={{ position: 'absolute', top: 12, right: 50 }}
                  />
                )}

                {/* Archive action */}
                {tab !== "archived" && (
                  <Tooltip title="Archive">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(n.id);
                      }}
                      sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                      <ArchiveIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
          {tab === "archived"
            ? "🗄 No archived notifications yet."
            : "🎉 You’re all caught up! Go touch grass 🌱 or grab a coffee ☕"}
        </Typography>
      )}
    </Box>
  );
};

export default NotificationsTab;
