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
} from '@mui/material';

import AccountsControlPanel from '@/services/AccountsControlPanel';
import useApprovedAccounts from '@/services/useApprovedAccounts';
import { getBarangays } from '@/services/BarangayService';

const PAGE_LIMIT = 8;

const ApprovedAccountsTab = () => {
  const token = JSON.parse(sessionStorage.getItem('session'))?.access_token;
  const [page, setPage] = useState(1);
  const [barangays, setBarangays] = useState([]);

  const [filters, setFilters] = useState({
    searchTerm: '',
    org: 'all',
    approval: 'all',
    sortBy: 'name',
  });

  const { data, loading, refetch } = useApprovedAccounts(token, page, PAGE_LIMIT);

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const result = await getBarangays(token);
        setBarangays(result);
        // console.log('[📍 Barangays]', result);
      } catch (err) {
        // console.error('Failed to load barangays', err);
      }
    };

    fetchBarangays();
  }, [token]);

  const getBarangayName = (id) => {
    return barangays.find((b) => b.id === id)?.name || 'Unknown';
  };

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

    allAccounts = allAccounts.filter((acc) => acc.request_status === 'A');

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
          View Approved Accounts
        </Typography>
      </Box>

      <AccountsControlPanel filters={filters} setFilters={setFilters} />
      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          overflowX: 'auto',
          maxHeight: '60vh',
          overflowY: 'auto',
          borderRadius: '0.5rem',
        }}
      >
        <Table size="small" stickyHeader sx={{ minWidth: 1000 }}>
          <TableHead sx={{ backgroundColor: '#f5f7fa' }}>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Barangay</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                <TableRow key={i}>
                  {Array(7).fill().map((_, j) => (
                    <TableCell key={j} sx={{ py: 0.5 }}>
                      <Skeleton variant="text" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredSortedAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" align="center" sx={{ py: 2 }}>
                    No approved accounts found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSortedAccounts.map((acc, i) => (
                <TableRow key={i} hover>
                  <TableCell>{acc.requester_name}</TableCell>
                  <TableCell>{acc.requester_email}</TableCell>
                  <TableCell>{acc.requester_role}</TableCell>
                  <TableCell>{acc.requester_phone}</TableCell>
                  <TableCell>{getBarangayName(acc.requester_barangay)}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(acc.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Approved"
                      color="success"
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: '22px',
                        borderRadius: '0.5rem',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={data.totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ApprovedAccountsTab;
