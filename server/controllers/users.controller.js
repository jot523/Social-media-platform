/**
 * Users Controller (MVC — Controller Layer)
 */

const User         = require('../models/User');
const Post         = require('../models/Post');
const Notification = require('../models/Notification');

// ── GET /api/users/me ──────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('privacySettings.blockedUsers', 'username fullName avatar isVerified');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

// ── GET /api/users/search?q= ───────────────────────────────────
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json([]);

    const searchTerm = q.trim();

    // Check if searching for a hashtag
    if (searchTerm.startsWith('#')) {
      const tag = searchTerm.substring(1).toLowerCase();
      if (!tag) return res.json([]);
      // Find users who have posts with this hashtag
      const posts = await Post.find({ hashtags: tag }).select('user').limit(50);
      const userIds = [...new Set(posts.map(p => p.user.toString()))];
      const blockedIds = req.user ? await User.getBlockedUserIds(req.user.id) : [];
      const users = await User.find({
        _id: { $in: userIds, $nin: blockedIds }
      }).select('-password').limit(10);
      return res.json(users);
    }

    const orConditions = [
      { username: { $regex: searchTerm, $options: 'i' } },
      { fullName: { $regex: searchTerm, $options: 'i' } },
      { email:    { $regex: searchTerm, $options: 'i' } }
    ];

    if (searchTerm.match(/^[0-9a-fA-F]{24}$/)) {
      orConditions.push({ _id: searchTerm });
    }

    const query = { $or: orConditions };

    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      query._id = { $nin: blockedIds };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(20);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};

// ── GET /api/users/suggestions ─────────────────────────────────
exports.getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const blockedIds = await User.getBlockedUserIds(req.user.id);
    const excluded    = [req.user.id, ...currentUser.following, ...blockedIds];

    const users = await User.find({ _id: { $nin: excluded } })
      .select('-password')
      .limit(5);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get suggestions', error: err.message });
  }
};

// ── GET /api/users/:id ─────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const targetId = req.params.id;
    let user;
    if (targetId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(targetId).select('-password');
    } else {
      user = await User.findOne({ username: targetId }).select('-password');
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      if (blockedIds.includes(user._id.toString())) {
        return res.status(403).json({ message: 'Profile unavailable' });
      }
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

// ── GET /api/users/:id/posts ───────────────────────────────────
exports.getUserPosts = async (req, res) => {
  try {
    const targetId = req.params.id;
    let userId = targetId;
    if (!targetId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ username: targetId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      userId = user._id;
    }

    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      if (blockedIds.includes(userId.toString())) {
        return res.status(403).json({ message: 'Profile unavailable' });
      }
    }

    const posts = await Post.find({ user: userId })
      .populate('user', 'username fullName avatar isVerified')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user posts', error: err.message });
  }
};

// ── PUT /api/users/:id/follow ──────────────────────────────────
exports.toggleFollow = async (req, res) => {
  try {
    let targetId = req.params.id;
    if (!targetId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ username: targetId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      targetId = user._id;
    }

    if (targetId.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      if (blockedIds.includes(targetId.toString())) {
        return res.status(403).json({ message: 'Action not allowed' });
      }
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(targetId)
    ]);

    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const followIdx = currentUser.following.findIndex(id => id.toString() === targetId.toString());
    const following = followIdx === -1;

    if (following) {
      currentUser.following.push(targetId);
      targetUser.followers.push(req.user.id);
      // Notification
      Notification.create({
        recipient: targetId,
        sender:    req.user.id,
        type:      'follow',
        message:   'started following you'
      }).catch(() => {});
    } else {
      currentUser.following.splice(followIdx, 1);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);
    res.json({
      following,
      targetFollowerCount: targetUser.followers.length,
      targetFollowingCount: targetUser.following.length,
      myFollowingCount: currentUser.following.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle follow', error: err.message });
  }
};

// ── PUT /api/users/profile ─────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, username, bio, website, location, avatar, coverPhoto } = req.body;

    // Check username uniqueness
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existing) return res.status(400).json({ message: 'Username already taken' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { fullName, username, bio, website, location, avatar, coverPhoto } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// ── GET /api/users/:id/followers ──────────────────────────────
exports.getFollowers = async (req, res) => {
  try {
    let userId = req.params.id;
    // Support lookup by username if not a valid ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ username: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      userId = user._id;
    }

    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      if (blockedIds.includes(userId.toString())) {
        return res.status(403).json({ message: 'Profile unavailable' });
      }
    }

    const user = await User.findById(userId)
      .populate('followers', 'username fullName avatar isVerified followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.followers || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch followers', error: err.message });
  }
};

// ── GET /api/users/:id/following ──────────────────────────────
exports.getFollowing = async (req, res) => {
  try {
    let userId = req.params.id;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ username: userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      userId = user._id;
    }

    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      if (blockedIds.includes(userId.toString())) {
        return res.status(403).json({ message: 'Profile unavailable' });
      }
    }

    const user = await User.findById(userId)
      .populate('following', 'username fullName avatar isVerified followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.following || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch following list', error: err.message });
  }
};

// ── PUT /api/users/change-password ─────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update password', error: err.message });
  }
};

// ── PUT /api/users/settings ────────────────────────────────────
exports.updateSettings = async (req, res) => {
  try {
    const { notificationSettings, privacySettings, themeSettings, personalDetails, metaSync } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (notificationSettings) {
      user.notificationSettings = {
        ...user.notificationSettings,
        ...notificationSettings
      };
    }
    
    if (privacySettings) {
      user.privacySettings = {
        ...user.privacySettings,
        ...privacySettings
      };
      if (privacySettings.privateAccount !== undefined) {
        user.isPrivate = privacySettings.privateAccount;
      }
    }
    
    if (themeSettings) {
      user.themeSettings = {
        ...user.themeSettings,
        ...themeSettings
      };
    }
    
    if (personalDetails) {
      user.personalDetails = {
        ...user.personalDetails,
        ...personalDetails
      };
    }
    
    if (metaSync) {
      user.metaSync = {
        ...user.metaSync,
        ...metaSync
      };
    }
    
    await user.save();
    
    const updatedUser = await User.findById(req.user.id)
      .select('-password')
      .populate('privacySettings.blockedUsers', 'username fullName avatar isVerified');
      
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings', error: err.message });
  }
};

// ── PUT /api/users/block/:id ───────────────────────────────────
exports.toggleBlock = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ message: 'Target user not found' });
    
    if (!user.privacySettings) {
      user.privacySettings = { blockedUsers: [] };
    }
    
    const isBlocked = user.privacySettings.blockedUsers.some(id => id.toString() === targetId);
    
    if (isBlocked) {
      user.privacySettings.blockedUsers = user.privacySettings.blockedUsers.filter(id => id.toString() !== targetId);
    } else {
      user.privacySettings.blockedUsers.push(targetId);
      // Clean up following / followers links
      user.following = user.following.filter(id => id.toString() !== targetId);
      user.followers = user.followers.filter(id => id.toString() !== targetId);
      
      targetUser.following = targetUser.following.filter(id => id.toString() !== req.user.id);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
      await targetUser.save();
    }
    
    await user.save();
    
    const updatedUser = await User.findById(req.user.id)
      .select('-password')
      .populate('privacySettings.blockedUsers', 'username fullName avatar isVerified');
      
    res.json({ user: updatedUser, blocked: !isBlocked });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle block status', error: err.message });
  }
};

// ── POST /api/users/highlights ─────────────────────────────────
exports.createHighlight = async (req, res) => {
  try {
    const { title, coverImage, storyIds } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Highlight title is required' });
    }
    if (!storyIds || storyIds.length === 0) {
      return res.status(400).json({ message: 'At least one story is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const highlight = {
      title: title.trim(),
      coverImage: coverImage || '',
      stories: storyIds
    };

    user.highlights.push(highlight);
    await user.save();

    // Return the newly created highlight (last item in array)
    const created = user.highlights[user.highlights.length - 1];
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create highlight', error: err.message });
  }
};

// ── DELETE /api/users/highlights/:highlightId ──────────────────
exports.deleteHighlight = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const highlightIdx = user.highlights.findIndex(
      h => h._id.toString() === req.params.highlightId
    );
    if (highlightIdx === -1) {
      return res.status(404).json({ message: 'Highlight not found' });
    }

    user.highlights.splice(highlightIdx, 1);
    await user.save();

    res.json({ message: 'Highlight deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete highlight', error: err.message });
  }
};

// ── GET /api/users/:id/highlights ──────────────────────────────
exports.getHighlights = async (req, res) => {
  try {
    let userId = req.params.id;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      const found = await User.findOne({ username: userId });
      if (!found) return res.status(404).json({ message: 'User not found' });
      userId = found._id;
    }

    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      if (blockedIds.includes(userId.toString())) {
        return res.status(403).json({ message: 'Profile unavailable' });
      }
    }

    const user = await User.findById(userId)
      .select('highlights')
      .populate({
        path: 'highlights.stories',
        select: 'mediaUrl mediaType caption bgColor textOverlay user createdAt',
        populate: { path: 'user', select: 'username fullName avatar' }
      });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.highlights || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch highlights', error: err.message });
  }
};