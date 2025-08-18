import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { AccountManager } from '@/services/AccountManager';
import GovHeader from '../reusables/GovHeader';
import { useNavigate } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '@/services/alert';

const RegisterOrgA = () => {
  const accountManager = new AccountManager('orgA');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    requester_name: '',
    requester_email: '',
    requester_password: '',
    requester_phone: '',
    requester_barangay: '',
    country_code: '+63',
  });

  const [barangays, setBarangays] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const res = await fetch('https://juagcyjdhvjonysqbgof.supabase.co/functions/v1/barangays');
        const data = await res.json();
        setBarangays(data);
      } catch (err) {
        console.error('Failed to load barangays:', err);
        showErrorAlert('Barangay load fail 🥲', 'Try reloading the page!');
      }
    };
    fetchBarangays();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const fullPhone = `${formData.country_code}${formData.requester_phone}`;

    const payload = {
      ...formData,
      requester_role: 'D',
      requester_phone: fullPhone,
    };

    try {
      const result = await accountManager.register(payload);

      if (result.success) {
        showSuccessAlert('Success! Now just wait for Approval 🎉', result.message);
        setFormData({
          requester_name: '',
          requester_email: '',
          requester_password: '',
          requester_phone: '',
          requester_barangay: '',
          country_code: '+63',
        });
        setErrors({});
      } else {
        if (result.validationErrors) {
          setErrors(result.validationErrors);
        } else {
          showErrorAlert('Oops 😓', result.message);
        }
      }
    } catch (err) {
      console.error('💥 Registration error:', err);
      showErrorAlert('Something went wrong', 'Try again later!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      className="register-root"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#ffffff',
        px: 2,
      }}
    >
      <Box
        className="register-form"
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: '0.5rem',
          padding: 3,
          boxShadow: 2,
          backgroundColor: '#fff',
        }}
      >
        <GovHeader />
        <Typography
          variant="h6"
          className="form-title"
          align="center"
          gutterBottom
        >
          Create Your DILG Account
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Full Name"
            name="requester_name"
            size="small"
            fullWidth
            value={formData.requester_name}
            onChange={handleChange}
            error={!!errors.requester_name}
            helperText={errors.requester_name}
            margin="dense"
            autoComplete="off"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
          />

          <TextField
            label="Email Address"
            name="requester_email"
            type="email"
            size="small"
            fullWidth
            value={formData.requester_email}
            onChange={handleChange}
            error={!!errors.requester_email}
            helperText={errors.requester_email}
            margin="dense"
            autoComplete="off"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
          />

          <TextField
            label="Create Password"
            name="requester_password"
            type="password"
            autoComplete="new-password"
            size="small"
            fullWidth
            value={formData.requester_password}
            onChange={handleChange}
            error={!!errors.requester_password}
            helperText={errors.requester_password}
            margin="dense"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
          />

      <Box sx={{ display: 'flex', gap: 1 }}>
  <TextField
    label="Country Code"
    value="+63"
    size="small"
    disabled
    sx={{
      width: '110px',
      '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' },
    }}
  />

  <TextField
    label="Phone Number"
    name="requester_phone"
    type="tel"
    size="small"
    fullWidth
    value={formData.requester_phone}
    onChange={handleChange}
    error={!!errors.requester_phone}
    helperText={errors.requester_phone || 'Exclude country code'}
    margin="dense"
    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
  />
</Box>


          <FormControl
            fullWidth
            size="small"
            margin="dense"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
            error={!!errors.requester_barangay}
          >
            <InputLabel id="barangay-label">Barangay</InputLabel>
            <Select
              labelId="barangay-label"
              name="requester_barangay"
              value={formData.requester_barangay}
              onChange={handleChange}
              label="Barangay"
            >
              {barangays.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name} (District {b.district_number})
                </MenuItem>
              ))}
            </Select>
            {errors.requester_barangay && (
              <Typography variant="caption" color="error">
                {errors.requester_barangay}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Role"
            value="D"
            size="small"
            disabled
            fullWidth
            margin="dense"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              mt: 2,
              fontWeight: 'bold',
              borderRadius: '0.5rem',
            }}
          >
            {isLoading ? 'Submitting...' : 'Create Account'}
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 2,
              cursor: 'pointer',
              color: '#6b7280',
              fontWeight: 500,
            }}
            onClick={() => navigate('/login/LogInOrgA')}
          >
            ← Back to Login
          </Typography>
        </form>
      </Box>
    </Box>
  );
};

export default RegisterOrgA;
