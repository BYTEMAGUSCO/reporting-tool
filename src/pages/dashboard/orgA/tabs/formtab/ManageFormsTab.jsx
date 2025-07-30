import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Pagination,
  Stack,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment'; // 🧾 icon replacement

import FormPreviewModal from '../models/FormPreviewModal';
import FormsTable from './manageformtabcomponents/FormsTable';
import SkeletonList from './manageformtabcomponents/SkeletonList';
import useFormsFetcher from './manageformtabcomponents/useFormsFetcher';
import usePreviewHandler from './manageformtabcomponents/usePreviewHandler';
import useDeleteHandler from './manageformtabcomponents/useDeleteHandler';

const ManageFormsTab = () => {
  const [page, setPage] = useState(1);

  const {
    forms,
    loading,
    totalPages,
    fetchForms,
    deletingFormId,
    setDeletingFormId,
  } = useFormsFetcher(page);

  const {
    previewOpen,
    selectedForm,
    handlePreview,
    closePreview,
  } = usePreviewHandler();

  const handleDelete = useDeleteHandler(fetchForms, setDeletingFormId);

  useEffect(() => {
    fetchForms();
  }, [page]);

  return (
    <Box sx={{ px: 2, py: 2 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <AssignmentIcon fontSize="medium" color="black" />
          <Typography variant="h5" fontWeight="bold">
            Manage Saved Forms
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <SkeletonList />
        ) : (
          <FormsTable
            forms={forms}
            onPreview={handlePreview}
            onDelete={handleDelete}
            deletingFormId={deletingFormId}
          />
        )}
      </Paper>

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
        onClose={closePreview}
        raw={selectedForm?.raw}
        parsed={selectedForm?.parsed}
      />
    </Box>
  );
};

export default ManageFormsTab;
