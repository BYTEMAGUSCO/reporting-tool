import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Typography,
  Box,
  Select,
  MenuItem,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";

import EventRow from "./EventRow";
import { useState } from "react";

// helper: find barangay name
const getBrgyName = (barangayList, id) =>
  barangayList.find((b) => b.id === id)?.name || "Unknown";

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
  userRole,
}) => {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterBrgy, setFilterBrgy] = useState("ALL");

  const filteredEvents = events.filter((ev) => {
    const statusMatch = filterStatus === "ALL" || ev.status === filterStatus;
    const brgyMatch = filterBrgy === "ALL" || ev.barangay === filterBrgy;
    return statusMatch && brgyMatch;
  });

  // style logic for attendance badges
  const attendanceChip = (record) => {
    if (!record)
      return <Chip label="No response" size="small" color="default" variant="outlined" />;

    if (record.is_attending)
      return <Chip label="Attending" size="small" color="success" />;

    if (!record.is_attending)
      return <Chip label="Not Attending" size="small" color="error" />;

    return <Chip label="No response" size="small" variant="outlined" />;
  };

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

      <Table size="small" stickyHeader sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Barangay</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>

            <TableCell><strong>Attendance</strong></TableCell>
            <TableCell><strong>Attendance Remarks</strong></TableCell>

            <TableCell align="right"><strong>Action</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            Array.from({ length: PAGE_LIMIT }).map((_, i) => (
              <TableRow key={i}>
                {Array(8)
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
              <TableCell colSpan={8}>
                <Typography align="center" sx={{ py: 2 }}>
                  No events found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredEvents.map((event) => {
              const attendanceRecords = event.attendance || [];

              // NEW: show only the attendance record that matches the event's assigned barangay
              const primaryRecord = attendanceRecords.find(
                (r) => r.barangay_id == event.barangay
              );

              return (
                <TableRow
                  key={event.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={(e) => {
                    if (e.target.nodeName !== "BUTTON") onRowClick(event);
                  }}
                >
                  <TableCell>{event.name}</TableCell>

                  <TableCell>
                    {event.status === "P" && <Chip label="Pending" color="warning" size="small" />}
                    {event.status === "A" && <Chip label="Approved" color="success" size="small" />}
                    {event.status === "D" && <Chip label="Denied" color="error" size="small" />}
                  </TableCell>

                  <TableCell>{getBrgyName(barangayList, event.barangay)}</TableCell>

                  <TableCell>{event.description}</TableCell>

                  <TableCell>
                    {event.date_time_start} → {event.date_time_end}
                  </TableCell>

                  {/* Attendance — only the event's assigned barangay */}
                  <TableCell>{attendanceChip(primaryRecord)}</TableCell>

                  {/* Attendance Remarks — only the event's assigned barangay */}
                  <TableCell>
                    {primaryRecord?.remarks ? (
                      <Tooltip title={primaryRecord.remarks}>
                        <Typography
                          sx={{
                            maxWidth: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: "0.85rem",
                          }}
                        >
                          {primaryRecord.remarks}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography sx={{ color: "text.secondary" }}>—</Typography>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <EventRow
                      event={event}
                      barangayList={barangayList}
                      handleApprove={handleApprove}
                      handleDeny={handleDeny}
                      approvingId={approvingId}
                      denyingId={denyingId}
                      loading={loading}
                      userRole={userRole}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default EventsTable;
