import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Skeleton,
} from '@mui/material';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';

const StyledTableCell = ({ children, align, colSpan, rowSpan, sx }) => {
  return (
    <TableCell
      align={align}
      colSpan={colSpan}
      rowSpan={rowSpan}
      sx={{
        fontWeight: 'bold',
        color: 'black',
        whiteSpace: 'nowrap',
        textTransform: 'none',
        fontSize: '0.875rem',
        paddingY: 1,
        paddingX: 2,
        ...sx,
      }}
    >
      {children}
    </TableCell>
  );
};


const ReportsTable = ({
  reports,
  approvingReportId,
  rejectingReportId,
  forwardingReportId,    // ⭐ NEW
  onApprove,
  onReject,
  onForward,             // ⭐ NEW
  activeTab,             // 0 = Pending, 1 = Approved, 2 = Denied
  loading,
  userRole,
}) => {
  const statusMap = { 0: 'P', 1: 'A', 2: 'D' };

  const filteredReports = reports.filter(
    (report) => report.report_status === statusMap[activeTab]
  );

  if (loading) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Report Name</StyledTableCell>
              <StyledTableCell>Submitted On</StyledTableCell>
              {(activeTab === 1 || activeTab === 2) && (
                <>
                  <StyledTableCell>Reviewed By</StyledTableCell>
                  <StyledTableCell>Reviewed At</StyledTableCell>
                </>
              )}
              {activeTab === 2 && <StyledTableCell>Remarks</StyledTableCell>}
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                {(activeTab === 1 || activeTab === 2) && (
                  <>
                    <TableCell><Skeleton variant="text" width={180} /></TableCell>
                    <TableCell><Skeleton variant="text" width={140} /></TableCell>
                  </>
                )}
                {activeTab === 2 && (
                  <TableCell><Skeleton variant="text" width={180} /></TableCell>
                )}
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Skeleton variant="rectangular" width={80} height={32} />
                    <Skeleton variant="rectangular" width={80} height={32} />
                    <Skeleton variant="rectangular" width={60} height={32} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Report Name</StyledTableCell>
            <StyledTableCell>Submitted On</StyledTableCell>
            {(activeTab === 1 || activeTab === 2) && (
              <>
                <StyledTableCell>Reviewed By</StyledTableCell>
                <StyledTableCell>Reviewed At</StyledTableCell>
              </>
            )}
            {activeTab === 2 && <StyledTableCell>Remarks</StyledTableCell>}
            <StyledTableCell align="right">Actions</StyledTableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredReports.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  activeTab === 2
                    ? 6
                    : activeTab === 1
                      ? 5
                      : 3
                }
                align="center"
                sx={{ py: 3, fontStyle: 'italic' }}
              >
                No reports found for this category.
              </TableCell>
            </TableRow>
          ) : (
            filteredReports.map((report) => (
              <TableRow key={report.report_id} hover>
                <TableCell>{report.report_name || 'Unnamed Report'}</TableCell>
                <TableCell>
                  {new Date(report.created_at).toLocaleString()}
                </TableCell>

                {(activeTab === 1 || activeTab === 2) && (
                  <>
                    <TableCell
                      sx={{
                        whiteSpace: 'normal',
                        maxWidth: 300,
                        wordBreak: 'break-word',
                        color: report.reviewed_by ? 'inherit' : 'gray',
                        fontStyle: report.reviewed_by ? 'normal' : 'italic',
                      }}
                    >
                      {report.reviewed_by || 'No reviewer email'}
                    </TableCell>

                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        color: report.reviewed_at ? 'inherit' : 'gray',
                        fontStyle: report.reviewed_at ? 'normal' : 'italic',
                      }}
                    >
                      {report.reviewed_at
                        ? new Date(report.reviewed_at).toLocaleString()
                        : 'Not yet reviewed'}
                    </TableCell>
                  </>
                )}

                {activeTab === 2 && (
                  <TableCell
                    sx={{
                      whiteSpace: 'normal',
                      maxWidth: 300,
                      wordBreak: 'break-word',
                      fontStyle: report.remarks ? 'normal' : 'italic',
                      color: report.remarks ? 'inherit' : 'gray',
                    }}
                  >
                    {report.remarks || 'No remarks provided'}
                  </TableCell>
                )}

                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">

                    {/* APPROVE + REJECT only in Pending */}
                    {activeTab === 0 && (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            approvingReportId === report.report_id
                              ? <CircularProgress size={16} color="inherit" />
                              : <CheckCircleOutlineIcon />
                          }
                          onClick={() => onApprove(report.report_id)}
                          sx={{
                            backgroundColor: '#22c55e !important',
                            color: '#fff !important',
                            fontWeight: '600 !important',
                            borderRadius: '0.5rem !important',
                            textTransform: 'none !important',
                          }}
                          disabled={approvingReportId === report.report_id}
                        >
                          {approvingReportId === report.report_id ? 'Approving...' : 'Approve'}
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            rejectingReportId === report.report_id
                              ? <CircularProgress size={16} color="inherit" />
                              : <CancelOutlinedIcon />
                          }
                          onClick={() => onReject(report.report_id)}
                          sx={{
                            backgroundColor: '#ef4444 !important',
                            color: '#fff !important',
                            fontWeight: '600 !important',
                            borderRadius: '0.5rem !important',
                            textTransform: 'none !important',
                          }}
                          disabled={rejectingReportId === report.report_id}
                        >
                          {rejectingReportId === report.report_id ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </>
                    )}

                    {/* PDF BUTTON */}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PictureAsPdfOutlinedIcon />}
                      onClick={() => window.open(report.fileUrl, '_blank')}
                      sx={{
                        backgroundColor: '#2563eb !important',
                        color: '#fff !important',
                        fontWeight: '600 !important',
                        borderRadius: '0.5rem !important',
                        textTransform: 'none !important',
                      }}
                    >
                      PDF
                    </Button>

                    {/* ⭐ FORWARD BUTTON — visible ONLY if userRole !== 'S' */}
                    {userRole !== 'S' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={
                          forwardingReportId === report.report_id
                            ? <CircularProgress size={16} color="inherit" />
                            : <CheckCircleOutlineIcon />
                        }
                        onClick={() => onForward(report.report_id)}
                        disabled={forwardingReportId === report.report_id}
                        sx={{
                          backgroundColor: '#9333ea !important',
                          color: '#fff !important',
                          fontWeight: '600 !important',
                          borderRadius: '0.5rem !important',
                          textTransform: 'none !important',
                        }}
                      >
                        {forwardingReportId === report.report_id
                          ? 'Forwarding...'
                          : 'Forward'}
                      </Button>
                    )}


                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportsTable;
