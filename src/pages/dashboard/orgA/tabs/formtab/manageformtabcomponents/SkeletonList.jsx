import { Stack, Skeleton } from '@mui/material';

const SkeletonList = () => (
  <Stack spacing={1}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} variant="rectangular" height={40} animation="wave" />
    ))}
  </Stack>
);

export default SkeletonList;
