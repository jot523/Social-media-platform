/**
 * Auth Utilities
 * Shared helpers for token handling across ViewModels
 */

/**
 * Returns true only for real JWT tokens (not UI-testing mock tokens)
 */
export const isRealToken = (token) =>
  Boolean(token) && !token.startsWith('mock_jwt_token_');

/**
 * Returns Authorization headers only when the token is a real JWT.
 * Returns an empty object for mock tokens so no 401 is triggered.
 */
export const authHeaders = (token, extra = {}) => {
  if (!token) return extra;
  return { Authorization: `Bearer ${token}`, ...extra };
};

/**
 * Returns full headers including Content-Type for JSON requests.
 */
export const jsonAuthHeaders = (token) =>
  authHeaders(token, { 'Content-Type': 'application/json' });