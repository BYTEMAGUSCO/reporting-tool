import { Box } from '@mui/material';
import logo from './images/logo2.jpg';

const GovLogoOnly = ({ logoWidth = 400, logoHeight = 200, center = true }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: center ? 'center' : 'flex-start',
        alignItems: 'center',
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
          objectFit: 'cover',
          display: 'block',
          margin: 0,
          padding: 0,
        }}
      />
    </Box>
  );
};

export default GovLogoOnly;
