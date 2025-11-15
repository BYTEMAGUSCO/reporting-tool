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

const QuestionRenderer = ({
  q,
  mode,
  answers,
  setAnswers,
  required = false,
  error = false,
  helperText = '',
}) => {
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

      {/* =============================
          TEXT
      ============================= */}
      {q.type === 'text' && (
        <TextField
          fullWidth
          placeholder="Your answer"
          variant="standard"
          disabled={isDisabled}
          value={answers?.[q.id] ?? ''}
          onChange={handleChange}
          required={required}
          error={error}
          helperText={helperText}
        />
      )}

      {/* =============================
          TEXTAREA
      ============================= */}
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
          required={required}
          error={error}
          helperText={helperText}
        />
      )}

      {/* =============================
          NUMBER
      ============================= */}
      {q.type === 'number' && (
        <TextField
          fullWidth
          type="number"
          placeholder="Enter a number"
          variant="standard"
          disabled={isDisabled}
          value={answers?.[q.id] ?? ''}
          onChange={handleChange}
          required={required}
          error={error}
          helperText={helperText}
        />
      )}

      {/* =============================
          EMAIL
      ============================= */}
      {q.type === 'email' && (
        <TextField
          fullWidth
          type="email"
          placeholder="email@example.com"
          variant="standard"
          disabled={isDisabled}
          value={answers?.[q.id] ?? ''}
          onChange={handleChange}
          required={required}
          error={error}
          helperText={helperText}
        />
      )}

      {/* =============================
          DATE
      ============================= */}
      {q.type === 'date' && (
        <TextField
          fullWidth
          type="date"
          variant="standard"
          disabled={isDisabled}
          value={answers?.[q.id] ?? ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required={required}
          error={error}
          helperText={helperText}
        />
      )}

      {/* =============================
          DROPDOWN
      ============================= */}
      {q.type === 'dropdown' && (
        <FormControl fullWidth variant="standard" disabled={isDisabled}>
          <Select
            value={answers?.[q.id] ?? ''}
            onChange={handleChange}
            required={required}
            error={error}
          >
            {q.options.map((opt, i) => (
              <MenuItem key={i} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
          {helperText && (
            <Typography
              variant="caption"
              color={error ? 'error' : 'textSecondary'}
            >
              {helperText}
            </Typography>
          )}
        </FormControl>
      )}

      {/* =============================
          CHECKBOX
      ============================= */}
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
          {helperText && error && (
            <Typography variant="caption" color="error">
              {helperText}
            </Typography>
          )}
        </Box>
      )}

      {/* =============================
          MULTIPLE CHOICE (RADIO)
      ============================= */}
      {q.type === 'multiple_choice' && (
        <FormControl component="fieldset" disabled={isDisabled} error={error}>
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

          {helperText && error && (
            <Typography variant="caption" color="error">
              {helperText}
            </Typography>
          )}
        </FormControl>
      )}
    </Box>
  );
};

export default QuestionRenderer;
