const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use((req, res, next) => {
  req.io = io;
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));




// Routes — MVC controller-backed routes
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/posts',         require('./routes/posts.routes'));
app.use('/api/reels',         require('./routes/reels.routes'));
app.use('/api/users',         require('./routes/users.routes'));
app.use('/api/messages',      require('./routes/messages.routes'));
app.use('/api/upload',        require('./routes/upload'));
app.use('/api/stories',       require('./routes/stories.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/mood',          require('./routes/mood'));
app.use('/api/explore',       require('./routes/explore'));
app.use('/api/calls',         require('./routes/calls.routes'));
app.use('/api/songs',         require('./routes/songs.routes'));

// Serve React frontend build in production
const clientBuildPath = path.join(__dirname, '..', 'connecto', 'build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // Catch-all: serve index.html for any non-API route (React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
  console.log('[Server] Serving React build from:', clientBuildPath);
} else {
  // Fallback when no build exists (dev mode)
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Connecto API is running. Frontend build not found — run "npm run build" in /connecto.',
      version: '1.0.0'
    });
  });
}


// Socket.io for Real-time features
let onlineUsers = [];
app.set('getOnlineUser', (userId) => onlineUsers.find(u => u.userId === userId?.toString()));

const addNewUser = (userId, username, socketId) => {
  const existing = onlineUsers.findIndex(u => u.userId === userId);
  if (existing !== -1) {
    onlineUsers[existing].socketId = socketId;
  } else {
    onlineUsers.push({ userId, username, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUserByUsername = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

const getUserById = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Register user as online
  socket.on('newUser', ({ userId, username }) => {
    addNewUser(userId, username, socket.id);
    // Broadcast online users list
    io.emit('onlineUsers', onlineUsers.map(u => ({ userId: u.userId, username: u.username })));
  });

  // Handle real-time chat messages
  socket.on('sendMessage', ({ senderName, receiverName, text, senderId, receiverId, mediaUrl, mediaType }) => {
    const receiver = getUserByUsername(receiverName) || getUserById(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit('getMessage', {
        senderName,
        senderId,
        text,
        mediaUrl: mediaUrl || '',
        mediaType: mediaType || '',
        createdAt: new Date()
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', ({ senderName, receiverName }) => {
    const receiver = getUserByUsername(receiverName);
    if (receiver) {
      io.to(receiver.socketId).emit('userTyping', { senderName });
    }
  });

  socket.on('stopTyping', ({ senderName, receiverName }) => {
    const receiver = getUserByUsername(receiverName);
    if (receiver) {
      io.to(receiver.socketId).emit('userStopTyping', { senderName });
    }
  });

  // Handle real-time notifications
  socket.on('sendNotification', ({ receiverId, notification }) => {
    const receiver = getUserById(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit('getNotification', notification);
    }
  });

  // Handle WebRTC Calling
  socket.on('call-user', ({ offer, calleeId, callerName, callerAvatar, callType }) => {
    const receiver = getUserById(calleeId);
    if (receiver) {
      io.to(receiver.socketId).emit('incoming-call', {
        offer,
        callerId: socket.id, // Socket ID of caller for signaling direct replies
        callerDbId: onlineUsers.find(u => u.socketId === socket.id)?.userId,
        callerName,
        callerAvatar,
        callType
      });
    }
  });

  socket.on('make-answer', ({ answer, callerId }) => {
    io.to(callerId).emit('call-answered', {
      answer,
      calleeId: socket.id
    });
  });

  socket.on('ice-candidate', ({ candidate, targetId }) => {
    io.to(targetId).emit('ice-candidate', {
      candidate,
      senderId: socket.id
    });
  });

  socket.on('reject-call', ({ callerId }) => {
    io.to(callerId).emit('call-rejected');
  });

  socket.on('end-call', ({ targetId }) => {
    io.to(targetId).emit('call-ended');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    removeUser(socket.id);
    io.emit('onlineUsers', onlineUsers.map(u => ({ userId: u.userId, username: u.username })));
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Connecto API is running',
    onlineUsers: onlineUsers.length,
    architecture: 'MVC + MVVM Hybrid'
  });
});

// Global error handler (MVC — Error Middleware)
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Connecto Server running on port ${PORT}`);
});
