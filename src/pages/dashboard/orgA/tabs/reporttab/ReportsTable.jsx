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

const StyledTableCell = (props) => (
  <TableCell
    {...props}
    sx={{
      fontWeight: 'bold',
      color: 'black',
      whiteSpace: 'nowrap',
      textTransform: 'none',
      fontSize: '0.875rem',
      paddingY: 1,
      paddingX: 2,
    }}
  />
);

const ReportsTable = ({
  reports,
  approvingReportId,
  rejectingReportId,
  onApprove,
  onReject,
  activeTab, // 0 = Pending, 1 = Approved, 2 = Denied
  loading,
}) => {
  const statusMap = {
    0: 'P',
    1: 'A',
    2: 'D',
  };

  const filteredReports = reports.filter(
    (report) => report.report_status === statusMap[activeTab]
  );

  // ✅ Log approved reports only
  if (statusMap[activeTab] === 'A') {
    console.log('[✅ Approved Reports]', filteredReports);
  }

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
                    {/* ✅ Unified Reviewed By */}
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

                    {/* ✅ Reviewed At */}
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
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-end"
                    flexWrap="nowrap"
                  >
                    {activeTab === 0 && (
                      <>
                        {/* APPROVE */}
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            approvingReportId === report.report_id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <CheckCircleOutlineIcon />
                            )
                          }
                          onClick={() => onApprove(report.report_id)}
                          sx={{
                            backgroundColor: '#22c55e !important',
                            color: '#fff !important',
                            fontWeight: '600 !important',
                            borderRadius: '0.5rem !important',
                            textTransform: 'none !important',
                            px: 1.8,
                            py: 0.6,
                            '&:hover': {
                              backgroundColor: '#16a34a !important',
                              transform: 'scale(0.97)',
                            },
                            '&:disabled': {
                              backgroundColor: '#86efac !important',
                              color: '#f0fdf4 !important',
                            },
                          }}
                          disabled={approvingReportId === report.report_id}
                        >
                          {approvingReportId === report.report_id
                            ? 'Approving...'
                            : 'Approve'}
                        </Button>

                        {/* REJECT */}
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={
                            rejectingReportId === report.report_id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <CancelOutlinedIcon />
                            )
                          }
                          onClick={() => onReject(report.report_id)}
                          sx={{
                            backgroundColor: '#ef4444 !important',
                            color: '#fff !important',
                            fontWeight: '600 !important',
                            borderRadius: '0.5rem !important',
                            textTransform: 'none !important',
                            px: 1.8,
                            py: 0.6,
                            '&:hover': {
                              backgroundColor: '#dc2626 !important',
                              transform: 'scale(0.97)',
                            },
                            '&:disabled': {
                              backgroundColor: '#fecaca !important',
                              color: '#fee2e2 !important',
                            },
                          }}
                          disabled={rejectingReportId === report.report_id}
                        >
                          {rejectingReportId === report.report_id
                            ? 'Rejecting...'
                            : 'Reject'}
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
                        px: 1.8,
                        py: 0.6,
                        '&:hover': {
                          backgroundColor: '#1d4ed8 !important',
                          transform: 'scale(0.97)',
                        },
                      }}
                    >
                      PDF
                    </Button>
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
