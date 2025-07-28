import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  Pagination,
  Skeleton,
  Stack,
} from '@mui/material';
import FormPreviewModal from './models/FormPreviewModal';

function getSessionToken() {
  return JSON.parse(sessionStorage.getItem('session'))?.access_token ?? '';
}

const ManageFormsTab = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedForm, setSelectedForm] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = (form) => {
    try {
      console.log('👉 Raw form object:', form);

      if (!form || !form.form_content) {
        console.warn('⚠️ Missing form_content');
        alert('This form is empty or corrupted.');
        return;
      }

      let parsed = [];

      // Handle stringified JSON or already-parsed content
      if (typeof form.form_content === 'string') {
        try {
          parsed = JSON.parse(form.form_content);
        } catch (err) {
          console.warn('⚠️ Failed to parse JSON string:', err);
          alert('This form content is corrupted.');
          return;
        }
      } else if (Array.isArray(form.form_content)) {
        parsed = form.form_content;
      }

      // Final sanity check
      if (!Array.isArray(parsed)) {
        console.error('❌ Parsed form content is not an array:', parsed);
        alert('This form is corrupted and cannot be previewed 😢');
        return;
      }

      setSelectedForm({
        raw: form.form_content,
        parsed,
      });

      setPreviewOpen(true);
    } catch (err) {
      console.error('❌ Failed to preview form_content:', err);
      alert('This form is corrupted and cannot be previewed 😢');
    }
  };

  const fetchForms = async () => {
    setLoading(true);
    const token = getSessionToken();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms?page=${page}&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await res.json();
      console.log('📦 Raw response from Supabase:', result);

      if (!res.ok) throw new Error(result?.error?.message || 'Failed to fetch forms');

      setForms(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching forms:', err);
      alert('Failed to load forms.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (form_id) => {
    if (!window.confirm('Are you sure you want to delete this form? This action is irreversible. 😔')) return;

    const token = getSessionToken();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dynamic-forms/${form_id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || 'Failed to delete form');

      alert('Form deleted successfully 💀');
      fetchForms();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete form. Maybe it resisted. 😩');
    }
  };

  useEffect(() => {
    fetchForms();
  }, [page]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        📋 Manage Saved Forms
      </Typography>

      {loading ? (
        <Stack spacing={1}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} animation="wave" />
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Form Name</strong></TableCell>
                <TableCell><strong>Created At</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.form_id}>
                  <TableCell>{form.form_name}</TableCell>
                  <TableCell>{new Date(form.created_at).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handlePreview(form)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(form.form_id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {forms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No forms found.
                  </TableCell>
                </TableRow>
              )}
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

      <FormPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        raw={selectedForm?.raw}
        parsed={selectedForm?.parsed}
      />
    </Box>
  );
};

export default ManageFormsTab;
