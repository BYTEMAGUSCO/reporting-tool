import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Pagination,
  Stack,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

import ReportIcon from '@mui/icons-material/Report';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BlockIcon from '@mui/icons-material/Block';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

import ReportsTable from './reporttab/ReportsTable';
import useReports from './reporttab/useReports';
import { showSuccessAlert, showErrorAlert } from '@/services/alert';
import { loginBtnStyles, btnOutlinedStyles } from './reporttab/styles';

const AnimatedCounter = ({ target, color }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 400;
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

const ViewReportsTabFilteredByBarangay = () => {
  const [page, setPage] = useState(1);
  const [userBarangay, setUserBarangay] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState('All');
  const [approvingReportId, setApprovingReportId] = useState(null);
  const [rejectingReportId, setRejectingReportId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [counts, setCounts] = useState({ approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    setUserBarangay(session?.user?.user_metadata?.barangay || null);
    setUserRole(session?.user?.user_metadata?.role || null);
  }, []);

  const { reports, loading, error, totalPages, fetchReports } = useReports(
    userRole,
    selectedBarangay === 'All' ? userBarangay : selectedBarangay,
    page,
    activeTab
  );

  // Fetch barangays list
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barangays`);
        if (!res.ok) throw new Error('Failed to fetch barangays');
        const data = await res.json();
        setBarangays(data);
      } catch (err) {
        console.error('❌ Failed to load barangays:', err);
      }
    };
    fetchBarangays();
  }, []);

  // Recalculate counts for summary cards
  useEffect(() => {
    const approved = reports.filter((r) => r.report_status === 'A').length;
    const pending = reports.filter((r) => r.report_status === 'P').length;
    const rejected = reports.filter((r) => r.report_status === 'D').length;
    setCounts({ approved, pending, rejected });
  }, [reports]);

  const handleApprove = async (reportId) => {
    setApprovingReportId(reportId);
    try {
      const token =
        JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ report_id: reportId }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to approve report');
      }

      await showSuccessAlert('Report approved! 🎉');
      fetchReports(page);
    } catch (error) {
      await showErrorAlert(`Failed to approve: ${error.message}`);
    } finally {
      setApprovingReportId(null);
    }
  };

  const handleReject = (reportId) => {
    setRejectingReportId(reportId);
    setRemarks('');
    setRemarksDialogOpen(true);
  };

  const handleSubmitRemarks = async () => {
    if (!remarks.trim()) {
      await showErrorAlert('Please enter remarks before rejecting.');
      return;
    }

    try {
      const token =
        JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deny-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            report_id: rejectingReportId,
            remarks: remarks.trim(),
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to reject report');
      }

      await showSuccessAlert('Report rejected with remarks!');
      fetchReports(page);
      setRemarksDialogOpen(false);
    } catch (error) {
      await showErrorAlert(`Failed to reject: ${error.message}`);
    } finally {
      setRejectingReportId(null);
      setRemarks('');
    }
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <ReportIcon fontSize="medium" sx={{ color: 'black' }} />
        <Typography variant="h5" fontWeight="bold">
          Submitted Reports {userRole === 'S' ? '(All Barangays)' : ''}
        </Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Barangay Filter Dropdown */}
      {userRole === 'S' && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Filter by Barangay</InputLabel>
          <Select
            value={selectedBarangay}
            label="Filter by Barangay"
            onChange={(e) => setSelectedBarangay(e.target.value)}
          >
            <MenuItem value="All">All Barangays</MenuItem>
            {barangays.map((b) => (
              <MenuItem key={b.id} value={b.name}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Counters Section */}
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
            background: 'linear-gradient(135deg, #facc15, #eab308)',
            color: 'black',
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <HourglassBottomIcon sx={{ fontSize: 36, mb: 1 }} />
            <AnimatedCounter target={counts.pending} color="black" />
            <Typography>Pending Reports</Typography>
          </CardContent>
        </Card>

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
            <DoneAllIcon sx={{ fontSize: 36, mb: 1 }} />
            <AnimatedCounter target={counts.approved} color="white" />
            <Typography>Approved Reports</Typography>
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
            <BlockIcon sx={{ fontSize: 36, mb: 1 }} />
            <AnimatedCounter target={counts.rejected} color="white" />
            <Typography>Rejected Reports</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Tabs */}
      <Paper elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="reports filter tabs"
        >
          <Tab icon={<HourglassBottomIcon />} label="Pending" />
          <Tab icon={<DoneAllIcon />} label="Approved" />
          <Tab icon={<BlockIcon />} label="Rejected" />
        </Tabs>
      </Paper>

      <ReportsTable
        reports={reports}
        approvingReportId={approvingReportId}
        rejectingReportId={rejectingReportId}
        onApprove={handleApprove}
        onReject={handleReject}
        loginBtnStyles={loginBtnStyles}
        btnOutlinedStyles={btnOutlinedStyles}
        activeTab={activeTab}
        loading={loading}
      />

      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Remarks Dialog */}
      <Dialog open={remarksDialogOpen} onClose={() => setRemarksDialogOpen(false)}>
        <DialogTitle>Reject Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Please provide remarks or reasons for rejecting this report:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Remarks"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemarksDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmitRemarks} variant="contained" color="error">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewReportsTabFilteredByBarangay;
