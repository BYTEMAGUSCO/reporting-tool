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
  Stack,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import { createClient } from '@supabase/supabase-js';
import { getStoredToken } from '@/services/SessionManager';
import { showErrorAlert, showSuccessAlert } from '@/services/alert';
import {
  createAttendance,
  getAllAttendance,
} from '@/services/EventAttendanceService';

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
  const [userBarangay, setUserBarangay] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [barangays, setBarangays] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [remarks, setRemarks] = useState('');

  // confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { event_id, is_attending }

  useEffect(() => {
    try {
      const session = JSON.parse(sessionStorage.getItem('session'));
      const fetchedUser = session?.user;
      if (fetchedUser) {
        const metadata = fetchedUser.user_metadata || {};
        setUserBarangay(metadata.barangay || null);
        setUserRole(metadata.role || fetchedUser.role || null);
      }
    } catch (err) {
      console.error('[EventsTab] Failed to parse session:', err);
    }
  }, []);

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const { data, error } = await supabase.from('barangays').select('id,name');
        if (error) throw error;
        const map = {};
        data.forEach((b) => {
          map[b.id] = b.name;
        });
        setBarangays(map);
      } catch (err) {
        console.error('[EventsTab] Failed to fetch barangays:', err);
      }
    };
    fetchBarangays();
  }, []);

  useEffect(() => {
    if (userRole) fetchEvents(page);
  }, [page, userRole, userBarangay, barangays]);

  useEffect(() => {
    if (!token || !userRole) return;
    const channel = supabase
      .channel('realtime:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async () =>
        fetchEvents(page)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [token, page, userRole, userBarangay]);

  const fetchEvents = async (pageNumber = 1) => {
  setLoading(true);
  try {
    const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    const url = `${baseUrl}/events?page=${pageNumber}&limit=${PAGE_LIMIT}`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();

    if (res.ok) {
      let list = Array.isArray(data.data) ? data.data : [];

      // 🔥 FILTER: Only show events assigned to the user's barangay
      if (userBarangay) {
        list = list.filter((ev) => ev.barangay === userBarangay);
      }

      // Map barangay name
      list = list.map((ev) => ({
        ...ev,
        barangay_name: barangays[ev.barangay] || ev.barangay,
      }));

      setEventsList(list);
      setTotalPages(Math.ceil((list.length || 0) / PAGE_LIMIT));
    } else {
      await showErrorAlert(data.error || 'Failed to fetch events');
    }
  } catch (err) {
    console.error('[EventsTab] Network error:', err);
    await showErrorAlert('Network error while fetching events');
  } finally {
    setLoading(false);
  }
};


  // 🔹 Fetch attendance records for the user's barangay
  useEffect(() => {
    if (!token || !userBarangay) return;

    (async () => {
      try {
        const res = await getAllAttendance();
        const filtered = res.data.filter((a) => a.barangay_id === userBarangay);
        setAttendance(filtered);
      } catch (err) {
        console.error('[Attendance] Failed to fetch:', err);
      }
    })();
  }, [token, userBarangay]);

  // 🔹 Create attendance record
  const handleMarkAttendance = async (event_id, is_attending, remarksText = '') => {
  try {
    const res = await createAttendance({
      event_id,
      barangay_id: userBarangay,
      is_attending,
      remarks: remarksText || null, // optional
    });
    await showSuccessAlert(
      is_attending ? 'Marked as attending ✅' : 'Marked as not attending ❌'
    );
    setAttendance((prev) => [...prev, ...(res.data || [])]);
  } catch (err) {
    console.error('[Attendance] Failed to submit:', err);
    await showErrorAlert('Failed to submit attendance: ' + err.message);
  }
};

  // 🔹 Confirmation dialog trigger
  const confirmAttendance = (event_id, is_attending) => {
  setConfirmAction({ event_id, is_attending });
  setRemarks('');
  setConfirmOpen(true);
};

  const confirmSubmit = async () => {
  if (confirmAction) {
    await handleMarkAttendance(confirmAction.event_id, confirmAction.is_attending, remarks);
  }
  setConfirmOpen(false);
  setConfirmAction(null);
  setRemarks('');
};

  const getStatusChip = (status) => {
    if (status === 'A') return <Chip label="Approved" color="success" size="small" />;
    if (status === 'D') return <Chip label="Denied" color="error" size="small" />;
    return <Chip label="Pending" color="warning" size="small" />;
  };

  const now = new Date();
  const approvedEvents = eventsList.filter((event) => event.status === 'A');

  const ongoingEvents = approvedEvents
    .filter((ev) => {
      const s = new Date(ev.date_time_start);
      const e = new Date(ev.date_time_end);
      return s <= now && now <= e;
    })
    .sort((a, b) => new Date(a.date_time_start) - new Date(b.date_time_start));

  const upcomingEvents = approvedEvents
    .filter((ev) => new Date(ev.date_time_start) > now)
    .sort((a, b) => new Date(a.date_time_start) - new Date(b.date_time_start));

  const pastEvents = approvedEvents
    .filter((ev) => new Date(ev.date_time_end) < now)
    .sort((a, b) => new Date(b.date_time_end) - new Date(a.date_time_end));

   const renderEventCard = (event) => {
  const existing = attendance.find((a) => a.event_id === event.id);
  const eventEnd = new Date(event.date_time_end);
  const isPast = eventEnd < new Date();

  return (
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

        <Typography variant="body2" color="text.secondary" mt={0.5}>
          🏘️ {event.barangay_name}
        </Typography>

        <Stack direction="row" spacing={1} mt={1} alignItems="center">
          <EventIcon fontSize="small" color="primary" />
          <Typography variant="caption" color="text.secondary">
            {new Date(event.date_time_start).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}{' '}
            to{' '}
            {new Date(event.date_time_end).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </Typography>
        </Stack>

        {/* 👇 Attendance Section */}
        {!isPast && event.status === 'A' && (
          <Box
            mt={2}
            p={1.5}
            borderRadius="0.5rem"
            bgcolor="rgba(240, 240, 240, 0.4)"
            display="flex"
            flexDirection="column"
            justifyContent="flex-start"
            gap={1}
          >
            {existing ? (
              <>
                <Chip
                  label={
                    existing.is_attending
                      ? 'You’re Attending ✅'
                      : 'Not Attending ❌'
                  }
                  color={existing.is_attending ? 'success' : 'error'}
                  sx={{
                    fontWeight: '600',
                    borderRadius: '0.5rem',
                    width: 'fit-content',
                  }}
                />

                {/* 🆕 Display Remarks if present */}
                {existing.remarks && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, ml: 0.5 }}
                  >
                    <strong>Remarks:</strong> {existing.remarks}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmAttendance(event.id, true);
                  }}
                  sx={{
                    backgroundColor: '#22c55e !important',
                    color: '#fff !important',
                    fontWeight: '600 !important',
                    borderRadius: '0.5rem !important',
                    textTransform: 'none !important',
                    '&:hover': {
                      backgroundColor: '#16a34a !important',
                      transform: 'scale(0.97)',
                    },
                  }}
                >
                  Attend
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmAttendance(event.id, false);
                  }}
                  sx={{
                    backgroundColor: '#ef4444 !important',
                    color: '#fff !important',
                    fontWeight: '600 !important',
                    borderRadius: '0.5rem !important',
                    textTransform: 'none !important',
                    '&:hover': {
                      backgroundColor: '#dc2626 !important',
                      transform: 'scale(0.97)',
                    },
                  }}
                >
                  Not Attending
                </Button>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};



  const SectionHeader = ({ icon: Icon, title }) => (
    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
      <Icon color="primary" />
      <Typography variant="h6" fontWeight="bold">
        {title}
      </Typography>
    </Stack>
  );

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Events Management
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <SectionHeader icon={AccessTimeIcon} title="Ongoing Events" />
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        {loading
          ? Array.from({ length: PAGE_LIMIT }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
            ))
          : ongoingEvents.length === 0 ? (
            <Typography variant="body2" align="center">
              No ongoing events.
            </Typography>
          ) : (
            ongoingEvents.map(renderEventCard)
          )}
      </Box>

      <SectionHeader icon={EventIcon} title="Upcoming Events" />
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        {loading
          ? Array.from({ length: PAGE_LIMIT }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
            ))
          : upcomingEvents.length === 0 ? (
            <Typography variant="body2" align="center">
              No upcoming events.
            </Typography>
          ) : (
            upcomingEvents.map(renderEventCard)
          )}
      </Box>

      <SectionHeader icon={HistoryIcon} title="Past Events" />
      <Box display="flex" flexDirection="column" gap={2}>
        {loading
          ? Array.from({ length: PAGE_LIMIT }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
            ))
          : pastEvents.length === 0 ? (
            <Typography variant="body2" align="center">
              No past events.
            </Typography>
          ) : (
            pastEvents.map(renderEventCard)
          )}
      </Box>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          disabled={loading}
        />
      </Box>

      {/* Description Modal */}
      <Dialog open={openDesc} onClose={() => setOpenDesc(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Event Description</DialogTitle>
        <DialogContent>
          <Typography>{selectedDesc}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDesc(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
  <DialogTitle>Confirm Attendance</DialogTitle>
  <DialogContent>
    <Typography sx={{ mb: 2 }}>
      {confirmAction?.is_attending
        ? 'Are you sure you want to mark yourself as attending this event?'
        : 'Are you sure you will NOT attend this event?'}
    </Typography>

    {/* 🆕 Optional Remarks Input */}
    <Typography variant="body2" sx={{ mb: 1 }}>
      Add remarks (optional):
    </Typography>
    <Box
      component="textarea"
      rows={3}
      value={remarks}
      onChange={(e) => setRemarks(e.target.value)}
      placeholder="Enter remarks here..."
      style={{
        width: '100%',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        resize: 'none',
        fontFamily: 'inherit',
      }}
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setConfirmOpen(false)} color="inherit">
      Cancel
    </Button>
    <Button
      onClick={confirmSubmit}
      color={confirmAction?.is_attending ? 'success' : 'error'}
      variant="contained"
    >
      Confirm
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default EventsTab;
