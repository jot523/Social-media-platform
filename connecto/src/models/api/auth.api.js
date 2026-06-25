/**
 * Auth API Service
 */

import { BaseAPI, APIError } from './base.api.js';

class AuthAPI extends BaseAPI {
  constructor() { super('/api'); }

  async login(email, password) {
    try {
      return await this.post('/auth/login', { email, password });
    } catch (err) {
      throw new APIError(err.data?.message || 'Login failed', err.status || 500);
    }
  }

  async register(userData) {
    try {
      return await this.post('/auth/register', userData);
    } catch (err) {
      throw new APIError(err.data?.message || 'Registration failed', err.status || 500);
    }
  }
}

const authAPI = new AuthAPI();
export { AuthAPI, authAPI };
export default authAPI;