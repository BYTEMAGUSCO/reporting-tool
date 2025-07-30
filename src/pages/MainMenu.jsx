import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';
import Slideshow from './reusables/Slideshow';
import GovHeader from './reusables/GovHeader';


const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <Box
      className="mainmenu-root"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        px: 2,
        backgroundColor: '#ffffff',
      }}
    >
      {/* Slideshow Section */}
      <Box
        sx={{
          flex: 1,
          maxWidth: 600,
          px: 2,
          mb: { xs: 4, md: 0 },
        }}
      >
        <Slideshow />
      </Box>

      {/* Buttons Section */}
      <Box
        className="form-box"
        sx={{
          flex: 1,
          maxWidth: 400,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        <GovHeader logoWidth={350} logoHeight={200} titleSize="h6" />

        {/* Contained Typography + Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            mt: 1,
          }}
        >
          <Typography
            variant="h6"
            className="form-title"
            align="center"
          >
            Choose Department
          </Typography>

<Button
  variant="contained"
  fullWidth
  onClick={() => navigate('/login/LogInOrgA')}
  sx={{
    maxWidth: 300,
    borderRadius: '0.5rem', // 💅 added this
    fontWeight: 'bold'
  }}
>
  Login as DILG
</Button>

<Button
  variant="outlined"
  fullWidth
  onClick={() => navigate('/login/LogInOrgB')}
  sx={{
    maxWidth: 300,
    borderRadius: '0.5rem', // 💅 added this too
    fontWeight: 'bold'
  }}
>
  Login as Barangay
</Button>

        </Box>
      </Box>
    </Box>
  );
};

export default MainMenu;
