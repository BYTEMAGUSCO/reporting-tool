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

const PAGE_SIZE = 10;
const SKELETON_ROW_COUNT = 5;

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
      fontSize: '0.875rem',
    }}
  />
);

const ViewReportsTabFilteredByBarangay = () => {
  const [allReports, setAllReports] = useState([]);       // ✅ full list
  const [filteredReports, setFilteredReports] = useState([]); // ✅ after tab + barangay
  const [pageItems, setPageItems] = useState([]);         // ✅ sliced items for the table

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [userBarangay, setUserBarangay] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [stats, setStats] = useState({ approved: 0, pending: 0, rejected: 0 });

  

  // Tabs: 0=approved, 1=pending, 2=rejected
  const [activeTab, setActiveTab] = useState(0);

  // Get session info
  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    setUserBarangay(session?.user?.user_metadata?.barangay || null);
    setUserRole(session?.user?.user_metadata?.role || null);
  }, []);

  // ✅ Fetch ALL reports ONCE
  const fetchReports = async () => {
    if (!userRole) return;

    setLoading(true);
    try {
      const token = JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reports?limit=9999`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await res.json();
      const data = json.data || [];

      // ✅ Filter by barangay if not superadmin
      const barangayFiltered =
        userRole === 'S' ? data : data.filter((r) => r.barangay === userBarangay);

      setAllReports(barangayFiltered);
    } catch (err) {
      console.error('❌ Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole) fetchReports();
  }, [userRole, userBarangay]);

  // ✅ Recalculate stats + tab filters whenever allReports or tab changes
  useEffect(() => {
    const approved = allReports.filter((r) => r.report_status === 'A');
    const pending = allReports.filter((r) => r.report_status === 'P');
    const rejected = allReports.filter((r) => r.report_status === 'D');

    setStats({
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
    });

    // ✅ Tab filtering
    let t = [];
    if (activeTab === 0) t = approved;
    if (activeTab === 1) t = pending;
    if (activeTab === 2) t = rejected;

    setFilteredReports(t);
    setPage(1); // reset to page 1 on tab switch
  }, [allReports, activeTab]);

  // ✅ Slice page items
  useEffect(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setPageItems(filteredReports.slice(start, end));
  }, [filteredReports, page]);

  // ✅ Simple animated counter
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
      <Typography variant="h4" fontWeight="bold" color={color}>
        {count}
      </Typography>
    );
  };

  const actionColumnLabel = activeTab === 1 ? 'View' : 'Actions';


  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <ReportIcon fontSize="medium" sx={{ color: 'black' }} />
          <Typography variant="h5" fontWeight="bold">
            Submitted Reports {userRole !== 'S' ? 'in Your Barangay' : ''}
          </Typography>
        </Stack>

        {/* ✅ Counters */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
          <Card sx={{ flex: 1, p: 2, background: '#22c55e', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <DoneAllIcon sx={{ fontSize: 40 }} />
              <AnimatedCounter target={stats.approved} color="white" />
              <Typography>Approved</Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, p: 2, background: '#facc15' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <HourglassEmptyIcon sx={{ fontSize: 40 }} />
              <AnimatedCounter target={stats.pending} color="black" />
              <Typography>Pending</Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, p: 2, background: '#ef4444', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <BlockIcon sx={{ fontSize: 40 }} />
              <AnimatedCounter target={stats.rejected} color="white" />
              <Typography>Rejected</Typography>
            </CardContent>
          </Card>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* ✅ Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab icon={<DoneAllIcon />} label="Approved" />
          <Tab icon={<HourglassEmptyIcon />} label="Pending" />
          <Tab icon={<BlockIcon />} label="Rejected" />
        </Tabs>

        {/* ✅ Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell>Report Name</StyledTableCell>
                <StyledTableCell>Submitted On</StyledTableCell>
                {(activeTab === 0 || activeTab === 2) && (
                  <StyledTableCell>
                    {activeTab === 0 ? 'Approved By' : 'Denied By'}
                  </StyledTableCell>
                )}
                {activeTab === 2 && <StyledTableCell>Remarks</StyledTableCell>}
                <StyledTableCell align="right">{actionColumnLabel}</StyledTableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {pageItems.map((report) => (
                <TableRow key={report.report_id}>
                  <TableCell>{report.report_name}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>

                  {(activeTab === 0 || activeTab === 2) && (
                    <TableCell>{report.reviewed_by || 'N/A'}</TableCell>
                  )}

                  {activeTab === 2 && (
                    <TableCell>{report.remarks || 'No remarks'}</TableCell>
                  )}

                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PictureAsPdfOutlinedIcon />}
                      onClick={() => window.open(report.fileUrl, '_blank')}
                      sx={{ background: '#facc15', color: 'black' }}
                    >
                      View PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ✅ Pagination */}
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(filteredReports.length / PAGE_SIZE)}
            page={page}
            onChange={(_, v) => setPage(v)}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ViewReportsTabFilteredByBarangay;
