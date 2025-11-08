import { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import approveUser from '@/services/approveUser';
import denyRequest from '@/services/denyRequest';
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from '@/services/alert';

const AccountActions = ({ account, onActionComplete }) => {
  const [token, setToken] = useState(null);
  const [approving, setApproving] = useState(false);
  const [denying, setDenying] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    if (session?.access_token) {
      setToken(session.access_token);
    }
  }, []);

  const handleApprove = async () => {
    const confirmed = await showConfirmAlert(`Approve ${account.requester_name}?`);
    if (!confirmed) return;

    if (!token) {
      showErrorAlert('No valid token found! Please log in again.');
      return;
    }

    setApproving(true);
    const payload = {
      email: account.requester_email,
      password: account.requester_password,
      phone: account.requester_phone,
      name: account.requester_name,
      role: account.requester_role,
      barangay: account.requester_barangay,
      token,
    };

    try {
      const result = await approveUser(
        payload.email,
        payload.password,
        payload.phone,
        payload.name,
        payload.role,
        payload.barangay,
        payload.token
      );

      if (result.success) {
        await showSuccessAlert(`${payload.name} has been approved.`);
        onActionComplete();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      showErrorAlert('Failed to approve request: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleDenyClick = async () => {
    const confirmed = await showConfirmAlert(`Reject ${account.requester_name}?`);
    if (confirmed) {
      setOpenDialog(true);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setRemarks('');
  };

  const handleConfirmDeny = async () => {
    if (!remarks.trim()) {
      showErrorAlert('Please provide remarks before rejecting.');
      return;
    }

    if (!token) {
      showErrorAlert('No valid token found! Please log in again.');
      return;
    }

    setDenying(true);
    setOpenDialog(false);

    const payload = {
      email: account.requester_email,
      role: account.requester_role,
      remarks,
      token,
    };

    try {
      const result = await denyRequest(payload.email, payload.role, payload.token, payload.remarks);

      if (result.success) {
        await showSuccessAlert(`${account.requester_name} has been rejected.`);
        onActionComplete();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      showErrorAlert('Failed to reject request: ' + err.message);
    } finally {
      setDenying(false);
      setRemarks('');
    }
  };

  if (account.request_status !== 'P') {
    return (
      <IconButton size="small">
        <MoreVertIcon fontSize="small" />
      </IconButton>
    );
  }

  return (
    <>
      <Box display="flex" gap={1} justifyContent="flex-end">
        {/* ✅ APPROVE BUTTON */}
        <Button
          variant="contained"
          size="small"
          onClick={handleApprove}
          disabled={approving || denying}
          sx={{
            backgroundColor: '#22c55e !important', // green
            borderColor: '#16a34a !important',
            color: '#fff !important',
            textTransform: 'none !important',
            fontSize: '0.8rem !important',
            px: 1.8,
            py: 0.7,
            fontWeight: '600 !important',
            borderRadius: '0.5rem !important',
            borderWidth: 2,
            '&:hover': {
              backgroundColor: '#16a34a !important',
              borderColor: '#15803d !important',
              transform: 'scale(0.97)',
            },
            '&:disabled': {
              backgroundColor: '#86efac !important',
              color: '#f0fdf4 !important',
            },
          }}
          startIcon={!approving && <CheckCircleIcon fontSize="small" />}
        >
          {approving ? <CircularProgress size={16} color="inherit" /> : 'Approve'}
        </Button>

        {/* ❌ REJECT BUTTON */}
        <Button
          variant="contained"
          size="small"
          onClick={handleDenyClick}
          disabled={denying || approving}
          sx={{
            backgroundColor: '#ef4444 !important', // red
            borderColor: '#b91c1c !important',
            color: '#fff !important',
            textTransform: 'none !important',
            fontSize: '0.8rem !important',
            px: 1.8,
            py: 0.7,
            fontWeight: '600 !important',
            borderRadius: '0.5rem !important',
            borderWidth: 2,
            '&:hover': {
              backgroundColor: '#dc2626 !important',
              borderColor: '#991b1b !important',
              transform: 'scale(0.97)',
            },
            '&:disabled': {
              backgroundColor: '#fecaca !important',
              color: '#fee2e2 !important',
            },
          }}
          startIcon={!denying && <CancelIcon fontSize="small" />}
        >
          {denying ? <CircularProgress size={16} color="inherit" /> : 'Reject'}
        </Button>
      </Box>

      {/* Remarks Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Enter Remarks</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Remarks"
            type="text"
            fullWidth
            multiline
            minRows={3}
            variant="outlined"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ color: '#64748b !important' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeny}
            sx={{
              backgroundColor: '#ef4444 !important',
              color: '#fff !important',
              '&:hover': {
                backgroundColor: '#dc2626 !important',
              },
            }}
            variant="contained"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountActions;
