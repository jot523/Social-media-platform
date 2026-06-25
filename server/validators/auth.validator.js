/**
 * Auth Validator (Server-side)
 * Express middleware for validating auth request bodies
 */

exports.validateRegister = (req, res, next) => {
  const { username, email, password, fullName } = req.body;
  const errors = [];

  if (!fullName?.trim())  errors.push('Full name is required');
  if (!username?.trim())  errors.push('Username is required');
  else if (username.length < 3) errors.push('Username must be at least 3 characters');
  if (!email?.trim())     errors.push('Email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email');
  if (!password)          errors.push('Password is required');
  else if (password.length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email?.trim())  errors.push('Email is required');
  if (!password)       errors.push('Password is required');

  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  next();
};