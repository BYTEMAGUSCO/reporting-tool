import { TableRow, TableCell, Button, Chip, Box } from "@mui/material";

const EventRow = ({
  event,
  barangayList,
  handleApprove,
  handleDeny,
  approvingId,
  denyingId,
  loading,
  onClick,
  userRole, // <-- pass this prop from parent
}) => {
  const shortDesc =
    event?.description?.length > 25
      ? event.description.slice(0, 25) + "…"
      : event?.description || "N/A";

  const isApproved = event.status === "A";
  const isDenied = event.status === "D" || event.status === "R";

  // Status chip colors
  let statusLabel = "Pending";
  let statusColor = "warning"; // yellow
  if (isApproved) {
    statusLabel = "Approved";
    statusColor = "success";
  } else if (isDenied) {
    statusLabel = "Denied";
    statusColor = "error";
  }

  return (
    <TableRow hover sx={{ cursor: "pointer" }} onClick={onClick}>
      <TableCell>{event?.name || "—"}</TableCell>

      <TableCell>
        <Box onClick={(e) => e.stopPropagation()}>
          <Chip
            label={statusLabel}
            color={statusColor}
            size="small"
            sx={{ fontSize: "0.7rem", height: "22px" }}
          />
        </Box>
      </TableCell>

      <TableCell>
        {barangayList.find((b) => b.id === event?.barangay)?.name || "N/A"}
      </TableCell>

      <TableCell>{shortDesc}</TableCell>

      <TableCell>
        {event?.date_time_start && event?.date_time_end
          ? `${new Date(event.date_time_start).toLocaleString()} - ${new Date(
              event.date_time_end
            ).toLocaleString()}`
          : "—"}
      </TableCell>

      <TableCell align="right">
        {/* Only show buttons if user is "S" and event is not approved */}
        {userRole?.trim().toUpperCase() === "S" && !isApproved && (
          <>
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(event.id);
              }}
              disabled={loading || approvingId === event.id}
              sx={{
                mr: 1,
                backgroundColor: "#4caf50 !important", // green
                color: "#fff !important",
                "&:hover": { backgroundColor: "#43a047 !important" },
              }}
            >
              {approvingId === event.id ? "Approving..." : "Approve"}
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeny(event.id);
              }}
              disabled={denyingId === event.id || loading}
              sx={{
                backgroundColor: "#f44336 !important", // red
                color: "#fff !important",
                "&:hover": { backgroundColor: "#e53935 !important" },
              }}
            >
              {denyingId === event.id ? "Denying..." : "Deny"}
            </Button>
          </>
        )}
      </TableCell>
    </TableRow>
  );
};

export default EventRow;
