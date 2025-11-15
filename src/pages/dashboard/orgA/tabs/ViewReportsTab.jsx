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
import { showSuccessAlert, showErrorAlert } from '@/services/alert';
import { loginBtnStyles, btnOutlinedStyles } from './reporttab/styles';

const PAGE_SIZE = 10;

// Animated Counter
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
    <Typography variant="h4" fontWeight="bold" color={color}>
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

  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [rejectingReportId, setRejectingReportId] = useState(null);
  const [remarks, setRemarks] = useState('');

  const [activeTab, setActiveTab] = useState(0);

  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [pageReports, setPageReports] = useState([]);

  const [counts, setCounts] = useState({ approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);

  const [forwardingReportId, setForwardingReportId] = useState(null);

  // Load session metadata
  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    setUserBarangay(session?.user?.user_metadata?.barangay || null);
    setUserRole(session?.user?.user_metadata?.role || null);
  }, []);

  // Fetch reports
  useEffect(() => {
    if (!userRole) return;

    const fetchReports = async () => {
      setLoading(true);

      try {
        const session = JSON.parse(sessionStorage.getItem("session"));
        const token = session?.access_token ?? "";
        const userId = session?.user?.id ?? "";

        // Fetch ALL forms (so we know the owners)
        const formsRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms?limit=9999`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const formsJson = await formsRes.json();
        const allForms = formsJson.data || [];

        const formOwnerMap = {};
        allForms.forEach(f => (formOwnerMap[f.form_id] = f.added_by));

        // Fetch ALL reports
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reports?limit=9999`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const json = await res.json();
        const raw = json.data || [];

        console.log("RAW REPORTS FROM BACKEND:", raw);

        // Select final dataset
        let finalReports;

        if (userRole === "S") {
          finalReports = raw.filter(r => r.forward_to_superadmin === true);
        } else {
          finalReports = raw.filter(r => formOwnerMap[r.form_id] === userId);
        }

        // ⭐ FIXED: correct variable
        setAllReports(finalReports);

      } catch (err) {
        await showErrorAlert("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userRole]);

  // Fetch barangays
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barangays`);
        const data = await res.json();
        setBarangays(data);
      } catch (err) {}
    };
    fetchBarangays();
  }, []);

  // Filter logic by role + barangay + status
  useEffect(() => {
    let f = [...allReports];

    if (userRole === "S") {
      f = f.filter(r => r.forward_to_superadmin === true);
    } else if (userRole === "D") {
      if (selectedBarangay !== "All") {
        f = f.filter(r => String(r.barangay) === String(selectedBarangay));
      }
    } else {
      f = f.filter(r => String(r.barangay) === String(userBarangay));
    }

    const statusMap = ['P', 'A', 'D'];
    f = f.filter(r => r.report_status === statusMap[activeTab]);

    setFilteredReports(f);
    setPage(1);
  }, [allReports, selectedBarangay, activeTab, userRole, userBarangay]);

  // Counters
  useEffect(() => {
    let data = [...allReports];

    if (userRole === "S" || userRole === "D") {
      if (selectedBarangay !== "All") {
        data = data.filter(r => String(r.barangay) === String(selectedBarangay));
      }
    } else {
      data = data.filter(r => String(r.barangay) === String(userBarangay));
    }

    setCounts({
      approved: data.filter(r => r.report_status === "A").length,
      pending: data.filter(r => r.report_status === "P").length,
      rejected: data.filter(r => r.report_status === "D").length,
    });
  }, [allReports, selectedBarangay, userRole, userBarangay]);

  // Pagination
  useEffect(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setPageReports(filteredReports.slice(start, end));
  }, [filteredReports, page]);

  // Approve
  const handleApprove = async (id) => {
    try {
      const token = JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ report_id: id }),
        }
      );
      if (!res.ok) throw new Error();
      await showSuccessAlert('Report approved!');
    } catch (err) {
      await showErrorAlert('Failed to approve');
    }
  };

  // Reject
  const handleSubmitRemarks = async () => {
    if (!remarks.trim()) return showErrorAlert('Enter remarks');
    try {
      const token = JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deny-report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ report_id: rejectingReportId, remarks }),
        }
      );
      if (!res.ok) throw new Error();
      await showSuccessAlert('Rejected!');
    } catch (err) {
      await showErrorAlert('Failed to reject');
    } finally {
      setRemarks('');
      setRemarksDialogOpen(false);
    }
  };

  // Forward
  const handleForward = async (reportId) => {
    try {
      setForwardingReportId(reportId);

      const session = JSON.parse(sessionStorage.getItem("session"));
      const token = session?.access_token ?? "";

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/forward-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ report_id: reportId }),
        }
      );

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to forward");

      await showSuccessAlert("Report forwarded!");
    } catch (err) {
      await showErrorAlert(err.message);
    } finally {
      setForwardingReportId(null);
    }
  };

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <ReportIcon />
        <Typography variant="h5" fontWeight="bold">
          Submitted Reports {userRole === 'S' ? '(All Barangays)' : ''}
        </Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {(userRole === 'S' || userRole === 'D') && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Filter by Barangay</InputLabel>
          <Select
            value={selectedBarangay}
            label="Filter by Barangay"
            onChange={(e) => setSelectedBarangay(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {barangays.map((b) => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <Card sx={{ flex: 1, background: '#facc15' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <HourglassBottomIcon />
            <AnimatedCounter target={counts.pending} color="black" />
            <Typography>Pending</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, background: '#22c55e', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <DoneAllIcon />
            <AnimatedCounter target={counts.approved} color="white" />
            <Typography>Approved</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, background: '#ef4444', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <BlockIcon />
            <AnimatedCounter target={counts.rejected} color="white" />
            <Typography>Rejected</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Paper elevation={2} sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
          <Tab icon={<HourglassBottomIcon />} label="Pending" />
          <Tab icon={<DoneAllIcon />} label="Approved" />
          <Tab icon={<BlockIcon />} label="Rejected" />
        </Tabs>
      </Paper>

      <ReportsTable
        reports={pageReports}
        loading={loading}
        activeTab={activeTab}
        onApprove={handleApprove}
        onReject={(id) => {
          setRejectingReportId(id);
          setRemarksDialogOpen(true);
        }}
        onForward={handleForward}
        forwardingReportId={forwardingReportId}
      />

      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(filteredReports.length / PAGE_SIZE)}
          page={page}
          onChange={(_, v) => setPage(v)}
        />
      </Box>

      <Dialog open={remarksDialogOpen} onClose={() => setRemarksDialogOpen(false)}>
        <DialogTitle>Reject Report</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemarksDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleSubmitRemarks}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewReportsTabFilteredByBarangay;
