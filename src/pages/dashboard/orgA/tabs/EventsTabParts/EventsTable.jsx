import { Table, TableHead, TableRow, TableCell, TableBody, Skeleton, Typography } from "@mui/material";
import EventRow from "./EventRow";

const EventsTable = ({ events, barangayList, loading, PAGE_LIMIT, handleApprove, handleDeny, approvingId, denyingId, onRowClick }) => {
  // Only keep pending events
  const pendingEvents = events.filter((event) => event.status === "pending");

  return (
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
                <TableCell key={j}><Skeleton variant="text" height={20} /></TableCell>
              ))}
            </TableRow>
          ))
        ) : pendingEvents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6}>
              <Typography align="center" sx={{ py: 2 }}>No pending events found.</Typography>
            </TableCell>
          </TableRow>
        ) : (
          pendingEvents.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              barangayList={barangayList}
              handleApprove={handleApprove}
              handleDeny={handleDeny}
              approvingId={approvingId}
              denyingId={denyingId}
              loading={loading}
              onClick={(e) => { if (e.target.nodeName !== "BUTTON") onRowClick(event); }}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default EventsTable;
