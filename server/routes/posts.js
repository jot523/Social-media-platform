const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET /api/posts — Get all posts (public feed, optionally ranked by mood)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Optional Auth Parsing
    let userId = null;
    const authHeader = req.header('Authorization');
    let token = req.header('x-auth-token');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (token && !token.startsWith('mock_jwt_token_')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'connecto_super_secret_jwt_key_2024_xyz');
        userId = decoded.id;
      } catch (err) {
        // Treat as unauthenticated if token is invalid
      }
    }

    const crypto = require('crypto');
    const MoodSignal = require('../models/MoodSignal');
    
    let activeMoodSignal = null;
    if (userId) {
      const userIdHash = crypto.createHash('sha256').update(userId.toString()).digest('hex');
      activeMoodSignal = await MoodSignal.findOne({ userIdHash });
    }

    let posts;
    // Rank by mood if user is logged in, has active signal, and ranking is not disabled
    if (activeMoodSignal && req.query.moodRank !== 'false') {
      // Fetch latest 200 posts to rank
      const candidates = await Post.find()
        .populate('user', 'username fullName avatar')
        .populate('comments.user', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(200);

      const userVector = activeMoodSignal.moodVector;

      // Score and sort candidates
      const scoredCandidates = candidates.map(post => {
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
    } else {
      // Default chronological query
      posts = await Post.find()
        .populate('user', 'username fullName avatar')
        .populate('comments.user', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    const total = (activeMoodSignal && req.query.moodRank !== 'false' && typeof scoredCandidates !== 'undefined')
      ? scoredCandidates.length
      : await Post.countDocuments();

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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/saved — Get all saved posts for authenticated user
router.get('/saved', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const userObj = await User.findById(req.user.id).populate({
      path: 'savedPosts',
      populate: {
        path: 'user',
        select: 'username fullName avatar isVerified'
      }
    });
    if (!userObj) return res.status(404).json({ message: 'User not found' });
    res.json(userObj.savedPosts || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:id — Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts — Create a post (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { caption, image } = req.body;
    const post = new Post({
      user: req.user.id,
      caption,
      image
    });
    await post.save();

    // Async tag the post's mood vector in the background
    const { queuePostTagging } = require('../services/moodTagger.service');
    queuePostTagging(post._id);

    await post.populate('user', 'username fullName avatar');
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// DELETE /api/posts/:id — Delete own post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/posts/:id/like — Toggle like
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(req.user.id);
    const isLiking = index === -1;

    if (isLiking) {
      post.likes.push(req.user.id);
      // Create notification for post owner (not for self-likes)
      if (post.user.toString() !== req.user.id) {
        const notification = await Notification.create({
          recipient: post.user,
          sender: req.user.id,
          type: 'like',
          post: post._id,
          message: 'liked your post'
        });
        const populated = await Notification.findById(notification._id)
          .populate('sender', 'username fullName avatar');
        
        const getOnlineUser = req.app.get('getOnlineUser');
        const recipientUser = getOnlineUser(post.user);
        if (recipientUser) {
          req.io.to(recipientUser.socketId).emit('getNotification', populated);
        }
      }
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json({ likes: post.likes, liked: isLiking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts/:id/comment — Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      user: req.user.id,
      text: req.body.text
    });
    await post.save();
    await post.populate('comments.user', 'username fullName avatar');

    // Create notification for post owner
    if (post.user.toString() !== req.user.id) {
      const notification = await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        type: 'comment',
        post: post._id,
        message: `commented: "${req.body.text.substring(0, 50)}"`
      });
      const populated = await Notification.findById(notification._id)
        .populate('sender', 'username fullName avatar');
      
      const getOnlineUser = req.app.get('getOnlineUser');
      const recipientUser = getOnlineUser(post.user);
      if (recipientUser) {
        req.io.to(recipientUser.socketId).emit('getNotification', populated);
      }
    }

    res.json(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/posts/:id/save — Toggle save post
router.put('/:id/save', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    const savedIndex = user.savedPosts ? user.savedPosts.indexOf(req.params.id) : -1;
    if (savedIndex === -1) {
      if (!user.savedPosts) user.savedPosts = [];
      user.savedPosts.push(req.params.id);
    } else {
      user.savedPosts.splice(savedIndex, 1);
    }
    await user.save();
    res.json({ saved: savedIndex === -1, savedPosts: user.savedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
