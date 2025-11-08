import { useState, useMemo, useEffect } from 'react';
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Chip,
  Skeleton,
  Pagination,
  Divider,
  Tooltip,
} from '@mui/material';

import AccountsControlPanel from '@/services/AccountsControlPanel';
import useRejectedAccounts from '@/services/useRejectedAccounts';
import { getBarangays } from '@/services/BarangayService';

const PAGE_LIMIT = 8;

const RejectedAccountsTab = () => {
  const token = JSON.parse(sessionStorage.getItem('session'))?.access_token;
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    searchTerm: '',
    org: 'all',
    approval: 'all',
    sortBy: 'name',
  });

  const { data = {}, loading } = useRejectedAccounts(token, page, PAGE_LIMIT);
  const [barangays, setBarangays] = useState([]);

  // Fetch barangays once
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const result = await getBarangays(token);
        setBarangays(result || []);
      } catch (err) {
        // no need to console.error every time
      }
    };
    fetchBarangays();
  }, [token]);

  const getBarangayName = (id) =>
    barangays.find((b) => b.id === id)?.name || 'Unknown';

  const filteredSortedAccounts = useMemo(() => {
    let allAccounts = data.data || [];
    const { searchTerm, org, sortBy } = filters;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      allAccounts = allAccounts.filter(
        (acc) =>
          acc.requester_name.toLowerCase().includes(term) ||
          acc.requester_email.toLowerCase().includes(term)
      );
    }

    if (org !== 'all') {
      allAccounts = allAccounts.filter((acc) => acc.requester_role === org);
    }

    allAccounts = allAccounts.filter((acc) => acc.request_status === 'D');

    allAccounts.sort((a, b) => {
      if (sortBy === 'dateCreated') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return a[sortBy]?.localeCompare(b[sortBy]) ?? 0;
    });

    return allAccounts;
  }, [data.data, filters]);

  return (
    <Box sx={{ px: 2, py: 2, borderRadius: '0.5rem' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          View Rejected Accounts
        </Typography>
      </Box>

      <Box sx={{ borderRadius: '0.5rem' }}>
        <AccountsControlPanel filters={filters} setFilters={setFilters} />
      </Box>

      <Divider sx={{ my: 2, borderRadius: '0.5rem' }} />

      <Box
        sx={{
          overflowX: 'auto',
          maxHeight: '60vh',
          overflowY: 'auto',
          borderRadius: '0.5rem',
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            minWidth: 1200,
            borderRadius: '0.5rem',
            '& thead': {
              backgroundColor: '#f5f7fa',
            },
            '& thead th': {
              borderRadius: '0.5rem 0.5rem 0 0',
            },
            '& tbody tr:last-child td': {
              borderRadius: '0 0 0.5rem 0.5rem',
            },
          }}
        >
          <TableHead>
  <TableRow>
    <TableCell><strong>Name</strong></TableCell>
    <TableCell><strong>Email</strong></TableCell>
    <TableCell><strong>Role</strong></TableCell>
    <TableCell><strong>Phone</strong></TableCell>
    <TableCell><strong>Barangay</strong></TableCell>
    <TableCell><strong>Date</strong></TableCell>
    <TableCell><strong>Remarks</strong></TableCell>
    <TableCell><strong>Denied By</strong></TableCell>
    <TableCell><strong>Status</strong></TableCell>
  </TableRow>
</TableHead>

<TableBody>
  {loading ? (
    Array.from({ length: PAGE_LIMIT }).map((_, i) => (
      <TableRow key={i}>
        {Array(9).fill().map((_, j) => (
          <TableCell key={j} sx={{ py: 0.5 }}>
            <Skeleton variant="text" height={20} sx={{ borderRadius: '0.5rem' }} />
          </TableCell>
        ))}
      </TableRow>
    ))
  ) : filteredSortedAccounts.length === 0 ? (
    <TableRow>
      <TableCell colSpan={9}>
        <Typography variant="body2" align="center" sx={{ py: 2 }}>
          No rejected accounts found.
        </Typography>
      </TableCell>
    </TableRow>
  ) : (
    filteredSortedAccounts.map((acc, i) => (
      <TableRow key={i} hover sx={{ borderRadius: '0.5rem' }}>
        <TableCell>{acc.requester_name}</TableCell>
        <TableCell>{acc.requester_email}</TableCell>
        <TableCell>{acc.requester_role}</TableCell>
        <TableCell>{acc.requester_phone}</TableCell>
        <TableCell>{getBarangayName(acc.requester_barangay)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {new Date(acc.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell sx={{ maxWidth: 200 }}>
          <Tooltip title={acc.remarks || 'No remarks provided'}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {acc.remarks || '—'}
            </Typography>
          </Tooltip>
        </TableCell>

        {/* NEW: Denied By column */}
        <TableCell sx={{ maxWidth: 180 }}>
          <Tooltip title={acc.denied_by_email || 'Unknown'}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {acc.denied_by || '—'}
            </Typography>
          </Tooltip>
        </TableCell>

        <TableCell>
          <Chip
            label="Rejected"
            color="error"
            size="small"
            sx={{ fontSize: '0.7rem', height: '22px', borderRadius: '0.5rem' }}
          />
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>

        </Table>
      </Box>

      <Box display="flex" justifyContent="center" mt={3} sx={{ borderRadius: '0.5rem' }}>
        <Pagination
          count={data.totalPages || 1}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          sx={{ borderRadius: '0.5rem' }}
        />
      </Box>
    </Box>
  );
};

export default RejectedAccountsTab;
