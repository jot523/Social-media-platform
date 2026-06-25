const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET /api/users/search?q=query — Search users
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) return res.json([]);
    
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ]
    })
      .select('username fullName avatar bio followers isVerified')
      .limit(10);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/suggestions — Get user suggestions (public, optionally filtered by auth)
router.get('/suggestions', async (req, res) => {
  try {
    // Try to extract user ID from token if present (optional auth)
    let excludeIds = [];
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token && !token.startsWith('mock_jwt_token_')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'connecto_super_secret_jwt_key_2024_xyz');
        const currentUser = await User.findById(decoded.id);
        if (currentUser) {
          excludeIds = [...(currentUser.following || []), decoded.id];
        }
      } catch { /* treat as unauthenticated */ }
    }

    const users = await User.find(excludeIds.length ? { _id: { $nin: excludeIds } } : {})
      .select('username fullName avatar bio followers isVerified')
      .limit(8);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/me — Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('followers', 'username fullName avatar')
      .populate('following', 'username fullName avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id — Get user profile by ID or username
router.get('/:id', async (req, res) => {
  try {
    let user;
    // Try by ID first, then by username
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(req.params.id)
        .select('-password')
        .populate('followers', 'username fullName avatar')
        .populate('following', 'username fullName avatar');
    } else {
      user = await User.findOne({ username: req.params.id })
        .select('-password')
        .populate('followers', 'username fullName avatar')
        .populate('following', 'username fullName avatar');
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id/follow — Toggle follow
router.put('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json({ message: 'User not found' });

    const isFollowing = currentUser.following.some(id => id.toString() === req.params.id);

    if (!isFollowing) {
      currentUser.following.addToSet(req.params.id);
      userToFollow.followers.addToSet(req.user.id);
      // Create follow notification
      const notification = await Notification.create({
        recipient: req.params.id,
        sender: req.user.id,
        type: 'follow',
        message: 'started following you'
      });
      const populated = await Notification.findById(notification._id)
        .populate('sender', 'username fullName avatar');
      
      const getOnlineUser = req.app.get('getOnlineUser');
      const recipientUser = getOnlineUser(req.params.id);
      if (recipientUser) {
        req.io.to(recipientUser.socketId).emit('getNotification', populated);
      }
    } else {
      currentUser.following.pull(req.params.id);
      userToFollow.followers.pull(req.user.id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ 
      following: currentUser.following,
      isFollowing: !isFollowing,
      followerCount: userToFollow.followers.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/profile — Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, bio, avatar, coverPhoto, website, location } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (coverPhoto !== undefined) user.coverPhoto = coverPhoto;
    if (website !== undefined) user.website = website;
    if (location !== undefined) user.location = location;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id/posts — Get user's posts
router.get('/:id/posts', async (req, res) => {
  try {
    let userId = req.params.id;
    // If username passed, resolve to ID
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ username: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      userId = user._id;
    }
    const posts = await Post.find({ user: userId })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id/followers — Get user's followers list
router.get('/:id/followers', async (req, res) => {
  try {
    let userId = req.params.id;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ username: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      userId = user._id;
    }
    const user = await User.findById(userId).populate('followers', 'username fullName avatar isVerified followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.followers || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id/following — Get user's following list
router.get('/:id/following', async (req, res) => {
  try {
    let userId = req.params.id;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ username: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      userId = user._id;
    }
    const user = await User.findById(userId).populate('following', 'username fullName avatar isVerified followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.following || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
