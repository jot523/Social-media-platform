/**
 * Auth Controller (MVC — Controller Layer)
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({
        message: existing.email === email ? 'Email already in use' : 'Username already taken'
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({ username, email, password: hashed, fullName });

    const token = signToken(user._id);
    const { password: _, ...userOut } = user.toObject();

    res.status(201).json({ token, user: userOut });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    const { password: _, ...userOut } = user.toObject();

    res.json({ token, user: userOut });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};