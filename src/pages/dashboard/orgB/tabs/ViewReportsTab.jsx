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
  Card,
  CardContent,
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
  const [stats, setStats] = useState({ approved: 0, pending: 0, rejected: 0 });

  // Tabs: 0=approved, 1=pending, 2=rejected
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    setUserBarangay(session?.user?.user_metadata?.barangay || null);
    setUserRole(session?.user?.user_metadata?.role || null);
  }, []);

  const fetchReports = async (pageNumber = 1) => {
    if (!userRole) return;
    setLoading(true);
    setError(null);
    try {
      const token = JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reports?page=${pageNumber}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to load reports');
      }
      const json = await res.json();
      let filteredReports = json.data || [];

      if (userRole === 'S') {
        filteredReports = json.data || [];
      } else if (userBarangay) {
        filteredReports = json.data.filter((r) => r.barangay === userBarangay);
      }

      // Count stats
      const approvedCount = filteredReports.filter((r) => r.report_status === 'A').length;
      const pendingCount = filteredReports.filter((r) => r.report_status === 'P').length;
      const rejectedCount = filteredReports.filter((r) => r.report_status === 'D').length;
      setStats({ approved: approvedCount, pending: pendingCount, rejected: rejectedCount });

      // Filter by tab:
      const tabFiltered = filteredReports.filter((r) => {
        if (activeTab === 0) return r.report_status === 'A';
        if (activeTab === 1) return r.report_status === 'P';
        return r.report_status === 'D';
      });

      setReports(tabFiltered);
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

  // Simple animated counter hook
  const AnimatedCounter = ({ target, color }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const duration = 500;
      const step = Math.ceil(target / 20);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, duration / 20);
      return () => clearInterval(timer);
    }, [target]);
    return (
      <Typography
        variant="h4"
        fontWeight="bold"
        color={color}
        sx={{ fontSize: '2rem', transition: '0.3s ease' }}
      >
        {count}
      </Typography>
    );
  };

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <ReportIcon fontSize="medium" sx={{ color: 'black' }} />
          <Typography variant="h5" fontWeight="bold">
            Submitted Reports {userRole !== 'S' ? 'in Your Barangay' : ''}
          </Typography>
        </Stack>

        {/* 🔥 Status Counters Section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <DoneAllIcon sx={{ fontSize: 40, mb: 1 }} />
              <AnimatedCounter target={stats.approved} color="white" />
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Approved Reports
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #facc15, #eab308)',
              color: 'black',
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <HourglassEmptyIcon sx={{ fontSize: 40, mb: 1 }} />
              <AnimatedCounter target={stats.pending} color="black" />
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Pending Reports
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <BlockIcon sx={{ fontSize: 40, mb: 1 }} />
              <AnimatedCounter target={stats.rejected} color="white" />
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Rejected Reports
              </Typography>
            </CardContent>
          </Card>
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
        >
          <Tab icon={<DoneAllIcon />} iconPosition="start" label="Approved" />
          <Tab icon={<HourglassEmptyIcon />} iconPosition="start" label="Pending" />
          <Tab icon={<BlockIcon />} iconPosition="start" label="Rejected" />
        </Tabs>

        {/* Table */}
        {loading ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Report Name</StyledTableCell>
                  <StyledTableCell>Submitted On</StyledTableCell>
                  {activeTab === 2 && <StyledTableCell>Remarks</StyledTableCell>}
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(SKELETON_ROW_COUNT)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                    {activeTab === 2 && (
                      <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                    )}
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
  <Table size="small">
    <TableHead>
      <TableRow>
        <StyledTableCell>Report Name</StyledTableCell>
        <StyledTableCell>Submitted On</StyledTableCell>
        {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
          <StyledTableCell>{activeTab === 0 ? '' : activeTab === 1 ? 'Approved By' : 'Denied By'}</StyledTableCell>
        )}
        {activeTab === 2 && <StyledTableCell>Remarks</StyledTableCell>}
        <StyledTableCell align="right">Actions</StyledTableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {reports.map((report) => (
        <TableRow key={report.report_id}>
          <TableCell>{report.report_name || 'Unnamed Report'}</TableCell>
          <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>

          {(activeTab === 1 || activeTab === 2) && (
            <TableCell
              sx={{
                whiteSpace: 'normal',
                maxWidth: 300,
                wordBreak: 'break-word',
                fontStyle: report.approved_by || report.denied_by ? 'normal' : 'italic',
                color: report.approved_by || report.denied_by ? 'inherit' : 'gray',
              }}
            >
              {report.approved_by || report.denied_by || 'N/A'}
            </TableCell>
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
                  color: 'black',
                  boxShadow: '0 3px 6px rgba(128,128,128,0.4)',
                  '&:hover': { backgroundColor: '#fbbf24' },
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
