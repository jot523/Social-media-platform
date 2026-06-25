const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

module.exports = async function(req, res, next) {
  // Support both x-auth-token header and Bearer token in Authorization header
  let token = req.header('x-auth-token');
  
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Allow mock tokens ONLY in development mode
  if (token.startsWith('mock_jwt_token_') && process.env.NODE_ENV === 'development') {
    const parts = token.split('_');
    const username = parts[3] || 'demo_user';
    const User = require('../models/User');
    
    try {
      let mockUser = await User.findOne({ username });
      if (!mockUser) {
        mockUser = await User.create({
          username,
          email: `${username}@connecto.com`,
          password: 'mock_password_hash_123',
          fullName: username.replace(/[._]/g, ' '),
          avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
          bio: 'Welcome to Connecto!',
          followers: [],
          following: [],
          savedPosts: [],
          savedReels: []
        });
      }
      req.user = { id: mockUser._id.toString() };
      return next();
    } catch (err) {
      console.error("Failed to check/create mock user:", err);
      return res.status(500).json({ message: 'Mock user setup failed' });
    }
  }

  // Reject mock tokens in production
  if (token.startsWith('mock_jwt_token_')) {
    return res.status(401).json({ message: 'Mock tokens are not allowed in production' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
