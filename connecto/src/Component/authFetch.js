/**
 * authFetch — drop-in fetch wrapper for legacy Component files
 * Automatically skips Authorization header for mock tokens,
 * preventing 401 errors when the backend is running but the user
 * logged in via the mock fallback.
 */

const isMockToken = (token) =>
  !token;

/**
 * Builds Authorization headers only for real JWT tokens.
 * @param {string|null} token
 * @param {object} extra  — additional headers to merge
 */
export const buildHeaders = (token, extra = {}) => {
  if (isMockToken(token)) return extra;
  return { Authorization: `Bearer ${token}`, ...extra };
};

/**
 * JSON headers (Content-Type + optional Authorization)
 */
export const jsonHeaders = (token) =>
  buildHeaders(token, { 'Content-Type': 'application/json' });

/**
 * Wrapper around fetch that automatically handles mock tokens.
 * Usage: authFetch(token, '/api/posts', { method: 'POST', body: ... })
 */
const authFetch = (token, url, options = {}) => {
  const { headers: extraHeaders = {}, ...rest } = options;
  const headers = buildHeaders(token, extraHeaders);
  return fetch(url, { headers, ...rest });
};

export default authFetch;