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
} from '@mui/material';

const placeholderImg = 'https://via.placeholder.com/600x300?text=No+Image';

const OverviewTab = () => {
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [roleName,setRoleName] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    try {
      const session = JSON.parse(sessionStorage.getItem('session'));
      const fetchedUser = session?.user;

      if (fetchedUser) {
         const name = fetchedUser.user_metadata?.name || fetchedUser.email;
          const role = fetchedUser.user_metadata?.role || fetchedUser.role || 'unknown role';
        

          if (role == "D"){
             setRoleName("DILG")
          }
          else if(role == "B"){
            setRoleName("Barangay")
          }
          else if(role == "S"){
            setRoleName("Super Admin")
          }

          setUser({
            ...fetchedUser,
            name,
            role
          });
      } else {
        console.warn('😶 User not found in session.');
      }
    } catch (error) {
      console.error('🧨 Error loading user from session:', error);
    }
  }, []);
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/news.json');
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error('🗞️ Failed to load news:', err);
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
          You are logged in as <strong>{roleName || 'unknown role'}</strong>.
        </Typography>
      </Box>

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
                  borderRadius: 3,
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
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
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
