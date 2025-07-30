import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Stack,
} from '@mui/material';

import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';

import FormBuilderTab from './formtab/FormBuilderTab';
import ManageFormsTab from './formtab/ManageFormsTab';

const FormTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <DescriptionIcon color="black" />
        <Typography variant="h6">Form Management</Typography>
      </Stack>

      <Paper elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            icon={<BuildIcon />}
            iconPosition="start"
            label="Build Form"
          />
          <Tab
            icon={<DescriptionIcon />}
            iconPosition="start"
            label="Manage Forms"
          />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          <FormBuilderTab />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <ManageFormsTab />
        </Box>
      )}
    </Box>
  );
};

export default FormTabs;
