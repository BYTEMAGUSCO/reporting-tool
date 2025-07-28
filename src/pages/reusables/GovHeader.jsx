import { Box, Typography } from '@mui/material';
import logo from './images/logo1.jpg';

const GovHeader = ({
  logoWidth = 400,
  logoHeight = 200,
  titleSize = 'h6',
  center = true,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: center ? 'center' : 'flex-start',
        gap: 0, // no gap between items
        margin: 0,
        padding: 0,
      }}
    >
      <Box
        component="img"
        src={logo}
        alt="Government Logo"
        sx={{
          width: logoWidth,
          height: logoHeight,
          objectFit: 'cover', // fills box instead of leaving whitespace
          display: 'block', // prevents extra bottom space from inline elements
          margin: 0,
          padding: 0,
        }}
      />
      <Typography
        variant={titleSize}
        fontWeight={700}
        sx={{
          textAlign: center ? 'center' : 'left',
          lineHeight: 1.1,
          marginTop: '4px', // adjust this value to taste (or remove completely)
          padding: 0,
        }}
      >
        Report Management System
      </Typography>
    </Box>
  );
};

export default GovHeader;
