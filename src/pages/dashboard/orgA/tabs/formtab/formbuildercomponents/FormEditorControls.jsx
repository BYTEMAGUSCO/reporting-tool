import { Box, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SaveIcon from '@mui/icons-material/Save';

const FormEditorControls = ({ onAddQuestion, previewMode, setPreviewMode, onSave, saving }) => {
  return (
    <Box display="flex" gap={2} mb={2}>
      <Button
        variant="outlined"
        onClick={onAddQuestion}
        startIcon={<AddIcon />}
        sx={{
          borderRadius: '0.5rem',
          px: 2,
          py: 1,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#f97316',
          },
        }}
      >
        Add Question
      </Button>

      <Button
        variant="outlined"
        onClick={() => setPreviewMode(!previewMode)}
        startIcon={previewMode ? <EditNoteIcon /> : <VisibilityIcon />}
        sx={{
          borderRadius: '0.5rem',
          px: 2,
          py: 1,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#f97316',
          },
        }}
      >
        {previewMode ? 'Edit Mode' : 'Preview Mode'}
      </Button>

      <Button
        variant="outlined"
        onClick={onSave}
        disabled={saving}
        startIcon={
          saving ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <SaveIcon />
          )
        }
        color={saving ? 'secondary' : 'primary'}
        sx={{
          borderRadius: '0.5rem',
          px: 2,
          py: 1,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#f97316',
          },
        }}
      >
        {saving ? 'Saving...' : 'Save to Supabase'}
      </Button>
    </Box>
  );
};

export default FormEditorControls;
