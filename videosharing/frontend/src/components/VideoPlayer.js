import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, IconButton, TextField, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Paper } from '@mui/material';
import { ThumbUp, ThumbDown, Comment as CommentIcon } from '@mui/icons-material';

const VideoPlayer = () => {
  const { id } = useParams();
  const location = useLocation();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const isPublic = location.pathname.startsWith('/public-video');
        const endpoint = isPublic ? `${process.env.REACT_APP_API_URL}/api/videos/public/${id}` : `${process.env.REACT_APP_API_URL}/api/videos/${id}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        const data = await response.json();
        const mappedData = {
          ...data,
          _id: data.id,
          thumbnailUrl: data.thumbnail_url,
          videoUrl: data.video_url,
          userId: {
            _id: data.user_id,
            username: data.username
          }
        };
        setVideo(mappedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/videos/${id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (err) {
        console.error('Failed to fetch comments', err);
      }
    };

    fetchVideo();
    fetchComments();
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

  const handleLike = async (type) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to like/dislike");
      return;
    }
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/videos/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      alert(`You ${type}d this video!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to comment");
      return;
    }
    
    setSubmittingComment(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/videos/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newComment })
      });
      if (response.ok) {
        const commentsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/videos/${id}/comments`);
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
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
        src={`${process.env.REACT_APP_API_URL}/videos/${video.videoUrl.replace('videos\\', '').replace('videos/', '')}`}
        onError={handleVideoError}
      />
      <Typography variant="body1" sx={{ mt: 2, color: 'white' }}>
        {video.description}
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton sx={{ color: 'white' }} onClick={() => handleLike('like')}>
          <ThumbUp />
        </IconButton>
        <IconButton sx={{ color: 'white' }} onClick={() => handleLike('dislike')}>
          <ThumbDown />
        </IconButton>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommentIcon /> Comments ({comments.length})
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a public comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              }
            }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            disabled={!newComment.trim() || submittingComment}
            onClick={handleCommentSubmit}
          >
            Post
          </Button>
        </Box>

        <Paper sx={{ background: 'transparent', boxShadow: 'none' }}>
          <List>
            {comments.map((comment) => (
              <React.Fragment key={comment.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography component="span" variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>
                        {comment.username || 'Unknown User'}
                        <Typography component="span" variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', ml: 1 }}>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Typography>
                      </Typography>
                    }
                    secondary={
                      <Typography component="span" variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5, display: 'block' }}>
                        {comment.text}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
