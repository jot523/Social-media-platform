/**
 * Calls Controller (MVC — Controller Layer)
 * Handles call history persistence
 */

const Call = require('../models/Call');
const Notification = require('../models/Notification');

// POST /api/calls — Create a call record
exports.createCall = async (req, res) => {
  try {
    const { calleeId, callType } = req.body;
    if (!calleeId || !callType) {
      return res.status(400).json({ message: 'calleeId and callType are required' });
    }

    const call = await Call.create({
      caller: req.user.id,
      callee: calleeId,
      callType,
      status: 'initiated',
      startedAt: new Date()
    });

    res.status(201).json(call);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create call record', error: err.message });
  }
};

// PUT /api/calls/:id — Update call record (status, duration)
exports.updateCall = async (req, res) => {
  try {
    const { status, duration } = req.body;
    const update = {};

    if (status) update.status = status;
    if (duration !== undefined) update.duration = duration;
    if (status === 'completed' || status === 'rejected' || status === 'missed') {
      update.endedAt = new Date();
    }

    const call = await Call.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!call) return res.status(404).json({ message: 'Call record not found' });

    // Create missed call notification
    if (status === 'missed' || status === 'rejected') {
      const targetUser = call.caller.toString() === req.user.id ? call.callee : call.caller;
      try {
        let notif = await Notification.create({
          recipient: targetUser,
          sender: req.user.id,
          type: 'call_missed',
          message: `Missed ${call.callType} call`
        });
        notif = await notif.populate('sender', 'username fullName avatar');

        if (req.io) {
          const getOnlineUser = req.app.get('getOnlineUser');
          const receiver = getOnlineUser ? getOnlineUser(targetUser.toString()) : null;
          if (receiver) {
            req.io.to(receiver.socketId).emit('getNotification', notif);
          }
        }
      } catch (err) {
        console.error('Failed to create/emit call notification:', err);
      }
    }

    res.json(call);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update call record', error: err.message });
  }
};

// GET /api/calls — Get call history for current user
exports.getCallHistory = async (req, res) => {
  try {
    const calls = await Call.find({
      $or: [{ caller: req.user.id }, { callee: req.user.id }]
    })
      .populate('caller', 'username fullName avatar')
      .populate('callee', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(calls);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get call history', error: err.message });
  }
};
