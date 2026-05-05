import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, Avatar, Divider } from '@mui/material';
import { AccountCircle, Email } from '@mui/icons-material';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <Typography sx={{ color: 'black' }}>Loading...</Typography>;
  }

  if (!user) {
    return <Typography sx={{ color: 'black' }}>Please log in to view your profile.</Typography>;
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#000', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
        Profile
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            p: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
                <AccountCircle sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {user.username}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Member since: {new Date().toLocaleDateString()}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
