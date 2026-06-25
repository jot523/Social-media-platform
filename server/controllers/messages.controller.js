/**
 * Messages Controller (MVC — Controller Layer)
 */

const Message = require('../models/Message');
const User    = require('../models/User');

// GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const blockedIds = await User.getBlockedUserIds(userId);

    // Find all messages involving this user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender',   'username fullName avatar isOnline')
      .populate('receiver', 'username fullName avatar isOnline');

    // Build unique conversation list
    const seen = new Map();
    for (const msg of messages) {
      const other = msg.sender._id.toString() === userId
        ? msg.receiver
        : msg.sender;
      
      if (!other) continue;
      const key = other._id.toString();
      
      // Filter out conversations with blocked users
      if (blockedIds.includes(key)) continue;

      if (!seen.has(key)) {
        seen.set(key, {
          user: other,
          lastMessage: {
            text: msg.text,
            mediaUrl: msg.mediaUrl || '',
            mediaType: msg.mediaType || '',
            createdAt: msg.createdAt
          },
          unread: (!msg.read && msg.receiver._id.toString() === userId) ? 1 : 0
        });
      }
    }

    res.json([...seen.values()]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get conversations', error: err.message });
  }
};

// GET /api/messages/:userId
exports.getMessages = async (req, res) => {
  try {
    const myId     = req.user.id;
    const otherId  = req.params.userId;

    const blockedIds = await User.getBlockedUserIds(myId);
    if (blockedIds.includes(otherId.toString())) {
      return res.status(403).json({ message: 'Conversation unavailable due to block settings' });
    }

    const messages = await Message.find({
      $or: [
        { sender: myId,    receiver: otherId },
        { sender: otherId, receiver: myId    }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender',   'username fullName avatar')
      .populate('receiver', 'username fullName avatar');

    // Mark received messages as read
    await Message.updateMany(
      { sender: otherId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get messages', error: err.message });
  }
};

// POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, mediaUrl, mediaType } = req.body;
    if (!receiverId || (!text?.trim() && !mediaUrl)) {
      return res.status(400).json({ message: 'Receiver and text or media are required' });
    }

    const blockedIds = await User.getBlockedUserIds(req.user.id);
    if (blockedIds.includes(receiverId.toString())) {
      return res.status(403).json({ message: 'Cannot send message to a blocked user' });
    }

    const msgData = {
      sender:   req.user.id,
      receiver: receiverId,
      text:     (text || '').trim()
    };

    // Attach media if provided
    if (mediaUrl) {
      msgData.mediaUrl = mediaUrl;
      msgData.mediaType = mediaType || 'image';
    }

    const message = await Message.create(msgData);

    const populated = await message
      .populate('sender',   'username fullName avatar')
      .then(m => m.populate('receiver', 'username fullName avatar'));

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};