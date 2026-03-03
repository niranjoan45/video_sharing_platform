const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Get all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().populate('userId', 'username').sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get videos shared with the current user
router.get('/shared', auth, async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.userId }).populate('userId', 'username').sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('userId', 'username');
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Upload video
router.post('/', auth, upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
  const { title, description, tags, category } = req.body;
  const videoFile = req.files.video[0];
  const thumbnailFile = req.files.thumbnail[0];

  try {
    // Move video to videos directory without encoding
    const videoOutputPath = path.join('videos', Date.now() + path.extname(videoFile.originalname));
    fs.renameSync(videoFile.path, videoOutputPath);

    // For now, set duration to 0 or estimate; without ffprobe, we can't get exact duration
    const duration = 0; // Placeholder; can be updated later if needed

    const video = new Video({
      title,
      description,
      videoUrl: videoOutputPath,
      thumbnailUrl: thumbnailFile.path,
      duration,
      tags: tags ? tags.split(',') : [],
      category,
      userId: req.userId,
    });

    await video.save();
    res.json(video);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete files
    fs.unlinkSync(video.videoUrl);
    fs.unlinkSync(video.thumbnailUrl);

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Like/Dislike video
router.post('/:id/like', auth, async (req, res) => {
  const { type } = req.body; // 'like' or 'dislike'

  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const existingLike = await Like.findOne({ userId: req.userId, videoId: req.params.id });

    if (existingLike) {
      if (existingLike.type === type) {
        // Remove like/dislike
        await Like.findByIdAndDelete(existingLike._id);
        if (type === 'like') {
          video.likes.pull(req.userId);
        } else {
          video.dislikes.pull(req.userId);
        }
      } else {
        // Change like to dislike or vice versa
        existingLike.type = type;
        await existingLike.save();
        if (type === 'like') {
          video.likes.push(req.userId);
          video.dislikes.pull(req.userId);
        } else {
          video.dislikes.push(req.userId);
          video.likes.pull(req.userId);
        }
      }
    } else {
      // New like/dislike
      const like = new Like({
        userId: req.userId,
        videoId: req.params.id,
        type,
      });
      await like.save();
      if (type === 'like') {
        video.likes.push(req.userId);
      } else {
        video.dislikes.push(req.userId);
      }
    }

    await video.save();
    res.json(video);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  const { text } = req.body;

  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const comment = new Comment({
      text,
      userId: req.userId,
      videoId: req.params.id,
    });

    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get comments for video
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.id }).populate('userId', 'username').sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get videos shared by the current user
router.get('/shared-by-me', auth, async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.userId, sharedWith: { $exists: true, $ne: [] } }).populate('userId', 'username').sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Share video with specific users
router.post('/:id/share', auth, async (req, res) => {
  const { userIds } = req.body;

  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Add users to sharedWith array if not already present
    userIds.forEach(userId => {
      if (!video.sharedWith.includes(userId)) {
        video.sharedWith.push(userId);
      }
    });

    await video.save();
    res.json({ message: 'Video shared successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Make video public
router.post('/:id/public', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    video.isPublic = true;
    await video.save();
    res.json({ message: 'Video made public successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get public video
router.get('/public/:id', async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, isPublic: true }).populate('userId', 'username');
    if (!video) {
      return res.status(404).json({ message: 'Video not found or not public' });
    }
    res.json(video);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
