/**
 * Image Utilities
 * Helper functions for handling image URLs and assets
 */

export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If the url is already absolute or data URL, return it as is
  if (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.startsWith('data:') || 
    url.startsWith('blob:')
  ) {
    return url;
  }
  
  // Prepend lead slash if missing
  const formattedUrl = url.startsWith('/') ? url : `/${url}`;
  
  // Dev proxy/port fallback
  const baseUrl = process.env.REACT_APP_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:5000' : '');
  
  return `${baseUrl}${formattedUrl}`;
};

export default getImageUrl;
