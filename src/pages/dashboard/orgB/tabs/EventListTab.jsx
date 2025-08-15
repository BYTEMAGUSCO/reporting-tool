import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Pagination,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import { getStoredToken } from '@/services/SessionManager';
import { showErrorAlert } from '@/services/alert';
import { createClient } from '@supabase/supabase-js';

const PAGE_LIMIT = 8;
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const EventsTab = () => {
  const token = getStoredToken();
  const [page, setPage] = useState(1);
  const [eventsList, setEventsList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openDesc, setOpenDesc] = useState(false);
  const [selectedDesc, setSelectedDesc] = useState('');

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  useEffect(() => {
    if (!token) return;
    const channel = supabase
      .channel('realtime:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' },
        async () => fetchEvents(page)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [token, page]);

  const fetchEvents = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
      const url = `${baseUrl}/events?page=${pageNumber}&limit=${PAGE_LIMIT}`;
      console.log(`[EventsTab] Fetching events from: ${url}`);

      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      const data = await res.json();
      console.log("[EventsTab] Raw fetch response:", data);

      if (res.ok) {
        const list = Array.isArray(data.data) ? data.data : [];
        console.log(`[EventsTab] Processed events list (page ${pageNumber}):`, list);
        console.log(`[EventsTab] Total events count:`, data.total);

        setEventsList(list);
        setTotalPages(Math.ceil((data.total || 0) / PAGE_LIMIT));
      } else {
        await showErrorAlert(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      console.error("[EventsTab] Network error:", err);
      await showErrorAlert('Network error while fetching events');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    if (status === 'A') return <Chip label="Approved" color="success" size="small" />;
    if (status === 'D') return <Chip label="Denied" color="error" size="small" />;
    return <Chip label="Pending" color="warning" size="small" />;
  };

  const now = new Date();
  const approvedEvents = eventsList.filter(event => event.status === 'A');

  const ongoingEvents = approvedEvents
    .filter(event => {
      const start = new Date(event.date_time_start);
      const end = new Date(event.date_time_end);
      return start <= now && now <= end;
    })
    .sort((a, b) => new Date(a.date_time_start) - new Date(b.date_time_start));

  const upcomingEvents = approvedEvents
    .filter(event => new Date(event.date_time_start) > now)
    .sort((a, b) => new Date(a.date_time_start) - new Date(b.date_time_start));

  const pastEvents = approvedEvents
    .filter(event => new Date(event.date_time_end) < now)
    .sort((a, b) => new Date(b.date_time_end) - new Date(a.date_time_end));

  const renderEventCard = (event) => (
    <Card
      key={event.id}
      sx={{
        width: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        transition: '0.2s',
        '&:hover': { boxShadow: 4, transform: 'scale(1.01)' },
      }}
      onClick={() => {
        setSelectedDesc(event?.description || 'No description available');
        setOpenDesc(true);
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {event.name || 'Untitled Event'}
          </Typography>
          {getStatusChip(event.status)}
        </Box>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {event.location || 'Unknown Location'}
        </Typography>
        <Stack direction="row" spacing={1} mt={1} alignItems="center">
          <EventIcon fontSize="small" color="primary" />
          <Typography variant="caption" color="text.secondary">
            {event?.date_time_start
              ? new Date(event.date_time_start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
              : '—'}
            {" "}to{" "}
            {event?.date_time_end
              ? new Date(event.date_time_end).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
              : '—'}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  const SectionHeader = ({ icon: Icon, title }) => (
    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
      <Icon color="primary" />
      <Typography variant="h6" fontWeight="bold">{title}</Typography>
    </Stack>
  );

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Events Management
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Ongoing Events */}
      <SectionHeader icon={AccessTimeIcon} title="Ongoing Events" />
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        {loading
          ? Array.from({ length: PAGE_LIMIT }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
            ))
          : ongoingEvents.length === 0
          ? <Typography variant="body2" align="center">No ongoing events.</Typography>
          : ongoingEvents.map(renderEventCard)}
      </Box>

      {/* Upcoming Events */}
      <SectionHeader icon={EventIcon} title="Upcoming Events" />
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        {loading
          ? Array.from({ length: PAGE_LIMIT }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
            ))
          : upcomingEvents.length === 0
          ? <Typography variant="body2" align="center">No upcoming events.</Typography>
          : upcomingEvents.map(renderEventCard)}
      </Box>

      {/* Past Events */}
      <SectionHeader icon={HistoryIcon} title="Past Events" />
      <Box display="flex" flexDirection="column" gap={2}>
        {loading
          ? Array.from({ length: PAGE_LIMIT }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
            ))
          : pastEvents.length === 0
          ? <Typography variant="body2" align="center">No past events.</Typography>
          : pastEvents.map(renderEventCard)}
      </Box>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          disabled={loading}
        />
      </Box>

      {/* Dialog */}
      <Dialog open={openDesc} onClose={() => setOpenDesc(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Event Description</DialogTitle>
        <DialogContent>
          <Typography>{selectedDesc}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDesc(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsTab;
