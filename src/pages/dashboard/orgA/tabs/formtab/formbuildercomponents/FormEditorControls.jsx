import { Box, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SaveIcon from '@mui/icons-material/Save';

const FormEditorControls = ({
  onAddQuestion,
  mode,            // 'edit' | 'preview'
  setMode,         // setter for mode string
  onSave,
  saving,
}) => {
  const toggleMode = () => {
    setMode((prev) => (prev === 'edit' ? 'preview' : 'edit'));
  };

  const isPreview = mode === 'preview';

  return (
    <Box display="flex" gap={2} mb={2}>
      {!isPreview && (
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
      )}

      <Button
        variant="outlined"
        onClick={toggleMode}
        startIcon={isPreview ? <EditNoteIcon /> : <VisibilityIcon />}
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
        {isPreview ? 'Switch to Edit' : 'Switch to Preview'}
      </Button>

      {!isPreview && (
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
      )}
    </Box>
  );
};

export default FormEditorControls;
