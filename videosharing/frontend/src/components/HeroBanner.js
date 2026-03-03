import React from 'react';
import { Box, Typography } from '@mui/material';

const HeroBanner = () => {
  return (
    <Box
      sx={{
        height: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #01030eff 0%, #580404ff 100%)',
        color: 'white',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        sx={{
          fontWeight: 'bold',
          fontSize: { xs: '2rem', md: '3rem' },
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        Discover Amazing Videos
      </Typography>
    </Box>
  );
};

export default HeroBanner;
