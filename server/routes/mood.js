const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const MoodSignal = require('../models/MoodSignal');

// Map of standard moods to 7-dimensional one-hot vectors
// Order: [Happy, Sad, Stressed, Bored, Excited, Tired, Focused]
const MOOD_VECTORS = {
  Happy:    [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  Sad:      [0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  Stressed: [0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0],
  Bored:    [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0],
  Excited:  [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0],
  Tired:    [0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0],
  Focused:  [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]
};

// SHA-256 Hashing function for User ID anonymity
const hashUserId = (userId) => {
  return crypto.createHash('sha256').update(userId.toString()).digest('hex');
};

// POST /api/mood/signal — Store/Update latest mood signal (auth required)
router.post('/signal', auth, async (req, res) => {
  try {
    const { mood, confidence, moodVector } = req.body;
    if (!mood) {
      return res.status(400).json({ message: 'Mood label is required' });
    }

    const userIdHash = hashUserId(req.user.id);
    let vector = moodVector;
    if (!vector) {
      vector = MOOD_VECTORS[mood] || [0.14, 0.14, 0.14, 0.14, 0.14, 0.14, 0.14];
    }

    const updatedSignal = await MoodSignal.findOneAndUpdate(
      { userIdHash },
      {
        mood,
        confidence: confidence || 1.0,
        moodVector: vector,
        createdAt: new Date() // updates TTL expiry
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Mood signal recorded',
      signal: {
        mood: updatedSignal.mood,
        confidence: updatedSignal.confidence,
        moodVector: updatedSignal.moodVector,
        createdAt: updatedSignal.createdAt
      }
    });
  } catch (err) {
    console.error('Error recording mood signal:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/mood/current — Retrieve current user's mood signal (auth required)
router.get('/current', auth, async (req, res) => {
  try {
    const userIdHash = hashUserId(req.user.id);
    const signal = await MoodSignal.findOne({ userIdHash });
    
    if (!signal) {
      return res.status(200).json({ mood: null });
    }

    res.status(200).json({
      mood: signal.mood,
      confidence: signal.confidence,
      moodVector: signal.moodVector,
      createdAt: signal.createdAt
    });
  } catch (err) {
    console.error('Error fetching mood signal:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/mood/signal — Clear user's mood signal (auth required)
router.delete('/signal', auth, async (req, res) => {
  try {
    const userIdHash = hashUserId(req.user.id);
    await MoodSignal.deleteOne({ userIdHash });
    res.status(200).json({ message: 'Mood signal cleared successfully' });
  } catch (err) {
    console.error('Error clearing mood signal:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
