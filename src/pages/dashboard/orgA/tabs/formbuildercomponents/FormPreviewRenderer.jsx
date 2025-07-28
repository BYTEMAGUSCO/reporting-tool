import { Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionRenderer from './QuestionRenderer';
import QuestionEditor from './QuestionEditor';

const FormPreviewRenderer = ({
  questions,
  previewMode,
  deleteQuestion,
  updateQuestion,
  updateOption,
  addOption,
  removeOption,
}) => {
  return questions.map((q) => (
    <Box key={q.id} mt={3} p={2} border="1px solid #ccc" borderRadius={2}>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        {!previewMode && (
          <IconButton color="error" onClick={() => deleteQuestion(q.id)}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      {previewMode ? (
        <QuestionRenderer q={q} />
      ) : (
        <QuestionEditor
          q={q}
          updateQuestion={updateQuestion}
          updateOption={updateOption}
          addOption={addOption}
          removeOption={removeOption}
        />
      )}
    </Box>
  ));
};

export default FormPreviewRenderer;
