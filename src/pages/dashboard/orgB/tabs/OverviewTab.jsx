import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Divider,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Paper,
  Stack,
  ThemeProvider,
  createTheme,
} from '@mui/material';

const placeholderImg = 'https://via.placeholder.com/600x300?text=No+Image';

const getRoleTheme = (role) => {
  const base = {
    background: { default: '#fefdfb', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#475569' },
    divider: '#e2e8f0',
  };

  switch (role) {
    case 'S':
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#facc15', light: '#fde68a', dark: '#b45309', contrastText: '#000' },
          secondary: { main: '#2563eb', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(135deg, #facc15, #fef08a)',
      });

    case 'D':
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#059669', light: '#34d399', dark: '#047857', contrastText: '#fff' },
          secondary: { main: '#06b6d4', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(135deg, #059669, #10b981)',
      });

    case 'B':
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#2563eb', light: '#60a5fa', dark: '#1e3a8a', contrastText: '#fff' },
          secondary: { main: '#ef4444', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      });

    default:
      return createTheme({
        palette: {
          ...base,
          primary: { main: '#64748b', light: '#94a3b8', dark: '#334155', contrastText: '#fff' },
          secondary: { main: '#475569', contrastText: '#fff' },
        },
        customGradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
      });
  }
};

const OverviewTab = () => {
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [barangayList, setBarangayList] = useState([]);
  const [barangayName, setBarangayName] = useState('Loading...');

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await fetch('https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/barangays');
        const data = await res.json();
        setBarangayList(data);
      } catch {
        setBarangayName('Unavailable');
      }
    };
    fetchBarangays();
  }, []);

  useEffect(() => {
    try {
      const session = JSON.parse(sessionStorage.getItem('session'));
      const fetchedUser = session?.user;

      if (fetchedUser) {
        const metadata = fetchedUser.user_metadata || {};
        const name = metadata.name || fetchedUser.email;
        const role = metadata.role || fetchedUser.role || 'unknown role';
        const email = fetchedUser.email;
        const phone = metadata.phone || 'Not provided';
        const barangayId = metadata.barangay || 'Not provided';

        let roleLabel = 'Unknown';
        if (role === 'D') roleLabel = 'DILG';
        else if (role === 'B') roleLabel = 'Barangay';
        else if (role === 'S') roleLabel = 'Super Admin';

        const match = barangayList.find((b) => b.id === barangayId);
        const fullName = match ? `${match.name} (District ${match.district_number})` : barangayId;

        setBarangayName(fullName);
        setRoleName(roleLabel);
        setUser({ name, email, phone, barangay: barangayId, role });
      }
    } catch {}
  }, [barangayList]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/news.json');
        const data = await res.json();
        setNews(data);
      } catch {}
    };
    fetchNews();
  }, []);

  const roleTheme = useMemo(() => getRoleTheme(user?.role), [user?.role]);

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No user data available</Typography>
        <Typography>Please try logging in again.</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={roleTheme}>
      <Box sx={{ px: 3, py: 4 }}>

        {/* 🌈 Gradient Welcome Banner */}
        <Box
          sx={{
            background: roleTheme.customGradient,
            color: roleTheme.palette.primary.contrastText,
            textAlign: 'center',
            py: 4,
            borderRadius: '12px',
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Welcome, {user.name ? user.name : "Guest"} 👋
          </Typography>

          <Typography variant="body1" sx={{ opacity: 0.95, fontSize: '1.05rem' }}>
            <strong>{roleName}</strong> • {barangayName}
          </Typography>

          <Typography
            variant="body2"
            sx={{ opacity: 0.85, mt: 1, fontSize: '0.9rem' }}
          >
            {user.email}
          </Typography>

          <Typography
            variant="body2"
            sx={{ opacity: 0.85, fontSize: '0.9rem' }}
          >
            Mobile: {user.phone}
          </Typography>
        </Box>

        {/* Profile Card */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '0.75rem',
            backgroundColor: roleTheme.palette.background.paper,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Your Profile
          </Typography>
          <Stack spacing={1}>
            <Typography><strong>Name:</strong> {user.name}</Typography>
            <Typography><strong>Email:</strong> {user.email}</Typography>
            <Typography><strong>Phone:</strong> {user.phone}</Typography>
            <Typography><strong>Barangay:</strong> {barangayName}</Typography>
            <Typography><strong>Role:</strong> {roleName}</Typography>
          </Stack>
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* News Section */}
        <Typography variant="h5" gutterBottom fontWeight="medium">
          Latest News
        </Typography>

        {news.length === 0 ? (
          <Typography color="text.secondary">No news available yet.</Typography>
        ) : (
          <Grid container spacing={3}>
            {news.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    borderRadius: '0.5rem',
                    boxShadow: roleTheme.shadows[3],
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${roleTheme.palette.divider}`,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={item.image || placeholderImg}
                    alt={item.title}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderTopLeftRadius: '0.5rem',
                      borderTopRightRadius: '0.5rem',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      {item.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default OverviewTab;
