import React from 'react';
import { Box, Chip } from '@mui/material';

const CategoryChips = ({ selectedCategory, onCategoryChange }) => {
  const categories = ['All', 'Music', 'Gaming', 'Education', 'Entertainment', 'Sports', 'Technology'];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        pb: 1,
        px: 2,
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
      }}
    >
      {categories.map((category) => (
        <Chip
          key={category}
          label={category}
          clickable
          variant={selectedCategory === category ? 'filled' : 'outlined'}
          color={selectedCategory === category ? 'primary' : 'default'}
          onClick={() => onCategoryChange(category)}
          sx={{
            minWidth: 'fit-content',
            backgroundColor: selectedCategory === category ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
            color: selectedCategory === category ? 'white' : 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              backgroundColor: selectedCategory === category ? 'primary.dark' : 'rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      ))}
    </Box>
  );
};

export default CategoryChips;
