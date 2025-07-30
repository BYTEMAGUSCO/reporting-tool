import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const FormsTable = ({ forms, onPreview, onDelete, deletingFormId }) => (
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
          <TableRow key={form.form_id} hover>
            <TableCell>{form.form_name}</TableCell>
            <TableCell>{new Date(form.created_at).toLocaleString()}</TableCell>
            <TableCell align="right">
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onPreview(form)}
                  startIcon={<VisibilityIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Preview
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => onDelete(form.form_id)}
                  disabled={deletingFormId === form.form_id}
                  startIcon={
                    deletingFormId === form.form_id ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DeleteOutlineIcon />
                    )
                  }
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  {deletingFormId === form.form_id ? 'Deleting...' : 'Delete'}
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
);

export default FormsTable;
