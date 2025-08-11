import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Skeleton,
} from '@mui/material';

import ReportIcon from '@mui/icons-material/Report';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BlockIcon from '@mui/icons-material/Block';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const StyledTableCell = (props) => (
  <TableCell
    {...props}
    sx={{
      fontWeight: 'bold',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      backgroundColor: 'transparent',
      color: 'black',
      paddingY: 1,
      paddingX: 2,
      textTransform: 'none',
      fontSize: '0.875rem',
    }}
  />
);

const SKELETON_ROW_COUNT = 5;

const ViewReportsTabFilteredByBarangay = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userBarangay, setUserBarangay] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Tabs: 0=approved, 1=pending, 2=rejected
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    setUserBarangay(session?.user?.user_metadata?.barangay || null);
    setUserRole(session?.user?.user_metadata?.role || null);
  }, []);

  useEffect(() => {
  const session = JSON.parse(sessionStorage.getItem('session'));
  const brgy = session?.user?.user_metadata?.barangay || null;
  setUserBarangay(brgy);
  setUserRole(session?.user?.user_metadata?.role || null);

  console.log('[User Barangay]', brgy);  // <-- here it is, logging your barangay info
}, []);


  const fetchReports = async (pageNumber = 1) => {
    if (!userRole) return;
    setLoading(true);
    setError(null);
    try {
      const token = JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reports?page=${pageNumber}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to load reports');
      }
      const json = await res.json();
      console.log('🔥 Full reports API response:', json);

        let filteredReports = json.data || [];

        if (userRole === 'S') {
        // Superadmin sees ALL reports, no filter
        filteredReports = json.data || [];
        } else if (userBarangay) {
        // Regular user sees only their barangay’s reports
        filteredReports = json.data.filter(report => report.barangay === userBarangay);
        }


      // Filter by tab:
      // 0 = approved => report_status === "A"
      // 1 = pending => report_status === "P"
      // 2 = rejected => report_status !== "A" && !== "P"
      const tabFilteredReports = filteredReports.filter((r) => {
        if (activeTab === 0) return r.report_status === 'A';
        if (activeTab === 1) return r.report_status === 'P';
        return r.report_status !== 'A' && r.report_status !== 'P';
      });

      setReports(tabFilteredReports);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole) fetchReports(page);
  }, [userRole, userBarangay, page, activeTab]);

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <ReportIcon fontSize="medium" sx={{ color: 'black' }} />
          <Typography variant="h5" fontWeight="bold">
            Submitted Reports {userRole !== 'S' ? 'in Your Barangay' : ''}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* MUI Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 2 }}
          aria-label="reports filter tabs"
        >
          <Tab
            icon={<DoneAllIcon />}
            iconPosition="start"
            label="Approved"
            id="tab-approved"
            aria-controls="tabpanel-approved"
          />
          <Tab
            icon={<HourglassEmptyIcon />}
            iconPosition="start"
            label="Pending"
            id="tab-pending"
            aria-controls="tabpanel-pending"
          />
          <Tab
            icon={<BlockIcon />}
            iconPosition="start"
            label="Rejected"
            id="tab-rejected"
            aria-controls="tabpanel-rejected"
          />
        </Tabs>

        {loading ? (
          <TableContainer>
            <Table size="small" aria-label="loading reports skeleton">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Report Name</StyledTableCell>
                  <StyledTableCell>Submitted On</StyledTableCell>
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(SKELETON_ROW_COUNT)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton variant="text" width="60%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width="40%" />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="rectangular" width={90} height={30} sx={{ borderRadius: 1 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : error ? (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : reports.length === 0 ? (
          <Typography textAlign="center" py={3}>
            No reports submitted yet. 😴
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small" aria-label="submitted reports table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Report Name</StyledTableCell>
                  <StyledTableCell>Submitted On</StyledTableCell>
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.report_id}>
                    <TableCell>{report.report_name || 'Unnamed Report'}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PictureAsPdfOutlinedIcon />}
                          onClick={() => window.open(report.fileUrl, '_blank')}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            borderRadius: '0.5rem',
                            backgroundColor: '#facc15',
                            boxShadow: '0 3px 6px rgba(128, 128, 128, 0.4)',
                            color: 'black',
                            px: 2,
                            py: 1,
                            '&:hover': {
                              backgroundColor: '#fbbf24',
                            },
                          }}
                        >
                          View PDF
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ViewReportsTabFilteredByBarangay;
