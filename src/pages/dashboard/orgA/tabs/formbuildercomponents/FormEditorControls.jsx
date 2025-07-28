import { Box, Button } from '@mui/material';

const FormEditorControls = ({ onAddQuestion, previewMode, setPreviewMode, onSave }) => {
  return (
    <Box display="flex" gap={2} mb={2}>
      <Button variant="contained" onClick={onAddQuestion}>
        ➕ Add Question
      </Button>
      <Button variant="outlined" onClick={() => setPreviewMode(!previewMode)}>
        {previewMode ? '🛠️ Edit Mode' : '👀 Preview Mode'}
      </Button>
      <Button variant="outlined" onClick={onSave}>
        💾 Save to Supabase
      </Button>
    </Box>
  );
};

export default FormEditorControls;
