import { useState } from 'react';
import { TextField, Button, Alert, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AccountManager } from '@/services/AccountManager';
import GovHeader from '../reusables/GovHeader';

const LogInOrgB = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const manager = new AccountManager('orgB');

    try {
      const result = await manager.login(email, password);
      setLoading(false);

      if (!result.success) {
        const userFriendlyMessage =
          result.message === 'Invalid login credentials'
            ? 'Incorrect email or password. Try again!'
            : result.message || 'Login failed';

        setError(userFriendlyMessage);

        // Debug info (commented out to avoid breaking code)
        /*
        console.warn("Login Debug Info:", {
          code: result.code || 'N/A',
          status: result.status || 'N/A',
          raw: result.raw || null,
        });
        */

        return;
      }

      // console.log('Navigating to Org B dashboard...');
      navigate('/dashboard/orgB/DashboardOrgB');

    } catch (err) {
      setLoading(false);
      setError('Something went really wrong. Please try again.');
      // console.error("Unexpected login error:", err);
    }
  };

  return (
    <div className="generic-centered-container">
      <div className="form-box" style={{ borderRadius: '0.5rem', padding: '2rem' }}>
        <GovHeader logoWidth={350} logoHeight={200} titleSize="h5" />

        <Typography
          variant="h6"
          className="form-title"
          align="center"
          gutterBottom
        >
          Barangay Log In
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="dense"
            autoComplete="off"
            sx={{ borderRadius: '0.5rem', '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="dense"
            autoComplete="off"
            sx={{ borderRadius: '0.5rem', '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
          />

          {error && (
            <Alert
              severity="error"
              sx={{ marginTop: '1rem', borderRadius: '0.5rem' }}
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: '1rem',
              fontWeight: 'bold',
              borderRadius: '0.5rem',
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
          }}
        >
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', color: '#6b7280', fontWeight: 500 }}
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </Typography>

          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', color: '#6b7280', fontWeight: 500 }}
            onClick={() => navigate('/register/RegisterOrgB')}
          >
            Register Account →
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default LogInOrgB;
