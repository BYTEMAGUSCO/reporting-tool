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
  Switch,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState } from 'react';
import { styled } from '@mui/material/styles';

const VisibilitySwitch = styled(Switch)(({ theme }) => ({
  width: 50,
  height: 28,
  padding: 0,
  display: 'flex',
  '& .MuiSwitch-switchBase': {
    padding: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(22px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        background: 'linear-gradient(to right, #22c55e, #16a34a)', // soft green gradient
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    transition: theme.transitions.create(['background-color'], {
      duration: 300,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 14,
    background: 'linear-gradient(to right, #f87171, #dc2626)', // soft red gradient
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));


const FormsTable = ({ forms, onPreview, onDelete, onToggleVisibility, deletingFormId }) => {
  const [togglingId, setTogglingId] = useState(null);

  const handleToggle = async (form) => {
    setTogglingId(form.form_id);
    const newVisibility = form.is_visible === 'Y' ? 'N' : 'Y';
    await onToggleVisibility(form.form_id, newVisibility);
    setTogglingId(null);
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Form Name</strong></TableCell>
            <TableCell><strong>Created At</strong></TableCell>
            <TableCell><strong>Visible</strong></TableCell>
            <TableCell align="right"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.form_id} hover>
              <TableCell>{form.form_name}</TableCell>
              <TableCell>{new Date(form.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <Tooltip
                  title={form.is_visible === 'Y' ? 'Click to hide form' : 'Click to show form'}
                  arrow
                  placement="top"
                >
                  <span> {/* Tooltip fix for disabled switch */}
                    <VisibilitySwitch
                      checked={form.is_visible === 'Y'}
                      onChange={() => handleToggle(form)}
                      disabled={togglingId === form.form_id}
                      inputProps={{ 'aria-label': 'toggle visibility' }}
                    />
                  </span>
                </Tooltip>
              </TableCell>
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
              <TableCell colSpan={4} align="center">
                No forms found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FormsTable;
