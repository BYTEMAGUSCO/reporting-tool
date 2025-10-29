import { Box, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableChartIcon from '@mui/icons-material/TableChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SaveIcon from '@mui/icons-material/Save';

const FormEditorControls = ({
  onAddQuestion,
  onAddExcelQuestion, // ✅ Excel Table Button
  mode,               
  setMode,            
  onSave,
  saving,
}) => {
  const isPreview = mode === 'preview';

  const toggleMode = () => {
    setMode((prev) => (prev === 'edit' ? 'preview' : 'edit'));
  };

  return (
    <Box display="flex" gap={2} mb={2} flexWrap="wrap">
      {/* Add Question Buttons */}
      {!isPreview && (
        <>
          <Button
            variant="outlined"
            onClick={onAddQuestion}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: '0.5rem',
              px: 2,
              py: 1,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f97316' },
            }}
          >
            Add Question
          </Button>

          <Button
            variant="outlined"
            onClick={onAddExcelQuestion}
            startIcon={<TableChartIcon />}
            sx={{
              borderRadius: '0.5rem',
              px: 2,
              py: 1,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#f97316' },
            }}
          >
            Add Excel Table
          </Button>
        </>
      )}

      {/* Toggle Edit / Preview */}
      <Button
        variant="outlined"
        onClick={toggleMode}
        startIcon={isPreview ? <EditNoteIcon /> : <VisibilityIcon />}
        sx={{
          borderRadius: '0.5rem',
          px: 2,
          py: 1,
          textTransform: 'none',
          '&:hover': { backgroundColor: '#f97316' },
        }}
      >
        {isPreview ? 'Switch to Edit' : 'Switch to Preview'}
      </Button>

      {/* Save Button */}
      {!isPreview && (
        <Button
          variant="outlined"
          onClick={onSave}
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
          }
          color={saving ? 'secondary' : 'primary'}
          sx={{
            borderRadius: '0.5rem',
            px: 2,
            py: 1,
            textTransform: 'none',
            '&:hover': { backgroundColor: '#f97316' },
          }}
        >
          {saving ? 'Saving...' : 'Save to Supabase'}
        </Button>
      )}
    </Box>
  );
};

export default FormEditorControls;
