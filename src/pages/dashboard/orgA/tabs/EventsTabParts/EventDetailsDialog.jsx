import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, Box, Chip, Divider
} from "@mui/material";

const EventDetailsDialog = ({ open, onClose, event, barangayList }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Event Details</DialogTitle>
      <DialogContent dividers>
        {event ? (
          <Box>
            <Typography variant="h6">{event.name}</Typography>
            <Typography>
              <strong>Status:</strong>{" "}
              <Chip
                label={event?.status || "pending"}
                color={
                  event?.status === "approved" ? "success" :
                  event?.status === "denied" ? "error" : "warning"
                }
                size="small"
                sx={{ fontSize: "0.7rem", height: "22px" }}
              />
            </Typography>
            <Typography>
              <strong>Barangay:</strong>{" "}
              {barangayList.find((b) => b.id === event?.barangay)?.name || "N/A"}
            </Typography>
            <Typography><strong>Location:</strong> {event.location || "N/A"}</Typography>
            <Typography>
              <strong>Start:</strong>{" "}
              {event.date_time_start ? new Date(event.date_time_start).toLocaleString() : "—"}
            </Typography>
            <Typography>
              <strong>End:</strong>{" "}
              {event.date_time_end ? new Date(event.date_time_end).toLocaleString() : "—"}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography><strong>Description:</strong></Typography>
            <Typography>{event.description || "No description"}</Typography>
          </Box>
        ) : (
          <Typography>No event selected</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDetailsDialog;
