/**
 * Upload Service
 * Handles file uploads to the backend
 */

const getToken = () => localStorage.getItem('token');

/**
 * Upload a single file
 * @param {File} file
 * @returns {Promise<{url: string}>}
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Upload failed');
  }

  return res.json(); // { url: '...' }
};

/**
 * Upload multiple files
 * @param {File[]} files
 * @returns {Promise<string[]>} array of URLs
 */
export const uploadMultiple = async (files) => {
  const results = await Promise.all(files.map(uploadFile));
  return results.map(r => r.url);
};

/**
 * Validate file before upload
 * @param {File} file
 * @param {Object} options
 */
export const validateFile = (file, { maxSizeMB = 10, allowedTypes = ['image/'] } = {}) => {
  const errors = [];

  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File must be under ${maxSizeMB}MB`);
  }

  const typeAllowed = allowedTypes.some(t => file.type.startsWith(t));
  if (!typeAllowed) {
    errors.push(`File type not allowed: ${file.type}`);
  }

  return { isValid: errors.length === 0, errors };
};