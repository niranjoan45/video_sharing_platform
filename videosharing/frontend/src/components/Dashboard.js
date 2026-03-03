import React, { useState } from 'react';
import { Box } from '@mui/material';
import HeroBanner from './HeroBanner';
import CategoryChips from './CategoryChips';
import VideoGrid from './VideoGrid';

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <Box sx={{ backgroundImage: 'url(/images/netflix-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: '200vh' }}>
      <HeroBanner />
      <CategoryChips
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      <VideoGrid selectedCategory={selectedCategory} />
    </Box>
  );
};

export default Dashboard;
