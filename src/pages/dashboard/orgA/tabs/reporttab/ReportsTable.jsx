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
  loginBtnStyles,
  btnOutlinedStyles,
  activeTab, // 0 = Pending, 1 = Approved, 2 = Denied
  loading,  // <--- add loading prop here
}) => {
  const statusMap = {
    0: 'P',
    1: 'A',
    2: 'D',
  };

  const filteredReports = reports.filter(
    (report) => report.report_status === statusMap[activeTab]
  );

  // Show 5 skeleton rows while loading
  if (loading) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Report Name</StyledTableCell>
              <StyledTableCell>Submitted On</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="nowrap">
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
            <StyledTableCell align="right">Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredReports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 3, fontStyle: 'italic' }}>
                No reports found for this category.
              </TableCell>
            </TableRow>
          ) : (
            filteredReports.map((report) => (
              <TableRow key={report.report_id} hover>
                <TableCell>{report.report_name || 'Unnamed Report'}</TableCell>
                <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="nowrap">
                    {activeTab === 0 && (
                      <>
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
                          sx={{ ...loginBtnStyles, minWidth: 90, px: 1.5, borderRadius: 2, textTransform: 'none' }}
                          disabled={approvingReportId === report.report_id}
                        >
                          {approvingReportId === report.report_id ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={
                            rejectingReportId === report.report_id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <CancelOutlinedIcon />
                            )
                          }
                          onClick={() => onReject(report.report_id)}
                          sx={{ ...btnOutlinedStyles, minWidth: 80, px: 1.5, borderRadius: 2, textTransform: 'none' }}
                          disabled={rejectingReportId === report.report_id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PictureAsPdfOutlinedIcon />}
                      onClick={() => window.open(report.fileUrl, '_blank')}
                      sx={{ ...loginBtnStyles, minWidth: 80, px: 1.5, borderRadius: 2, textTransform: 'none' }}
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
