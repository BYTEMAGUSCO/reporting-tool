import { TableRow, TableCell, Button, Chip } from "@mui/material";

const EventRow = ({ event, barangayList, handleApprove, handleDeny, approvingId, denyingId, loading, onClick }) => {
  const shortDesc = event?.description?.length > 25 ? event.description.slice(0, 25) + "…" : event?.description || "N/A";

  return (
    <TableRow hover onClick={onClick} sx={{ cursor: "pointer" }}>
      <TableCell>{event?.name || "—"}</TableCell>
      <TableCell>
        <Chip
          label={event?.status || "pending"}
          color={
            event?.status === "approved" ? "success" :
            event?.status === "denied" ? "error" : "warning"
          }
          size="small"
          sx={{ fontSize: "0.7rem", height: "22px" }}
        />
      </TableCell>
      <TableCell>{barangayList.find((b) => b.id === event?.barangay)?.name || "N/A"}</TableCell>
      <TableCell>{shortDesc}</TableCell>
      <TableCell>
        {event?.date_time_start && event?.date_time_end
          ? `${new Date(event.date_time_start).toLocaleString()} - ${new Date(event.date_time_end).toLocaleString()}`
          : "—"}
      </TableCell>
      <TableCell align="right">
        <Button
          variant="contained"
          size="small"
          color="success"
          sx={{ mr: 1 }}
          onClick={() => handleApprove(event.id)}
          disabled={event?.status === "approved" || approvingId === event.id || loading}
        >
          {approvingId === event.id ? "Approving..." : "Approve"}
        </Button>
        <Button
          variant="contained"
          size="small"
          color="error"
          onClick={() => handleDeny(event.id)}
          disabled={event?.status === "denied" || denyingId === event.id || loading}
        >
          {denyingId === event.id ? "Denying..." : "Deny"}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default EventRow;
