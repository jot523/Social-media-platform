/**
 * Post Validator (Server-side middleware)
 */

exports.validatePost = (req, res, next) => {
  const { caption, image } = req.body;
  if (!caption?.trim() && !image) {
    return res.status(400).json({ message: 'Post must have a caption or image' });
  }
  if (caption && caption.length > 2000) {
    return res.status(400).json({ message: 'Caption must be under 2000 characters' });
  }
  next();
};

exports.validateComment = (req, res, next) => {
  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ message: 'Comment text is required' });
  }
  if (text.length > 500) {
    return res.status(400).json({ message: 'Comment must be under 500 characters' });
  }
  next();
};