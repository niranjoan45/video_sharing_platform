import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Home, Search, LibraryAdd, AccountCircle, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Home />, label: 'Home', path: '/dashboard' },
    { icon: <Search />, label: 'Search', path: '/dashboard' },
    { icon: <LibraryAdd />, label: 'Upload', path: '/upload' },
    { icon: <AccountCircle />, label: 'Profile', path: '/profile' },
    { icon: <Settings />, label: 'Settings', path: '/dashboard' },
  ];

  return (
    <Box
      sx={{
        width: 80,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {menuItems.map((item, index) => (
        <Tooltip key={index} title={item.label} placement="right">
          <IconButton
            onClick={() => navigate(item.path)}
            sx={{
              color: 'white',
              mb: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {item.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

export default Sidebar;
