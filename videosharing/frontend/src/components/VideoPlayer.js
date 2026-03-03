import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const VideoPlayer = () => {
  const { id } = useParams();
  const location = useLocation();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const isPublic = location.pathname.startsWith('/public-video');
        const endpoint = isPublic ? `http://localhost:5000/api/videos/public/${id}` : `http://localhost:5000/api/videos/${id}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        const data = await response.json();
        setVideo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, location.pathname]);

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

  const handleVideoError = (e) => {
    console.error('Video loading error:', e);
    setVideoError('Failed to load video. Please check the video file.');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'white', fontWeight: 'bold' }}>
        {video.title}
      </Typography>
      {videoError && (
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {videoError}
        </Typography>
      )}
      <video
        controls
        width="100%"
        style={{ maxHeight: '70vh' }}
        preload="metadata"
        src={`http://localhost:5000/videos/${video.videoUrl.replace('videos\\', '').replace('videos/', '')}`}
        onError={handleVideoError}
      />
      <Typography variant="body1" sx={{ mt: 2, color: 'white' }}>
        {video.description}
      </Typography>
    </Box>
  );
};

export default VideoPlayer;
