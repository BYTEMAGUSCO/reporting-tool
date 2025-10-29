import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const QuestionEditor = ({
  q,
  updateQuestion,
  updateOption,
  addOption,
  removeOption,
  addColumn,
  updateColumn,
  removeColumn,
  toggleColumnEditable,
}) => {
  const options = q.options || [];
  const columns = q.config?.columns || [];

  return (
    <>
      {/* Question Label */}
      <TextField
        fullWidth
        label="Question Label"
        value={q.label}
        onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
        margin="normal"
      />

      {/* Question Type */}
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
          <MenuItem value="table">Excel Table</MenuItem>
        </Select>
      </FormControl>

      {/* Options for MC, checkbox, dropdown */}
      {['multiple_choice', 'checkbox', 'dropdown'].includes(q.type) && (
        <Box mt={2}>
          {options.map((opt, idx) => (
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

      {/* Excel Table Columns */}
      {q.type === 'table' && (
        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Table Columns
          </Typography>

          {columns.map((col, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
              <TextField
                fullWidth
                label={`Column ${idx + 1} Name`}
                value={col.label}
                onChange={(e) =>
                  updateColumn(q.id, idx, { label: e.target.value })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={col.editable ?? true}
                    onChange={() => toggleColumnEditable(q.id, idx)}
                    color="primary"
                  />
                }
                label="Editable"
              />
              <IconButton onClick={() => removeColumn(q.id, idx)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button onClick={() => addColumn(q.id)}>➕ Add Column</Button>
        </Box>
      )}
    </>
  );
};

export default QuestionEditor;
