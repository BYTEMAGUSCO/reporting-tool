import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const QuestionEditor = ({
  q,
  updateQuestion,
  updateOption,
  addOption,
  removeOption, // 👈 new prop
}) => {
  return (
    <>
      <TextField
        fullWidth
        label="Question Label"
        value={q.label}
        onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Question Type</InputLabel>
        <Select
          value={q.type}
          label="Question Type"
          onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
        >
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="textarea">Paragraph</MenuItem>
          <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
          <MenuItem value="checkbox">Checkboxes</MenuItem>
          <MenuItem value="dropdown">Dropdown</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="email">Email</MenuItem>
          <MenuItem value="date">Date</MenuItem>
        </Select>
      </FormControl>

      {['multiple_choice', 'checkbox', 'dropdown'].includes(q.type) && (
        <Box mt={2}>
          {q.options.map((opt, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
              <TextField
                fullWidth
                label={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => updateOption(q.id, idx, e.target.value)}
              />
              <IconButton onClick={() => removeOption(q.id, idx)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button onClick={() => addOption(q.id)}>➕ Add Option</Button>
        </Box>
      )}
    </>
  );
};

export default QuestionEditor;
