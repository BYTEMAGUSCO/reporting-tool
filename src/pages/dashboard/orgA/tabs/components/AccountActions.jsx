import { useEffect, useState } from 'react';
import { Button, Box, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import approveUser from '@/services/approveUser';
import denyRequest from '@/services/denyRequest';

const AccountActions = ({ account, onActionComplete }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('session'));
    if (session?.access_token) {
      setToken(session.access_token);
    } else {
      console.warn('🛑 No session token found!');
    }
  }, []);

  const handleApprove = async () => {
    if (!token) {
      alert('No valid token found! Please log in again.');
      return;
    }

    const payload = {
      email: account.requester_email,
      password: account.requester_password,
      phone: account.requester_phone,
      name: account.requester_name,
      role: account.requester_role,
      token,
    };

    console.log('📤 Approving user with payload:', payload);

    const result = await approveUser(
      payload.email,
      payload.password,
      payload.phone,
      payload.name,
      payload.role,
      payload.token
    );

    if (result.success) {
      onActionComplete();
    } else {
      console.error('❌ Approval failed:', result.error);
      alert('Failed to approve request: ' + result.error);
    }
  };

  const handleDeny = async () => {
    if (!token) {
      alert('No valid token found! Please log in again.');
      return;
    }

    const payload = {
      email: account.requester_email,
      role: account.requester_role,
      token,
    };

    console.log('📤 Denying user with payload:', payload);

    const result = await denyRequest(payload.email, payload.role, payload.token);

    if (result.success) {
      onActionComplete();
    } else {
      console.error('❌ Denial failed:', result.error);
      alert('Failed to deny request: ' + result.error);
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
        sx={{ textTransform: 'none', fontSize: '0.7rem', px: 1.2, py: 0.3 }}
      >
        ✅ Approve
      </Button>
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={handleDeny}
        sx={{ textTransform: 'none', fontSize: '0.7rem', px: 1.2, py: 0.3 }}
      >
        ❌ Deny
      </Button>
    </Box>
  );
};

export default AccountActions;
