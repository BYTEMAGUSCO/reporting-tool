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
} from '@mui/material';

import ReportIcon from '@mui/icons-material/Report';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import BlockIcon from '@mui/icons-material/Block';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

import ReportsTable from './reporttab/ReportsTable';
import useReports from './reporttab/useReports';
import { showSuccessAlert, showErrorAlert } from '@/services/alert';
import { loginBtnStyles, btnOutlinedStyles } from './reporttab/styles';

const ViewReportsTabFilteredByBarangay = () => {
  const [page, setPage] = useState(1);
  const [userBarangay, setUserBarangay] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [approvingReportId, setApprovingReportId] = useState(null);
  const [rejectingReportId, setRejectingReportId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    setUserBarangay(session?.user?.user_metadata?.barangay || null);
    setUserRole(session?.user?.user_metadata?.role || null);
  }, []);

  const { reports, loading, error, totalPages, fetchReports } = useReports(
    userRole,
    userBarangay,
    page,
    activeTab
  );

  const statusMap = {
    0: 'P', // Pending
    1: 'A', // Approved
    2: 'D', // Denied
  };

  const filteredReports = reports.filter(
    (report) => report.report_status === statusMap[activeTab]
  );

  const handleApprove = async (reportId) => {
    setApprovingReportId(reportId);
    try {
      const token =
        JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
      const res = await fetch(
        'https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/approve-report',
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

  // Opens the remarks dialog before submitting the rejection
  const handleReject = (reportId) => {
    setRejectingReportId(reportId);
    setRemarks('');
    setRemarksDialogOpen(true);
  };

  // Handles submitting the remarks
  const handleSubmitRemarks = async () => {
    if (!remarks.trim()) {
      await showErrorAlert('Please enter remarks before rejecting.');
      return;
    }

    try {
      const token =
        JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
      const res = await fetch(
        'https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/deny-report',
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
          Submitted Reports {userRole !== 'S' ? '' : ''}
        </Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

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
        reports={filteredReports}
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
