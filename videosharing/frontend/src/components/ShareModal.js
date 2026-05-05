import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Snackbar,
} from '@mui/material';
import { Close, ContentCopy } from '@mui/icons-material';
import axios from 'axios';

const ShareModal = ({ open, onClose, video }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShareWithUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/videos/${video._id}/share`,
        { userIds: selectedUsers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbarMessage('Video shared successfully!');
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error('Error sharing video:', error);
      setSnackbarMessage('Error sharing video');
      setSnackbarOpen(true);
    }
  };

  const handleMakePublic = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/videos/${video._id}/public`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbarMessage('Video made public!');
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error('Error making video public:', error);
      setSnackbarMessage('Error making video public');
      setSnackbarOpen(true);
    }
  };

  const handleCopyLink = () => {
    const publicLink = `${window.location.origin}/public-video/${video._id}`;
    navigator.clipboard.writeText(publicLink);
    setSnackbarMessage('Public link copied to clipboard!');
    setSnackbarOpen(true);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Share Video</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {video.title}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={handleCopyLink} startIcon={<ContentCopy />} fullWidth>
              Copy Public Link
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Button variant="contained" onClick={handleMakePublic} fullWidth>
              Make Public
            </Button>
          </Box>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Share with Users
          </Typography>
          <List sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
            {users.map((user) => (
              <ListItem key={user._id} dense button onClick={() => handleUserToggle(user._id)}>
                <Checkbox checked={selectedUsers.includes(user._id)} />
                <ListItemText primary={user.username} secondary={user.email} />
              </ListItem>
            ))}
          </List>

          <Button variant="contained" onClick={handleShareWithUsers} fullWidth disabled={selectedUsers.length === 0}>
            Share with Selected Users
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default ShareModal;
