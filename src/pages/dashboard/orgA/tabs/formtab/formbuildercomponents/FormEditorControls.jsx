import { Box, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableChartIcon from '@mui/icons-material/TableChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SaveIcon from '@mui/icons-material/Save';

const FormEditorControls = ({
  onAddQuestion,
  onAddExcelQuestion,
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
      {/* ➕ Add Question Buttons */}
      {!isPreview && (
        <>
          <Button
            variant="contained"
            onClick={onAddQuestion}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: '8px !important',
              px: '16px !important',
              py: '8px !important',
              textTransform: 'none !important',
              fontWeight: '600 !important',
              backgroundColor: '#3b82f6 !important', // Blue
              color: '#ffffff !important',
              '&:hover': {
                backgroundColor: '#2563eb !important', // Darker Blue
              },
            }}
          >
            Add Question
          </Button>

          <Button
            variant="contained"
            onClick={onAddExcelQuestion}
            startIcon={<TableChartIcon />}
            sx={{
              borderRadius: '8px !important',
              px: '16px !important',
              py: '8px !important',
              textTransform: 'none !important',
              fontWeight: '600 !important',
              backgroundColor: '#10b981 !important', // Green
              color: '#ffffff !important',
              '&:hover': {
                backgroundColor: '#059669 !important', // Darker Green
              },
            }}
          >
            Add Excel Table
          </Button>
        </>
      )}

      {/* 👁️ Toggle Edit / Preview */}
      <Button
        variant="contained"
        onClick={toggleMode}
        startIcon={isPreview ? <EditNoteIcon /> : <VisibilityIcon />}
        sx={{
          borderRadius: '8px !important',
          px: '16px !important',
          py: '8px !important',
          textTransform: 'none !important',
          fontWeight: '600 !important',
          backgroundColor: '#557e2fff !important', // Amber
          color: '#ffffffff !important', // Almost black text
          '&:hover': {
            backgroundColor: '#1f3b04ff !important', // Darker Amber
          },
        }}
      >
        {isPreview ? 'Switch to Edit' : 'Switch to Preview'}
      </Button>

      {/* 💾 Save Button */}
      {!isPreview && (
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
          }
          sx={{
            borderRadius: '8px !important',
            px: '16px !important',
            py: '8px !important',
            textTransform: 'none !important',
            fontWeight: '600 !important',
            backgroundColor: saving
              ? '#9ca3af !important' // gray while saving
              : '#4f46e5 !important', // Indigo
            color: '#ffffff !important',
            '&:hover': {
              backgroundColor: saving
                ? '#9ca3af !important'
                : '#4338ca !important', // Darker Indigo
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
