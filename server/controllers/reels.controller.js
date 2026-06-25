/**
 * Reels Controller (MVC — Controller Layer)
 */

const Reel = require('../models/Reel');
const User = require('../models/User');

// GET /api/reels
exports.getReels = async (req, res) => {
  try {
    const filter = {};
    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      if (req.query.userId) {
        if (blockedIds.includes(req.query.userId.toString())) {
          return res.json([]);
        }
        filter.user = req.query.userId;
      } else {
        filter.user = { $nin: blockedIds };
      }
    } else if (req.query.userId) {
      filter.user = req.query.userId;
    }

    const reels = await Reel.find(filter)
      .populate('user', 'username fullName avatar isVerified')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(reels);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get reels', error: err.message });
  }
};

// POST /api/reels
exports.createReel = async (req, res) => {
  try {
    const { videoUrl, thumbnail, caption, music } = req.body;
    if (!videoUrl) return res.status(400).json({ message: 'Video URL is required' });

    const reel = await Reel.create({
      user: req.user.id,
      videoUrl,
      thumbnail,
      caption,
      music
    });

    const populated = await reel.populate('user', 'username fullName avatar isVerified');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create reel', error: err.message });
  }
};

// PUT /api/reels/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const reel    = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const idx   = reel.likes.findIndex(id => id.toString() === req.user.id);
    const liked = idx === -1;
    if (liked) reel.likes.push(req.user.id);
    else reel.likes.splice(idx, 1);

    await reel.save();
    res.json({ liked, likeCount: reel.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle like', error: err.message });
  }
};

// PUT /api/reels/:id/save
exports.toggleSave = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.savedReels) user.savedReels = [];

    const reelId = req.params.id;
    const saveIdx = user.savedReels.findIndex(id => id.toString() === reelId);
    const saved = saveIdx === -1;

    if (saved) {
      user.savedReels.push(reelId);
    } else {
      user.savedReels.splice(saveIdx, 1);
    }

    await user.save();
    res.json({ saved, savedReels: user.savedReels });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle save on reel', error: err.message });
  }
};

// GET /api/reels/saved
exports.getSavedReels = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedReels',
      populate: {
        path: 'user',
        select: 'username fullName avatar isVerified'
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.savedReels || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch saved reels', error: err.message });
  }
};

// POST /api/reels/:id/comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });

    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    reel.comments.push({
      user: req.user.id,
      text: text.trim()
    });
    await reel.save();

    await reel.populate('comments.user', 'username fullName avatar isVerified');
    res.status(201).json(reel.comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment to reel', error: err.message });
  }
};

// PUT /api/reels/:id/share
exports.shareReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    reel.shares = (reel.shares || 0) + 1;
    await reel.save();
    res.json({ shares: reel.shares });
  } catch (err) {
    res.status(500).json({ message: 'Failed to share reel', error: err.message });
  }
};