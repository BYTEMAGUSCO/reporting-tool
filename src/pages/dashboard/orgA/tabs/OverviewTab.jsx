import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Card,
  CardMedia,
  CardContent,
  Grid,
  useTheme,
  Paper,
  Stack,
} from '@mui/material';

const placeholderImg = 'https://via.placeholder.com/600x300?text=No+Image';

const OverviewTab = () => {
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [barangayList, setBarangayList] = useState([]);
  const [barangayName, setBarangayName] = useState('Loading...');
  const theme = useTheme();

  useEffect(() => {
    // Fetch the barangay list
    const fetchBarangays = async () => {
      try {
        const res = await fetch('https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/barangays');
        const data = await res.json();
        setBarangayList(data);
      } catch (err) {
        // console.error('⚠️ Failed to fetch barangays:', err);
        setBarangayName('Unavailable');
      }
    };
    fetchBarangays();
  }, []);

  useEffect(() => {
    try {
      const session = JSON.parse(sessionStorage.getItem('session'));
      // console.log('🧠 Full session data:', session);

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

        // Find and set the barangay name
        const match = barangayList.find((b) => b.id === barangayId);
        const fullName = match ? `${match.name} (District ${match.district_number})` : barangayId;

        setBarangayName(fullName);
        setRoleName(roleLabel);
        setUser({ name, email, phone, barangay: barangayId, role });
      }
    } catch (err) {
      // console.error('Session parsing fail 💔:', err);
    }
  }, [barangayList]); // re-run once barangays are loaded

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/news.json');
        const data = await res.json();
        setNews(data);
      } catch {
        // still quiet like a shadow ninja 🥷
      }
    };

    fetchNews();
  }, []);

  if (!user) {
    return (
      <Box>
        <Typography variant="h6">🔒 No user data available</Typography>
        <Typography>Please try logging in again.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          👋 Welcome back, {user.name || 'stranger'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You are logged in as <strong>{roleName}</strong>.
        </Typography>
      </Box>

      {/* 💁 Profile Card */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '0.75rem',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📇 Your Profile
        </Typography>
        <Stack spacing={1}>
          <Typography><strong>Name:</strong> {user.name}</Typography>
          <Typography><strong>Email:</strong> {user.email}</Typography>
          <Typography><strong>Phone:</strong> {user.phone}</Typography>
         
          <Typography><strong>Role:</strong> {roleName}</Typography>
        </Stack>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h5" gutterBottom fontWeight="medium">
        📰 Latest News
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
                  boxShadow: theme.shadows[3],
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
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
  );
};

export default OverviewTab;
