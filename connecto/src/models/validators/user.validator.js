/**
 * User Validator (Frontend)
 */

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';
  if (!password) errors.password = 'Password is required';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateRegister = ({ fullName, username, email, password, confirmPassword }) => {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = 'Full name is required';
  if (!username?.trim()) errors.username = 'Username is required';
  else if (username.length < 3) errors.username = 'Username must be at least 3 characters';
  else if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.username = 'Username can only contain letters, numbers, and underscores';
  if (!email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateProfileUpdate = ({ fullName, username, bio, website }) => {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = 'Full name is required';
  if (!username?.trim()) errors.username = 'Username is required';
  if (bio && bio.length > 300) errors.bio = 'Bio must be under 300 characters';
  if (website && website.trim()) {
    try { new URL(website); } catch { errors.website = 'Invalid website URL'; }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};