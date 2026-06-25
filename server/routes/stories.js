const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');

// GET /api/stories — Get all active stories (PUBLIC — no auth required)
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find({
      expiresAt: { $gt: new Date() }
    })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 });
    
    // Group stories by user
    const groupedStories = {};
    stories.forEach(story => {
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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/stories — Create a story (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { mediaUrl, mediaType, caption } = req.body;
    const story = new Story({
      user: req.user.id,
      mediaUrl,
      mediaType,
      caption
    });
    await story.save();
    await story.populate('user', 'username fullName avatar');
    res.status(201).json(story);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/stories/:id/view — Mark story as viewed
router.put('/:id/view', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!story.viewers.includes(req.user.id)) {
      story.viewers.push(req.user.id);
      await story.save();
    }
    res.json({ viewers: story.viewers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/stories/:id — Delete own story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    
    if (story.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await story.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/stories/:id/react — React to a story
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: 'Emoji is required' });

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    // Add reaction
    story.reactions.push({ user: req.user.id, emoji });
    await story.save();

    res.json({ message: 'Reaction added', reactions: story.reactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/stories/:id/reply — Reply to a story
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Reply text is required' });

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    // Add reply
    story.replies.push({ user: req.user.id, text });
    await story.save();

    res.json({ message: 'Reply added', replies: story.replies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
