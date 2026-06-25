const router = require('express').Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth'); // ensure this exists

// Get conversations (latest message per user)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all messages where the user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    // Group by other user to get latest conversation
    const conversationsMap = new Map();

    for (let msg of messages) {
      const otherUserId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, msg);
      }
    }

    // Populate user details for each conversation
    const conversations = [];
    for (let [otherUserId, lastMessage] of conversationsMap.entries()) {
      const user = await User.findById(otherUserId).select('username fullName avatar');
      if (user) {
        conversations.push({
          user,
          lastMessage
        });
      }
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      text
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
