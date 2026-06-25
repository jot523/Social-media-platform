const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  coverUrl: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  genre: {
    type: String,
    default: 'Pop',
    enum: ['Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 'Country', 'Latin', 'Indie', 'Other']
  },
  plays: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Text search index
songSchema.index({ title: 'text', artist: 'text' });

module.exports = mongoose.model('Song', songSchema);
