import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Fade, useTheme } from '@mui/material';
import Slideshow from './reusables/Slideshow';
import GovHeader from './reusables/GovHeader';

const MainMenu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleNavigate = (path) => {
    setLoading(true);
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  return (
    <>
      {/* Roboto font import */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');`}
      </style>

      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f9fafb',
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 2 },
          gap: { xs: 3, md: 4 },
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        {/* Buttons & Header Section */}
        <Fade in timeout={1200}>
          <Box
            sx={{
              flex: 1,
              maxWidth: 400,
              bgcolor: 'white',
              padding: '1rem 1.5rem', // copied from login's form-box padding (adjust if needed)
              borderRadius: '0.5rem', // same border radius for that smooth curve
              border: '1px solid #d1d5db', // light gray border from your login container (#d1d5db is Tailwind's gray-300, close enough)
              boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)', // subtle shadow like login container
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <GovHeader logoWidth={280} logoHeight={160} titleSize="h5" />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1,
                letterSpacing: 0.5,
                fontSize: '1.25rem',
                lineHeight: 1.2,
              }}
            >
              Choose Department
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={() => handleNavigate('/login/LogInOrgA')}
              disabled={loading}
              aria-label="Login as DILG"
              sx={{
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                py: 1,
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.4)',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
                },
              }}
            >
              {loading ? 'Loading...' : 'Login as DILG'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleNavigate('/login/LogInOrgB')}
              disabled={loading}
              aria-label="Login as Barangay"
              sx={{
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                py: 1,
                fontSize: '1rem',
                color: 'secondary.main',
                borderColor: 'secondary.main',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'secondary.light',
                  borderColor: 'secondary.dark',
                  color: 'secondary.dark',
                  boxShadow: '0 6px 20px rgba(14, 165, 233, 0.5)',
                },
              }}
            >
              {loading ? 'Loading...' : 'Login as Barangay'}
            </Button>
          </Box>
        </Fade>

        {/* Slideshow Section */}
        <Fade in timeout={800}>
          <Box
            sx={{
              flex: 1,
              maxWidth: 650,
              width: '100%',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              padding: '1.25rem',
            }}
          >
            <Slideshow />
          </Box>
        </Fade>
      </Box>
    </>
  );
};

export default MainMenu;
