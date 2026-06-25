/**
 * Stories Controller (MVC — Controller Layer)
 */

const Story = require('../models/Story');
const User  = require('../models/User');

// GET /api/stories
exports.getStories = async (req, res) => {
  try {
    const blockedIds = await User.getBlockedUserIds(req.user.id);
    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
      user: { $nin: blockedIds }
    })
      .populate('user', 'username fullName avatar isVerified')
      .sort({ createdAt: -1 });

    const groupedStories = {};
    stories.forEach(story => {
      if (!story.user) return;
      const userId = story.user._id.toString();
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: story.user,
          stories: []
        };
      }
      groupedStories[userId].stories.push(story);
    });

    res.json(Object.values(groupedStories));
  } catch (err) {
    res.status(500).json({ message: 'Failed to get stories', error: err.message });
  }
};

// POST /api/stories
exports.createStory = async (req, res) => {
  try {
    const { mediaUrl, mediaType, caption, bgColor, textOverlay } = req.body;
    if (mediaType !== 'text' && !mediaUrl) {
      return res.status(400).json({ message: 'Media URL is required' });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const story = await Story.create({
      user: req.user.id,
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'image',
      caption,
      bgColor: bgColor || '',
      textOverlay: textOverlay || '',
      expiresAt
    });

    const populated = await story.populate('user', 'username fullName avatar isVerified');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create story', error: err.message });
  }
};

// PUT /api/stories/:id/view
exports.viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!story.viewers.includes(req.user.id)) {
      story.viewers.push(req.user.id);
      await story.save();
    }
    res.json({ viewed: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark story viewed', error: err.message });
  }
};

// DELETE /api/stories/:id
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    await story.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete story', error: err.message });
  }
};

// POST /api/stories/:id/react
exports.reactStory = async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: 'Emoji is required' });

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    story.reactions.push({
      user: req.user.id,
      emoji
    });
    await story.save();

    // Create notification
    if (story.user.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      Notification.create({
        recipient: story.user,
        sender: req.user.id,
        type: 'story_reaction',
        message: `reacted ${emoji} to your story`
      }).catch(() => {});
    }

    res.json({ success: true, reactions: story.reactions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to react to story', error: err.message });
  }
};

// POST /api/stories/:id/reply
exports.replyStory = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Reply text is required' });

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    story.replies.push({
      user: req.user.id,
      text: text.trim()
    });
    await story.save();

    // Create notification
    if (story.user.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      Notification.create({
        recipient: story.user,
        sender: req.user.id,
        type: 'story_reply',
        message: `replied to your story: "${text.substring(0, 50)}"`
      }).catch(() => {});
    }

    res.json({ success: true, replies: story.replies });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reply to story', error: err.message });
  }
};