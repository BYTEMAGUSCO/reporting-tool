import { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Button,
  CircularProgress,
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

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    if (session?.access_token) {
      setToken(session.access_token);
    } else {
      // console.warn('🛑 No session token found!');
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
      barangay: account.requester_barangay, // 🆕 NEW: include barangay
      token,
    };

    try {
      const result = await approveUser(
        payload.email,
        payload.password,
        payload.phone,
        payload.name,
        payload.role,
        payload.barangay, // 🆕 pass barangay here
        payload.token
      );

      if (result.success) {
        await showSuccessAlert(`${payload.name} has been approved.`);
        onActionComplete();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      // console.error('❌ Approval failed:', err.message);
      showErrorAlert('Failed to approve request: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleDeny = async () => {
    const confirmed = await showConfirmAlert(`Reject ${account.requester_name}?`);
    if (!confirmed) return;

    if (!token) {
      showErrorAlert('No valid token found! Please log in again.');
      return;
    }

    setDenying(true);
    const payload = {
      email: account.requester_email,
      role: account.requester_role,
      token,
    };

    try {
      const result = await denyRequest(payload.email, payload.role, payload.token);

      if (result.success) {
        await showSuccessAlert(`${account.requester_name} has been rejected.`);
        onActionComplete();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      // console.error('❌ Denial failed:', err.message);
      showErrorAlert('Failed to reject request: ' + err.message);
    } finally {
      setDenying(false);
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
    <Box display="flex" gap={1} justifyContent="flex-end">
      <Button
        variant="outlined"
        color="success"
        size="small"
        onClick={handleApprove}
        disabled={approving || denying}
        sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
          px: 1.5,
          py: 0.5,
          borderRadius: '0.5rem',
          borderWidth: 2,
        }}
        startIcon={!approving && <CheckCircleIcon fontSize="small" />}
      >
        {approving ? <CircularProgress size={16} color="inherit" /> : 'Approve'}
      </Button>

      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={handleDeny}
        disabled={denying || approving}
        sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
          px: 1.5,
          py: 0.5,
          borderRadius: '0.5rem',
          borderWidth: 2,
        }}
        startIcon={!denying && <CancelIcon fontSize="small" />}
      >
        {denying ? <CircularProgress size={16} color="inherit" /> : 'Reject'}
      </Button>
    </Box>
  );
};

export default AccountActions;
