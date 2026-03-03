const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true,
  },
}, { timestamps: true });

// Ensure a user can only have one like/dislike per video
likeSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
