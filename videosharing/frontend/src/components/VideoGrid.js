import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import VideoCard from './VideoCard';

const VideoGrid = ({ selectedCategory = 'All' }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/videos`);
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        const mappedData = data.map(v => ({
          ...v,
          _id: v.id,
          thumbnailUrl: v.thumbnail_url,
          videoUrl: v.video_url,
          userId: {
            _id: v.user_id,
            username: v.username
          }
        }));
        setVideos(mappedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  const filteredVideos = selectedCategory === 'All' ? videos : videos.filter(video => video.category === selectedCategory);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
        {selectedCategory === 'All' ? 'All Videos' : `${selectedCategory} Videos`}
      </Typography>
      <Grid container spacing={3}>
        {filteredVideos.map((video) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
            <VideoCard video={video} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VideoGrid;
