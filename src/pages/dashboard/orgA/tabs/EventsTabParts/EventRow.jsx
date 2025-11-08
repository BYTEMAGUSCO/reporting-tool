import { TableRow, TableCell, Button, Chip, Box, CircularProgress } from "@mui/material";

const EventRow = ({
  event,
  barangayList,
  handleApprove,
  handleDeny,
  approvingId,
  denyingId,
  loading,
  onClick,
  userRole,
}) => {
  const shortDesc =
    event?.description?.length > 25
      ? event.description.slice(0, 25) + "…"
      : event?.description || "N/A";

  const isApproved = event.status === "A";
  const isDenied = event.status === "D" || event.status === "R";

  // Status chip colors
  let statusLabel = "Pending";
  let statusColor = "warning";
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
            sx={{
              fontSize: "0.7rem",
              height: "22px",
              borderRadius: "0.5rem",
            }}
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
        {/* Only show buttons if user is Super Admin and event is not approved */}
        {userRole?.trim().toUpperCase() === "S" && !isApproved && (
          <Box display="flex" justifyContent="flex-end" gap={1}>
            {/* ✅ APPROVE BUTTON */}
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(event.id);
              }}
              disabled={loading || approvingId === event.id}
              sx={{
                backgroundColor: "#22c55e !important",
                color: "#fff !important",
                fontWeight: "600 !important",
                borderRadius: "0.5rem !important",
                textTransform: "none !important",
                px: 1.8,
                py: 0.6,
                minWidth: "90px",
                "&:hover": {
                  backgroundColor: "#16a34a !important",
                  transform: "scale(0.97)",
                },
                "&:disabled": {
                  backgroundColor: "#86efac !important",
                  color: "#f0fdf4 !important",
                },
              }}
            >
              {approvingId === event.id ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Approve"
              )}
            </Button>

            {/* ❌ DENY BUTTON */}
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeny(event.id);
              }}
              disabled={denyingId === event.id || loading}
              sx={{
                backgroundColor: "#ef4444 !important",
                color: "#fff !important",
                fontWeight: "600 !important",
                borderRadius: "0.5rem !important",
                textTransform: "none !important",
                px: 1.8,
                py: 0.6,
                minWidth: "90px",
                "&:hover": {
                  backgroundColor: "#dc2626 !important",
                  transform: "scale(0.97)",
                },
                "&:disabled": {
                  backgroundColor: "#fecaca !important",
                  color: "#fee2e2 !important",
                },
              }}
            >
              {denyingId === event.id ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                "Deny"
              )}
            </Button>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
};

export default EventRow;
