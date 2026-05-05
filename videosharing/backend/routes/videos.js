const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Get all videos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, u.username FROM videos v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get videos shared with current user
router.get('/shared', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, u.username FROM videos v
      JOIN users u ON v.user_id = u.id
      JOIN video_shares vs ON vs.video_id = v.id
      WHERE vs.user_id = $1
      ORDER BY v.created_at DESC
    `, [req.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get videos shared by current user
router.get('/shared-by-me', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, u.username FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.user_id = $1 AND EXISTS (SELECT 1 FROM video_shares vs WHERE vs.video_id = v.id)
      ORDER BY v.created_at DESC
    `, [req.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public video
router.get('/public/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, u.username FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = $1 AND v.is_public = TRUE
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Video not found or not public' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, u.username FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Video not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload video
router.post('/', auth, upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
  const { title, description, tags, category } = req.body;
  const videoFile = req.files.video[0];
  const thumbnailFile = req.files.thumbnail[0];

  try {
    const videoOutputPath = path.join('videos', Date.now() + path.extname(videoFile.originalname));
    fs.renameSync(videoFile.path, videoOutputPath);

    const result = await pool.query(
      `INSERT INTO videos (title, description, video_url, thumbnail_url, duration, tags, category, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, videoOutputPath, thumbnailFile.path, 0, tags ? tags.split(',') : [], category, req.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete video
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos WHERE id = $1', [req.params.id]);
    const video = result.rows[0];
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.user_id !== req.userId) return res.status(401).json({ message: 'Not authorized' });

    fs.unlinkSync(video.video_url);
    fs.unlinkSync(video.thumbnail_url);

    await pool.query('DELETE FROM videos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Video deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Dislike video
router.post('/:id/like', auth, async (req, res) => {
  const { type } = req.body;
  try {
    const existing = await pool.query(
      'SELECT * FROM video_likes WHERE user_id = $1 AND video_id = $2',
      [req.userId, req.params.id]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].type === type) {
        await pool.query('DELETE FROM video_likes WHERE user_id = $1 AND video_id = $2', [req.userId, req.params.id]);
      } else {
        await pool.query('UPDATE video_likes SET type = $1 WHERE user_id = $2 AND video_id = $3', [type, req.userId, req.params.id]);
      }
    } else {
      await pool.query('INSERT INTO video_likes (user_id, video_id, type) VALUES ($1, $2, $3)', [req.userId, req.params.id, type]);
    }

    const video = await pool.query('SELECT * FROM videos WHERE id = $1', [req.params.id]);
    res.json(video.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  const { text } = req.body;
  try {
    const video = await pool.query('SELECT id FROM videos WHERE id = $1', [req.params.id]);
    if (video.rows.length === 0) return res.status(404).json({ message: 'Video not found' });

    const result = await pool.query(
      'INSERT INTO comments (text, user_id, video_id) VALUES ($1, $2, $3) RETURNING *',
      [text, req.userId, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for video
router.get('/:id/comments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.username FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.video_id = $1
      ORDER BY c.created_at DESC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share video with specific users
router.post('/:id/share', auth, async (req, res) => {
  const { userIds } = req.body;
  try {
    const video = await pool.query('SELECT * FROM videos WHERE id = $1', [req.params.id]);
    if (video.rows.length === 0) return res.status(404).json({ message: 'Video not found' });
    if (video.rows[0].user_id !== req.userId) return res.status(401).json({ message: 'Not authorized' });

    for (const userId of userIds) {
      await pool.query(
        'INSERT INTO video_shares (video_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.params.id, userId]
      );
    }
    res.json({ message: 'Video shared successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Make video public
router.post('/:id/public', auth, async (req, res) => {
  try {
    const video = await pool.query('SELECT * FROM videos WHERE id = $1', [req.params.id]);
    if (video.rows.length === 0) return res.status(404).json({ message: 'Video not found' });
    if (video.rows[0].user_id !== req.userId) return res.status(401).json({ message: 'Not authorized' });

    await pool.query('UPDATE videos SET is_public = TRUE WHERE id = $1', [req.params.id]);
    res.json({ message: 'Video made public successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
