import { Table, TableHead, TableRow, TableCell, TableBody, Skeleton, Typography, Box, Select, MenuItem } from "@mui/material";
import EventRow from "./EventRow";
import { useState } from "react";

const EventsTable = ({
  events,
  barangayList,
  loading,
  PAGE_LIMIT,
  handleApprove,
  handleDeny,
  approvingId,
  denyingId,
  onRowClick,
  userRole, // <-- add this prop
}) => {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterBrgy, setFilterBrgy] = useState("ALL");

  const filteredEvents = events.filter((ev) => {
    const statusMatch = filterStatus === "ALL" || ev.status === filterStatus;
    const brgyMatch = filterBrgy === "ALL" || ev.barangay === filterBrgy;
    return statusMatch && brgyMatch;
  });

  return (
    <Box>
      {/* Filters */}
      <Box display="flex" gap={2} mb={2}>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          size="small"
        >
          <MenuItem value="ALL">All Status</MenuItem>
          <MenuItem value="P">Pending</MenuItem>
          <MenuItem value="A">Approved</MenuItem>
          <MenuItem value="D">Denied</MenuItem>
          <MenuItem value="R">Rejected</MenuItem>
        </Select>

        <Select
          value={filterBrgy}
          onChange={(e) => setFilterBrgy(e.target.value)}
          size="small"
        >
          <MenuItem value="ALL">All Barangays</MenuItem>
          {barangayList.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Table size="small" stickyHeader sx={{ minWidth: 1000 }}>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Barangay</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Remarks</strong></TableCell>
            <TableCell align="right"><strong>Action</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: PAGE_LIMIT }).map((_, i) => (
              <TableRow key={i}>
                {Array(6)
                  .fill()
                  .map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" height={20} />
                    </TableCell>
                  ))}
              </TableRow>
            ))
          ) : filteredEvents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography align="center" sx={{ py: 2 }}>
                  No events found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredEvents.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                barangayList={barangayList}
                handleApprove={handleApprove}
                handleDeny={handleDeny}
                approvingId={approvingId}
                denyingId={denyingId}
                loading={loading}
                onClick={(e) => {
                  if (e.target.nodeName !== "BUTTON" && e.target.nodeName !== "DIV")
                    onRowClick(event);
                }}
                userRole={userRole} // <-- pass userRole here
              />
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default EventsTable;
