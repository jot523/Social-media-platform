const mongoose = require('mongoose');

const moodSignalSchema = new mongoose.Schema({
  userIdHash: {
    type: String,
    required: true,
    index: true
  },
  mood: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    default: 1.0
  },
  moodVector: {
    type: [Number],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // TTL of 24 hours (86400 seconds)
  }
});

module.exports = mongoose.model('MoodSignal', moodSignalSchema);
