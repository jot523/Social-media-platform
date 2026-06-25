/**
 * Posts Controller (MVC — Controller Layer)
 * Handles HTTP request/response for post operations.
 * Delegates business logic to PostsService.
 */

const Post         = require('../models/Post');
const User         = require('../models/User');
const Notification = require('../models/Notification');

// ── GET /api/posts ─────────────────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const userId = req.user.id;
    const blockedIds = await User.getBlockedUserIds(userId);
    const feedFilter = { user: { $nin: blockedIds } };

    const crypto = require('crypto');
    const MoodSignal = require('../models/MoodSignal');
    
    let activeMoodSignal = null;
    if (userId) {
      const userIdHash = crypto.createHash('sha256').update(userId.toString()).digest('hex');
      activeMoodSignal = await MoodSignal.findOne({ userIdHash });
    }

    let posts;
    let total;
    let scoredCandidates;

    if (activeMoodSignal && req.query.moodRank !== 'false') {
      // Fetch latest 200 posts to rank
      const candidates = await Post.find(feedFilter)
        .populate('user', 'username fullName avatar isVerified')
        .populate('comments.user', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(200);

      const userVector = activeMoodSignal.moodVector;

      // Score and sort candidates
      scoredCandidates = candidates.map(post => {
        const postVector = post.moodVector && post.moodVector.length === 7 
          ? post.moodVector 
          : [0.14, 0.14, 0.14, 0.14, 0.14, 0.14, 0.14];

        // 1. Mood affinity dot product
        let moodAffinity = 0;
        for (let i = 0; i < 7; i++) {
          moodAffinity += userVector[i] * postVector[i];
        }

        // 2. Social engagement score normalized via tanh
        const likesCount = post.likes ? post.likes.length : 0;
        const commentsCount = post.comments ? post.comments.length : 0;
        const sharesCount = post.shares || 0;
        const engagementRaw = (likesCount * 1) + (commentsCount * 2) + (sharesCount * 3);
        const socialEngagement = Math.tanh(engagementRaw / 10);

        // 3. Score weighting: 60% mood, 40% engagement
        const score = (0.6 * moodAffinity) + (0.4 * socialEngagement);

        return { post, score };
      });

      // Sort descending by calculated score
      scoredCandidates.sort((a, b) => b.score - a.score);

      // Paginate scored results
      posts = scoredCandidates.slice(skip, skip + limit).map(item => item.post);
      total = scoredCandidates.length;
    } else {
      // Default chronological query
      [posts, total] = await Promise.all([
        Post.find(feedFilter)
          .populate('user', 'username fullName avatar isVerified')
          .populate('comments.user', 'username avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Post.countDocuments(feedFilter)
      ]);
    }

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
};

// ── GET /api/posts/:id ─────────────────────────────────────────
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username fullName avatar isVerified')
      .populate('comments.user', 'username avatar');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.user) {
      const blockedIds = await User.getBlockedUserIds(req.user.id);
      if (blockedIds.includes(post.user._id.toString())) {
        return res.status(403).json({ message: 'Post unavailable' });
      }
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch post', error: err.message });
  }
};

// ── POST /api/posts ────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const { caption, image, images } = req.body;
    if (!caption && !image && (!images || images.length === 0)) {
      return res.status(400).json({ message: 'Post must have caption or image(s)' });
    }

    const postData = {
      user: req.user.id,
      caption
    };

    // Support multi-image carousel: prefer images[] array, fallback to single image
    if (images && images.length > 0) {
      postData.images = images;
      postData.image = images[0]; // primary image for backward compat
    } else if (image) {
      postData.image = image;
      // pre-save hook will mirror to images[]
    }

    const post = await Post.create(postData);

    // Async tag the post's mood vector in the background
    try {
      const { queuePostTagging } = require('../services/moodTagger.service');
      queuePostTagging(post._id);
    } catch (e) {
      console.error('Mood tagging queue failed to initialize:', e.message);
    }

    const populated = await post.populate('user', 'username fullName avatar isVerified');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  }
};

// ── DELETE /api/posts/:id ──────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorised' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post', error: err.message });
  }
};

// ── PUT /api/posts/:id/like ────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId   = req.user.id;
    const likeIdx  = post.likes.findIndex(id => id.toString() === userId);
    const liked    = likeIdx === -1;

    if (liked) {
      post.likes.push(userId);
      // Create notification (don't await — fire and forget)
      if (post.user.toString() !== userId) {
        Notification.create({
          recipient: post.user,
          sender:    userId,
          type:      'like',
          post:      post._id,
          message:   'liked your post'
        }).catch(() => {});
      }
    } else {
      post.likes.splice(likeIdx, 1);
    }

    await post.save();
    res.json({ liked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle like', error: err.message });
  }
};

// ── POST /api/posts/:id/comment ────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = { user: req.user.id, text: text.trim() };
    post.comments.push(comment);
    await post.save();

    await post.populate({
      path: 'comments.user',
      select: 'username fullName avatar isVerified'
    });
    const saved = post.comments[post.comments.length - 1];

    // Notification
    if (post.user.toString() !== req.user.id) {
      Notification.create({
        recipient: post.user,
        sender:    req.user.id,
        type:      'comment',
        post:      post._id,
        message:   'commented on your post'
      }).catch(() => {});
    }

    res.status(201).json({ comment: saved });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

// ── PUT /api/posts/:id/save ────────────────────────────────────
exports.toggleSave = async (req, res) => {
  try {
    const user    = await User.findById(req.user.id);
    const postId  = req.params.id;
    const saveIdx = user.savedPosts.findIndex(id => id.toString() === postId);
    const saved   = saveIdx === -1;

    if (saved) {
      user.savedPosts.push(postId);
    } else {
      user.savedPosts.splice(saveIdx, 1);
    }

    await user.save();
    res.json({ saved });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle save', error: err.message });
  }
};

// ── GET /api/posts/saved ──────────────────────────────────────
exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedPosts',
      populate: {
        path: 'user',
        select: 'username fullName avatar isVerified'
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ posts: user.savedPosts || [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch saved posts', error: err.message });
  }
};

// ── POST /api/posts/:id/share ──────────────────────────────────
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.shares = (post.shares || 0) + 1;
    await post.save();
    res.json({ shareCount: post.shares });
  } catch (err) {
    res.status(500).json({ message: 'Failed to share post', error: err.message });
  }
};