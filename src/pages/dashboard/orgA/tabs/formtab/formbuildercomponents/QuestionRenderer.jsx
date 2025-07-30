import {
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';

const QuestionRenderer = ({ q }) => {
  return (
    <Box
      mt={4}
      p={2}
      borderBottom="1px solid #e0e0e0"
      sx={{ fontFamily: 'system-ui, sans-serif' }}
    >
      <Typography variant="body1" fontWeight={500} mb={1.2}>
        {q.label}
      </Typography>

      {q.type === 'text' && (
        <TextField
          fullWidth
          placeholder="Your answer"
          variant="standard"
          disabled
        />
      )}

      {q.type === 'textarea' && (
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Your answer"
          variant="standard"
          disabled
        />
      )}

      {q.type === 'number' && (
        <TextField
          fullWidth
          type="number"
          placeholder="Enter a number"
          variant="standard"
          disabled
        />
      )}

      {q.type === 'email' && (
        <TextField
          fullWidth
          type="email"
          placeholder="email@example.com"
          variant="standard"
          disabled
        />
      )}

      {q.type === 'date' && (
        <TextField
          fullWidth
          type="date"
          variant="standard"
          disabled
          InputLabelProps={{ shrink: true }}
        />
      )}

      {q.type === 'dropdown' && (
        <FormControl fullWidth variant="standard" disabled>
          <Select defaultValue="">
            {q.options.map((opt, i) => (
              <MenuItem key={i} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {q.type === 'checkbox' && (
        <Box display="flex" flexDirection="column" mt={1}>
          {q.options.map((opt, i) => (
            <FormControlLabel
              key={i}
              control={<Checkbox disabled />}
              label={opt}
              sx={{ mb: 0.5 }}
            />
          ))}
        </Box>
      )}

      {q.type === 'multiple_choice' && (
        <Box display="flex" flexDirection="column" mt={1}>
          {q.options.map((opt, i) => (
            <FormControlLabel
              key={i}
              control={<input type="radio" disabled name={q.id} />}
              label={opt}
              sx={{ mb: 0.5 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default QuestionRenderer;
