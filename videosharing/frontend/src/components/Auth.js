import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, Tabs, Tab, Alert } from '@mui/material';

const Auth = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const endpoint = tabValue === 0 ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(tabValue === 0 ? 'Login successful!' : 'Registration successful!');
        localStorage.setItem('token', data.token);
        setTimeout(() => navigate('/dashboard'), 1000); // Navigate after 1 second to show success message
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundImage: 'url(/images/netflix-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <Paper sx={{ p: 3, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          VideoShare
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="auth tabs">
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {tabValue === 1 && (
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />
          )}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            {tabValue === 0 ? 'Login' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Auth;
