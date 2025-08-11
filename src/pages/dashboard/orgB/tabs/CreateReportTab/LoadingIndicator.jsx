import { Box, CircularProgress } from '@mui/material';

const LoadingIndicator = () => (
  <Box display="flex" justifyContent="center" mt={2}>
    <CircularProgress />
  </Box>
);

export default LoadingIndicator;
