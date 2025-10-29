import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Divider,
  Button,
  Pagination,
} from "@mui/material";
import { getStoredToken } from "@/services/SessionManager";
import { showSuccessAlert, showErrorAlert } from "@/services/alert";
import { createClient } from "@supabase/supabase-js";
import {
  AddEventDialog,
  EventDetailsDialog,
  EventsTable,
} from "./EventsTabParts";

const PAGE_LIMIT = 8;

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Role-based button color
const getRoleButtonColor = (role) => {
  switch (role) {
    case 'S': return '#facc15'; // Super Admin → Yellow
    case 'D': return '#059669'; // DILG → Green
    case 'B': return '#2563eb'; // Barangay → Blue
    default:  return '#64748b'; // Default gray
  }
};

const EventsTab = () => {
  const token = getStoredToken();
  const [userRole, setUserRole] = useState(null);

  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [approvingId, setApprovingId] = useState(null);
  const [denyingId, setDenyingId] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    dateStart: "",
    dateEnd: "",
    location: "",
    barangay: "",
  });

  const [barangayList, setBarangayList] = useState([]);
  const [openDesc, setOpenDesc] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch role from sessionStorage
  useEffect(() => {
    try {
      const session = JSON.parse(sessionStorage.getItem("session"));
      const fetchedUser = session?.user;
      if (fetchedUser) {
        const metadata = fetchedUser.user_metadata || {};
        const role = metadata.role || fetchedUser.role || "unknown";
        console.log("[EventsTab] Detected user role:", role);
        setUserRole(role);
      }
    } catch (err) {
      console.error("[EventsTab] Failed to fetch user role:", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents(page);
    fetchBarangays();
  }, [page]);

  const fetchBarangays = async () => {
    try {
      const { data, error } = await supabase.from("barangays").select("id, name");
      if (error) throw error;
      setBarangayList(data || []);
    } catch (err) {
      console.error("[EventsTab] Failed to fetch barangays:", err);
    }
  };

  useEffect(() => {
    if (!token) return;

    const channel = supabase
      .channel("realtime:events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        async () => fetchEvents(page)
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") console.log("🔥 Supabase realtime listener for events started!");
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
        console.error("[EventsTab] API Error:", data.error);
        await showErrorAlert(data.error || "Failed to fetch events");
      }
    } catch (err) {
      console.error("[EventsTab] Fetch error:", err);
      await showErrorAlert("Network error while fetching events");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/events/approve/${id}`;
      const res = await fetch(baseUrl, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to approve event");
      }
      await showSuccessAlert("Event approved! 🎉");
      fetchEvents(page);
    } catch (error) {
      console.error("Approve failed:", error);
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
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        let errMessage = "Failed to deny event";
        try {
          const errJson = await res.clone().json();
          errMessage = errJson.error || JSON.stringify(errJson) || errMessage;
        } catch {
          errMessage = `HTTP ${res.status} — Could not parse error details`;
        }
        throw new Error(errMessage);
      }
      await showSuccessAlert("Event denied!");
      fetchEvents(page);
    } catch (error) {
      console.error("Deny failed:", error);
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
      await showErrorAlert("Name, Start/End DateTime, Location, and Barangay are required.");
      return;
    }
    if (!newEvent.description.trim()) {
      await showErrorAlert("Description is required.");
      return;
    }
    setAddingEvent(true);

    const formatLocalDateTime = (value) => value.length === 16 ? `${value}:00` : value;

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
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add event");
      }

      setOpenAdd(false);
      setNewEvent({ name: "", description: "", dateStart: "", dateEnd: "", location: "", barangay: "" });
      await showSuccessAlert("Event added! 🎉");
      fetchEvents(page);
    } catch (error) {
      console.error("Add event failed:", error);
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
    <Box sx={{ px: 2, py: 2, borderRadius: "0.5rem" }}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Events Management
      </Typography>

      <Box mb={2}>
        {/* Only render Add Event button if user is NOT Super Admin */}
        {userRole !== "S" && (
<Button
  onClick={() => setOpenAdd(true)}
  disabled={loading || addingEvent}
  sx={{
    bgcolor: getRoleButtonColor(userRole) + " !important",
    color: "#fff",
    fontWeight: "bold",
    px: 3,
    py: 1.2,
    border: "2px solid rgba(0,0,0,0.15)",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    textTransform: "none",
    transition: "all 0.2s ease",
    '&:hover': {
      bgcolor: getRoleButtonColor(userRole) + " !important",
      opacity: 0.9,
      boxShadow: "0 6px 10px rgba(0,0,0,0.15)",
    },
    '&:disabled': {
      bgcolor: "#cbd5e1 !important",
      color: "#64748b",
      boxShadow: "none",
    },
  }}
>
  Add Event
</Button>


        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto", borderRadius: "0.5rem" }}>
        <EventsTable
          events={events}
          barangayList={barangayList}
          loading={loading}
          PAGE_LIMIT={PAGE_LIMIT}
          handleApprove={handleApprove}
          handleDeny={handleDeny}
          approvingId={approvingId}
          denyingId={denyingId}
          onRowClick={handleRowClick}
          userRole={userRole}
        />
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

      <AddEventDialog
        open={openAdd}
        onClose={() => !addingEvent && setOpenAdd(false)}
        onSave={handleAddEvent}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        barangayList={barangayList}
        addingEvent={addingEvent}
      />

      <EventDetailsDialog
        open={openDesc}
        onClose={() => setOpenDesc(false)}
        event={selectedEvent}
        barangayList={barangayList}
      />
    </Box>
  );
};

export default EventsTab;
