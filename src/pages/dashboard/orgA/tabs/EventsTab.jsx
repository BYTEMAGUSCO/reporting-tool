import { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Chip,
  Skeleton,
  Pagination,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { getStoredToken } from '@/services/SessionManager';
import { showSuccessAlert, showErrorAlert } from '@/services/alert'; // SweetAlert helpers
import { createClient } from '@supabase/supabase-js';

const PAGE_LIMIT = 8;

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const EventsTab = () => {
  const token = getStoredToken();
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [approvingId, setApprovingId] = useState(null);
  const [denyingId, setDenyingId] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    dateStart: '',
    dateEnd: '',
    location: '',
    barangay: '',
  });

  const [barangayList, setBarangayList] = useState([]);

// Replace these states
const [openDesc, setOpenDesc] = useState(false);
const [selectedEvent, setSelectedEvent] = useState(null);


  useEffect(() => {
    fetchEvents(page);
    fetchBarangays();
  }, [page]);

  const fetchBarangays = async () => {
    try {
      const { data, error } = await supabase.from('barangays').select('id, name');
      if (error) throw error;
      setBarangayList(data || []);
    } catch (err) {
      console.error('[EventsTab] Failed to fetch barangays:', err);
    }
  };

  useEffect(() => {
    if (!token) return;

    const channel = supabase
      .channel('realtime:events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        async () => fetchEvents(page)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🔥 Supabase realtime listener for events started!');
        }
      });

    return () => supabase.removeChannel(channel);
  }, [token, page]);

  const fetchEvents = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
      const url = `${baseUrl}/events?page=${pageNumber}&limit=${PAGE_LIMIT}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();

      if (res.ok) {
        setEvents(Array.isArray(data.data) ? data.data : []);
        setTotalPages(Math.ceil((data.total || 0) / PAGE_LIMIT));
      } else {
        console.error('[EventsTab] API Error:', data.error);
        await showErrorAlert(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('[EventsTab] Fetch error:', err);
      await showErrorAlert('Network error while fetching events');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/events/approve/${id}`;
      const res = await fetch(baseUrl, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to approve event');
      }
      await showSuccessAlert('Event approved! 🎉');
      fetchEvents(page);
    } catch (error) {
      console.error('Approve failed:', error);
      await showErrorAlert(`Approve failed: ${error.message}`);
    } finally {
      setApprovingId(null);
    }
  };
const handleDeny = async (id) => {
  setDenyingId(id);
  try {
    const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/events/deny/${id}`;
    const res = await fetch(baseUrl, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      let errMessage = 'Failed to deny event';
      try {
        const errJson = await res.clone().json(); // clone allows another read if needed
        errMessage = errJson.error || JSON.stringify(errJson) || errMessage;
      } catch {
        // fallback if JSON parse fails
        errMessage = `HTTP ${res.status} — Could not parse error details`;
      }
      throw new Error(errMessage);
    }

    await showSuccessAlert('Event denied!');
    fetchEvents(page);
  } catch (error) {
    console.error('Deny failed:', error);
    await showErrorAlert(`Deny failed: ${error.message}`);
  } finally {
    setDenyingId(null);
  }
};


  const handleAddEvent = async () => {
    if (
      !newEvent.name.trim() ||
      !newEvent.location.trim() ||
      !newEvent.dateStart.trim() ||
      !newEvent.dateEnd.trim() ||
      !newEvent.barangay
    ) {
      await showErrorAlert('Name, Start/End DateTime, Location, and Barangay are required.');
      return;
    }
    if (!newEvent.description.trim()) {
      await showErrorAlert('Description is required.');
      return;
    }
    setAddingEvent(true);

    const formatLocalDateTime = (value) => {
      if (!value) return null;
      return value.length === 16 ? `${value}:00` : value;
    };

    const payload = {
      name: newEvent.name.trim(),
      location: newEvent.location.trim(),
      description: newEvent.description.trim(),
      date_time_start: formatLocalDateTime(newEvent.dateStart),
      date_time_end: formatLocalDateTime(newEvent.dateEnd),
      barangay: newEvent.barangay,
    };

    try {
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/events`;
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add event');
      }

      setOpenAdd(false);
      setNewEvent({ name: '', description: '', dateStart: '', dateEnd: '', location: '', barangay: '' });
      await showSuccessAlert('Event added! 🎉');
      fetchEvents(page);
    } catch (error) {
      console.error('Add event failed:', error);
      await showErrorAlert(`Add event failed: ${error.message}`);
    } finally {
      setAddingEvent(false);
    }
  };

  const handleRowClick = (event) => {
  setSelectedEvent(event);
  setOpenDesc(true);
};


  return (
    <Box sx={{ px: 2, py: 2, borderRadius: '0.5rem' }}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Events Management
      </Typography>

      <Box mb={2}>
        <Button
          variant="contained"
          onClick={() => setOpenAdd(true)}
          disabled={loading || addingEvent}
        >
          Add Event
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ overflowX: 'auto', maxHeight: '60vh', overflowY: 'auto', borderRadius: '0.5rem' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Barangay</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                <TableRow key={i}>
                  {Array(6).fill().map((_, j) => (
                    <TableCell key={j} sx={{ py: 0.5 }}>
                      <Skeleton variant="text" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" align="center" sx={{ py: 2 }}>
                    No events found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => {
                const shortDesc =
                  event?.description && event.description.length > 25
                    ? event.description.slice(0, 25) + '…'
                    : event?.description || 'N/A';

                return (
                  <TableRow
                    key={event?.id || Math.random()}
                    hover
                    sx={{ cursor: 'pointer' }}
                   // Inside your TableRow onClick
                    onClick={(e) => {
                      if (e.target.nodeName !== 'BUTTON') handleRowClick(event);
                    }}
                                      >
                    <TableCell>{event?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={event?.status || 'pending'}
                        color={
                          event?.status === 'approved'
                            ? 'success'
                            : event?.status === 'denied'
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                        sx={{ fontSize: '0.7rem', height: '22px', borderRadius: '0.5rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const found = barangayList.find((b) => b.id === event?.barangay);
                        return found ? found.name : event?.barangay || 'N/A';
                      })()}
                    </TableCell>
                    <TableCell>{shortDesc}</TableCell>
                    <TableCell>
                      {event?.date_time_start && event?.date_time_end
                        ? `${new Date(event.date_time_start).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })} - ${new Date(event.date_time_end).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}`
                        : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        sx={{ mr: 1 }}
                        onClick={() => handleApprove(event?.id)}
                        disabled={event?.status === 'approved' || approvingId === event?.id || loading}
                      >
                        {approvingId === event?.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => handleDeny(event?.id)}
                        disabled={event?.status === 'denied' || denyingId === event?.id || loading}
                      >
                        {denyingId === event?.id ? 'Denying...' : 'Deny'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          disabled={loading || addingEvent || approvingId !== null || denyingId !== null}
        />
      </Box>

      {/* Add Event Dialog */}
      <Dialog open={openAdd} onClose={() => !addingEvent && setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
            disabled={addingEvent}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="dense"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            disabled={addingEvent}
          />
          <TextField
            label="Start Date & Time"
            type="datetime-local"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={newEvent.dateStart}
            onChange={(e) => setNewEvent({ ...newEvent, dateStart: e.target.value })}
            disabled={addingEvent}
          />
          <TextField
            label="End Date & Time"
            type="datetime-local"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={newEvent.dateEnd}
            onChange={(e) => setNewEvent({ ...newEvent, dateEnd: e.target.value })}
            disabled={addingEvent}
          />
          <TextField
            label="Location"
            fullWidth
            margin="dense"
            value={newEvent.location}
            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
            disabled={addingEvent}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Barangay</InputLabel>
            <Select
              value={newEvent.barangay}
              onChange={(e) => setNewEvent({ ...newEvent, barangay: e.target.value })}
              disabled={addingEvent}
              label="Barangay"
            >
              {barangayList.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => !addingEvent && setOpenAdd(false)} disabled={addingEvent}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddEvent} disabled={addingEvent}>
            {addingEvent ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
<Dialog open={openDesc} onClose={() => setOpenDesc(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Event Details</DialogTitle>
  <DialogContent dividers>
    {selectedEvent ? (
      <Box>
        <Typography variant="h6" gutterBottom>
          {selectedEvent.name}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Status:</strong>{' '}
          <Chip
            label={selectedEvent?.status || 'pending'}
            color={
              selectedEvent?.status === 'approved'
                ? 'success'
                : selectedEvent?.status === 'denied'
                ? 'error'
                : 'warning'
            }
            size="small"
            sx={{ fontSize: '0.7rem', height: '22px', borderRadius: '0.5rem' }}
          />
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Barangay:</strong>{' '}
          {barangayList.find((b) => b.id === selectedEvent?.barangay)?.name || 'N/A'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Location:</strong> {selectedEvent.location || 'N/A'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Start:</strong>{' '}
          {selectedEvent.date_time_start
            ? new Date(selectedEvent.date_time_start).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '—'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>End:</strong>{' '}
          {selectedEvent.date_time_end
            ? new Date(selectedEvent.date_time_end).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '—'}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2">
          <strong>Description:</strong>
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {selectedEvent.description || 'No description'}
        </Typography>
      </Box>
    ) : (
      <Typography>No event selected</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDesc(false)}>Close</Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default EventsTab;
