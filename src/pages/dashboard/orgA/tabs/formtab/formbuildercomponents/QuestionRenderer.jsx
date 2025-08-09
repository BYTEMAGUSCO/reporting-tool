import {
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Radio,
  RadioGroup,
} from '@mui/material';

const QuestionRenderer = ({ q, mode, answers, setAnswers }) => {
  const isDisabled = mode !== 'submit';

  const handleChange = (e) => {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: e.target.value,
    }));
  };

  const handleCheckboxChange = (opt) => {
    setAnswers((prev) => {
      const current = prev?.[q.id] ?? [];
      const newVal = current.includes(opt)
        ? current.filter((o) => o !== opt)
        : [...current, opt];
      return { ...prev, [q.id]: newVal };
    });
  };

  const handleRadioChange = (e) => {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: e.target.value,
    }));
  };

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
          disabled={isDisabled}
          value={answers?.[q.id] ?? ''}
          onChange={handleChange}
        />
      )}

      {q.type === 'textarea' && (
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Your answer"
          variant="standard"
          disabled={isDisabled}
          value={answers?.[q.id] ?? ''}
          onChange={handleChange}
        />
      )}

      {q.type === 'number' && (
        <TextField
          fullWidth
          type="number"
          placeholder="Enter a number"
          variant="standard"
          disabled={isDisabled}
          value={answers?.[q.id] ?? ''}
          onChange={handleChange}
        />
      )}

      {q.type === 'email' && (
        <TextField
          fullWidth
          type="email"
          placeholder="email@example.com"
          variant="standard"
          disabled={isDisabled}
          value={answers?.[q.id] ?? ''}
          onChange={handleChange}
        />
      )}

      {q.type === 'date' && (
        <TextField
          fullWidth
          type="date"
          variant="standard"
          disabled={isDisabled}
          value={answers?.[q.id] ?? ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      )}

      {q.type === 'dropdown' && (
        <FormControl fullWidth variant="standard" disabled={isDisabled}>
          <Select
            value={answers?.[q.id] ?? ''}
            onChange={handleChange}
          >
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
              control={
                <Checkbox
                  disabled={isDisabled}
                  checked={(answers?.[q.id] ?? []).includes(opt)}
                  onChange={() => handleCheckboxChange(opt)}
                />
              }
              label={opt}
              sx={{ mb: 0.5 }}
            />
          ))}
        </Box>
      )}

      {q.type === 'multiple_choice' && (
        <FormControl component="fieldset" disabled={isDisabled}>
          <RadioGroup
            name={q.id}
            value={answers?.[q.id] ?? ''}
            onChange={handleRadioChange}
          >
            {q.options.map((opt, i) => (
              <FormControlLabel
                key={i}
                value={opt}
                control={<Radio />}
                label={opt}
                sx={{ mb: 0.5 }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}
    </Box>
  );
};

export default QuestionRenderer;
