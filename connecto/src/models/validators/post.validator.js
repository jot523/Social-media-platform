/**
 * Post Validator (Frontend)
 */

export const validatePost = (data) => {
  const errors = {};
  if (!data.caption?.trim() && !data.image) {
    errors.content = 'Post must have a caption or image';
  }
  if (data.caption && data.caption.length > 2000) {
    errors.caption = 'Caption must be under 2000 characters';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateComment = (text) => {
  if (!text?.trim()) return { isValid: false, error: 'Comment cannot be empty' };
  if (text.length > 500) return { isValid: false, error: 'Comment must be under 500 characters' };
  return { isValid: true, error: null };
};