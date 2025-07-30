import { useEffect } from 'react'; // 👈 don't forget this import
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const dropdownConfigs = [
  {
    id: 'org',
    label: 'Organization',
    options: [
      { value: 'all', label: 'All' },
      { value: 'B', label: 'Barangay' },
      { value: 'D', label: 'DILG' },
    ],
  },
  {
    id: 'sortBy',
    label: 'Sort By',
    options: [
      { value: 'name', label: 'Name' },
      { value: 'email', label: 'Email' },
      { value: 'dateCreated', label: 'Date Created' },
    ],
  },
];

const AccountsControlPanel = ({ filters, setFilters }) => {
  const handleChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        p: 1.5,
        maxWidth: '100%',
        borderRadius: '0.5rem',
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Filters
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        }}
        gap={1}
        alignItems="center"
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={filters.searchTerm}
          onChange={handleChange('searchTerm')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            sx: { borderRadius: '0.5rem' },
          }}
          fullWidth
          sx={{ borderRadius: '0.5rem' }}
        />

        {dropdownConfigs.map(({ id, label, options }) => (
          <FormControl
            key={id}
            fullWidth
            size="small"
            sx={{ borderRadius: '0.5rem' }}
          >
            <InputLabel id={`${id}-label`}>{label}</InputLabel>
            <Select
              labelId={`${id}-label`}
              value={filters[id]}
              onChange={handleChange(id)}
              label={label}
              sx={{ borderRadius: '0.5rem' }}
            >
              {options.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>
    </Paper>
  );
};

export default AccountsControlPanel;
