import { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { AccountManager } from '@/services/AccountManager';
import  GovHeader  from '../reusables/GovHeader';
import Swal from 'sweetalert2';

import { useNavigate } from 'react-router-dom';

const RegisterOrgA = () => {
  const accountManager = new AccountManager('orgA');
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    requester_name: '',
    requester_email: '',
    requester_password: '',
    requester_phone: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    const payload = {
      ...formData,
      requester_role: 'D'
    };

    try {
      const result = await accountManager.register(payload);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success! Now just wait for Approval 🎉',
          text: result.message,
          confirmButtonColor: '#facc15',
          customClass: {
            title: 'mui-font',
            popup: 'mui-font',
            confirmButton: 'mui-font',
            htmlContainer: 'mui-font',
          },
        });

        setFormData({
          requester_name: '',
          requester_email: '',
          requester_password: '',
          requester_phone: ''
        });
        setErrors({});
      } else {
        if (result.validationErrors) {
          setErrors(result.validationErrors);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops 😓',
            text: result.message,
          });
        }
      }
    } catch (err) {
      console.error('💥 Registration error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong',
        text: 'Try again later!',
      });
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
      <Box className="register-form" sx={{ width: '100%', maxWidth: 460 }}>
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
            helperText={errors.requester_phone}
            margin="dense"
          />
          <TextField
            label="Role"
            value="D"
            size="small"
            disabled
            fullWidth
            margin="dense"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Create Account'}
          </Button>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, cursor: 'pointer', color: '#6b7280', fontWeight: 500 }}
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
