import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Box, IconButton } from '@mui/material';
import { Share } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ShareModal from './ShareModal';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleShareClick = (e) => {
    e.stopPropagation(); // Prevent card click
    setShareModalOpen(true);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <Card
      onClick={() => navigate(`/video/${video._id}`)}
      sx={{
        maxWidth: 320,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={video.thumbnailUrl ? `http://localhost:5000/uploads/${video.thumbnailUrl.replace('uploads\\', '').replace('uploads/', '')}` : 'https://via.placeholder.com/320x180?text=No+Thumbnail'}
          alt={video.title}
          sx={{ borderRadius: '12px 12px 0 0' }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: '4px',
            fontSize: '0.75rem',
          }}
        >
          {formatDuration(video.duration)}
        </Box>
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {video.title}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
              {video.userId?.username || 'Unknown User'}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
              {formatViews(video.views)} views
            </Typography>
          </Box>
          <IconButton onClick={handleShareClick} sx={{ color: 'white' }}>
            <Share />
          </IconButton>
        </Box>
      </CardContent>
      <ShareModal open={shareModalOpen} onClose={() => setShareModalOpen(false)} video={video} />
    </Card>
  );
};

export default VideoCard;
