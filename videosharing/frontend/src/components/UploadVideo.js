import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, MenuItem } from '@mui/material';

const UploadVideo = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['Music', 'Gaming', 'Education', 'Entertainment', 'Sports', 'Technology'];

  const handleVideoFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleThumbnailFileChange = (event) => {
    setThumbnailFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to upload videos. Please login first.');
      setUploading(false);
      return;
    }

    if (!videoFile || !thumbnailFile) {
      setError('Please select both video and thumbnail files');
      setUploading(false);
      return;
    }

    if (!title || !category) {
      setError('Please fill in all required fields (title and category)');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('video', videoFile);
    formData.append('thumbnail', thumbnailFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSuccess('Video uploaded successfully!');
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('');
        setTags('');
        setVideoFile(null);
        setThumbnailFile(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Upload Video
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            select
            fullWidth
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            margin="normal"
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            margin="normal"
            placeholder="e.g. tutorial, react, javascript"
          />
          <input
            accept="video/*"
            style={{ display: 'none' }}
            id="video-file"
            type="file"
            onChange={handleVideoFileChange}
          />
          <label htmlFor="video-file">
            <Button variant="contained" component="span" sx={{ mt: 2, mr: 2 }}>
              Choose Video File
            </Button>
          </label>
          {videoFile && <Typography variant="body2">Video: {videoFile.name}</Typography>}

          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="thumbnail-file"
            type="file"
            onChange={handleThumbnailFileChange}
          />
          <label htmlFor="thumbnail-file">
            <Button variant="outlined" component="span" sx={{ mt: 2, mr: 2 }}>
              Choose Thumbnail
            </Button>
          </label>
          {thumbnailFile && <Typography variant="body2">Thumbnail: {thumbnailFile.name}</Typography>}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default UploadVideo;
