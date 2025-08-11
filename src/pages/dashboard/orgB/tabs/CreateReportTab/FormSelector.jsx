import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const FormSelector = ({ forms, selectedFormId, onSelect }) => (
  <FormControl fullWidth>
    <InputLabel>Select a Form</InputLabel>
    <Select
      value={selectedFormId || ''}
      onChange={(e) => onSelect(e.target.value)}
      label="Select a Form"
    >
      <MenuItem disabled value="">
        -- Select a Form --
      </MenuItem>
      {forms
        .filter((form) => form.is_visible !== 'N')
        .map((form) => (
          <MenuItem key={form.form_id} value={form.form_id}>
            {form.form_name}
          </MenuItem>
        ))}
    </Select>
  </FormControl>
);

export default FormSelector;
