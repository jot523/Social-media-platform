const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');
const auth = require('../middleware/auth');

// GET /api/reels — Get all reels
router.get('/', async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate('user', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar isVerified')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(reels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reels — Create a reel (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { caption, videoUrl, thumbnail } = req.body;
    const reel = new Reel({
      user: req.user.id,
      caption,
      videoUrl,
      thumbnail
    });
    await reel.save();
    await reel.populate('user', 'username fullName avatar');
    res.status(201).json(reel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/reels/:id/like — Toggle like
router.put('/:id/like', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const index = reel.likes.indexOf(req.user.id);
    if (index === -1) {
      reel.likes.push(req.user.id);
    } else {
      reel.likes.splice(index, 1);
    }
    reel.views += 1;
    await reel.save();
    res.json({ likes: reel.likes, views: reel.views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reels/:id/comment — Add comment to a reel
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const comment = {
      user: req.user.id,
      text
    };

    reel.comments.push(comment);
    await reel.save();

    const populatedReel = await Reel.findById(req.params.id)
      .populate('comments.user', 'username fullName avatar isVerified');

    res.json(populatedReel.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/reels/:id/save — Toggle save reel
router.put('/:id/save', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.savedReels.indexOf(req.params.id);
    let saved = false;
    if (index === -1) {
      user.savedReels.push(req.params.id);
      saved = true;
    } else {
      user.savedReels.splice(index, 1);
    }
    await user.save();
    res.json({ saved, savedReels: user.savedReels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/reels/:id/share — Share a reel (increment shares)
router.put('/:id/share', async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    reel.shares = (reel.shares || 0) + 1;
    await reel.save();

    res.json({ shares: reel.shares });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
