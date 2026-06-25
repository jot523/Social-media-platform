/**
 * Date Utility Functions
 */

/**
 * Returns a human-readable "time ago" string
 * @param {string|Date} date
 * @returns {string}
 */
export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60)  return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)  return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)      return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4)     return `${weeks}w ago`;
  return new Date(date).toLocaleDateString();
};

/**
 * Short version for chat timestamps
 */
export const timeAgoShort = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

/**
 * Format a date as "HH:MM"
 */
export const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/**
 * Check if a date is within the last 24 hours
 */
export const isRecent = (date) =>
  Date.now() - new Date(date).getTime() < 24 * 60 * 60 * 1000;