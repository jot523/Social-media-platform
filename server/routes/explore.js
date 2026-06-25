const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Reel = require('../models/Reel');
const auth = require('../middleware/auth');

// GET /api/explore — Trending posts sorted by engagement score
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const category = req.query.category; // optional filter

    let filter = {};
    if (category) {
      filter.hashtags = category.toLowerCase();
    }

    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      filter.user = { $nin: blockedIds };
    }

    const posts = await Post.find(filter)
      .populate('user', 'username fullName avatar isVerified')
      .populate('comments.user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(200);

    // Score by engagement: likes×1 + comments×2 + shares×3
    const scored = posts.map(post => {
      const likesCount = post.likes ? post.likes.length : 0;
      const commentsCount = post.comments ? post.comments.length : 0;
      const sharesCount = post.shares || 0;
      const score = (likesCount * 1) + (commentsCount * 2) + (sharesCount * 3);
      return { post, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const paginated = scored.slice(skip, skip + limit).map(item => item.post);

    res.json(paginated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/explore/search?q=&type=users|hashtags|posts — Unified search
router.get('/search', auth, async (req, res) => {
  try {
    const q = req.query.q || '';
    const type = req.query.type || 'all';

    if (!q.trim()) return res.json({ users: [], posts: [], hashtags: [] });

    const result = {};

    let blockedIds = [];
    if (req.user) {
      blockedIds = await User.getBlockedUserIds(req.user.id);
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const userFilter = {
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { fullName: { $regex: q, $options: 'i' } }
        ]
      };
      if (req.user) {
        userFilter._id = { $nin: [...blockedIds, req.user.id] };
      }
      result.users = await User.find(userFilter)
        .select('username fullName avatar bio followers isVerified')
        .limit(20);
    }

    // Search posts by caption
    if (type === 'all' || type === 'posts') {
      const postFilter = {
        caption: { $regex: q, $options: 'i' }
      };
      if (req.user) {
        postFilter.user = { $nin: blockedIds };
      }
      result.posts = await Post.find(postFilter)
        .populate('user', 'username fullName avatar isVerified')
        .sort({ createdAt: -1 })
        .limit(20);
    }

    // Search hashtags — aggregate distinct hashtags matching query
    if (type === 'all' || type === 'hashtags') {
      const hashtagAgg = await Post.aggregate([
        { $unwind: '$hashtags' },
        { $match: { hashtags: { $regex: q.replace('#', ''), $options: 'i' } } },
        { $group: { _id: '$hashtags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);
      result.hashtags = hashtagAgg.map(h => ({ tag: h._id, count: h.count }));
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/explore/hashtag/:tag — All posts with a specific hashtag
router.get('/hashtag/:tag', auth, async (req, res) => {
  try {
    const tag = req.params.tag.toLowerCase().replace('#', '');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'top'; // 'top' or 'recent'

    const postFilter = { hashtags: tag };
    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      postFilter.user = { $nin: blockedIds };
    }

    const posts = await Post.find(postFilter)
      .populate('user', 'username fullName avatar isVerified')
      .populate('comments.user', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(200);

    let results;
    if (sort === 'top') {
      // Sort by engagement
      const scored = posts.map(post => {
        const score = (post.likes?.length || 0) + (post.comments?.length || 0) * 2;
        return { post, score };
      });
      scored.sort((a, b) => b.score - a.score);
      results = scored.slice(skip, skip + limit).map(item => item.post);
    } else {
      results = posts.slice(skip, skip + limit);
    }

    // Get total count for this hashtag
    const totalCount = await Post.countDocuments({ hashtags: tag });

    res.json({
      tag,
      totalCount,
      posts: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
