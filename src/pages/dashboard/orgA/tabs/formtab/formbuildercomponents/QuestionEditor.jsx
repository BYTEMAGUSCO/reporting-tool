import { Box, TextField, Typography, Divider, Switch, FormControlLabel } from '@mui/material';

const QuestionEditor = ({
  q,
  updateQuestion,
  updateOption,
  addOption,
  removeOption,
}) => {
  // Generic field update
  const handleChange = (key, value) => {
    updateQuestion(q.id, key, value);
  };

  // Config update helper
  const updateConfig = (key, value) => {
    updateQuestion(q.id, 'config', {
      ...q.config,
      [key]: value,
    });
  };

  // 🎯 Handle footer fields separately
  if (q.type === 'footer') {
    return (
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Footer Section Settings
        </Typography>

        <TextField
          label="Prepared By Label"
          fullWidth
          size="small"
          sx={{ my: 1 }}
          value={q.config.preparedByLabel || ''}
          onChange={(e) => updateConfig('preparedByLabel', e.target.value)}
        />

        <TextField
          label="Prepared By Role"
          fullWidth
          size="small"
          sx={{ my: 1 }}
          value={q.config.preparedByRole || ''}
          onChange={(e) => updateConfig('preparedByRole', e.target.value)}
        />

        <TextField
          label="Submitted By Label"
          fullWidth
          size="small"
          sx={{ my: 1 }}
          value={q.config.submittedByLabel || ''}
          onChange={(e) => updateConfig('submittedByLabel', e.target.value)}
        />

        <TextField
          label="Submitted By Role"
          fullWidth
          size="small"
          sx={{ my: 1 }}
          value={q.config.submittedByRole || ''}
          onChange={(e) => updateConfig('submittedByRole', e.target.value)}
        />

        <FormControlLabel
          control={
            <Switch
              checked={q.config.showDate}
              onChange={(e) => updateConfig('showDate', e.target.checked)}
            />
          }
          label="Show Date Accomplished"
          sx={{ my: 1 }}
        />

        <Divider sx={{ my: 2 }} />

        <TextField
          label="Note Text"
          fullWidth
          multiline
          minRows={2}
          size="small"
          value={q.config.noteText || ''}
          onChange={(e) => updateConfig('noteText', e.target.value)}
        />
      </Box>
    );
  }

  // ✏️ Default editor for non-footer questions
  return (
    <Box>
      <TextField
        label="Question Label"
        fullWidth
        size="small"
        sx={{ mb: 1 }}
        value={q.label || ''}
        onChange={(e) => handleChange('label', e.target.value)}
      />

      <TextField
        select
        label="Question Type"
        fullWidth
        size="small"
        SelectProps={{ native: true }}
        value={q.type}
        onChange={(e) => handleChange('type', e.target.value)}
        sx={{ mb: 1 }}
      >
        <option value="text">Short Answer</option>
        <option value="paragraph">Paragraph</option>
        <option value="multiple_choice">Multiple Choice</option>
        <option value="checkbox">Checkboxes</option>
        <option value="dropdown">Dropdown</option>
        <option value="table">Excel Table</option>
        <option value="footer">Footer Section</option>
      </TextField>

      {/* render options if multiple choice / checkbox / dropdown */}
      {['multiple_choice', 'checkbox', 'dropdown'].includes(q.type) && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Options
          </Typography>
          {q.options.map((opt, idx) => (
            <TextField
              key={idx}
              fullWidth
              size="small"
              value={opt}
              sx={{ mb: 1 }}
              onChange={(e) => updateOption(q.id, idx, e.target.value)}
              InputProps={{
                endAdornment: (
                  <span
                    style={{
                      color: 'red',
                      cursor: 'pointer',
                      marginLeft: '8px',
                    }}
                    onClick={() => removeOption(q.id, idx)}
                  >
                    ✕
                  </span>
                ),
              }}
            />
          ))}
          <Typography
            onClick={() => addOption(q.id)}
            sx={{
              fontSize: 13,
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            + Add Option
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default QuestionEditor;
