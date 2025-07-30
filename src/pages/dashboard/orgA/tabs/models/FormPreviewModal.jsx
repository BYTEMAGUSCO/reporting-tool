import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
  Stack,
} from '@mui/material';
import QuestionRenderer from '../formtab/formbuildercomponents/QuestionRenderer'; // reuse question renderer from the formbuilder

const FormPreviewModal = ({ open, onClose, parsed }) => {
  const safeFields = Array.isArray(parsed) ? parsed : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🧐 Form Preview</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {safeFields.length === 0 ? (
            <Typography color="text.secondary" fontStyle="italic">
              No preview available. Form is empty or invalid.
            </Typography>
          ) : (
            safeFields.map((field, index) => (
              <Box key={index}>
                <QuestionRenderer q={field} />

                <Divider sx={{ mt: 3 }} />
              </Box>
            ))
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormPreviewModal;
