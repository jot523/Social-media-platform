/**
 * Users API Service
 */

import { BaseAPI, APIError } from './base.api.js';
import { User } from '../entities/User.model.js';

class UsersAPI extends BaseAPI {
  constructor() { super('/api'); }

  async getMe() {
    try {
      const data = await this.get('/users/me');
      return User.fromAPI(data);
    } catch (err) {
      throw new APIError('Failed to fetch current user', err.status || 500);
    }
  }

  async getProfile(userId) {
    try {
      const data = await this.get(`/users/${userId}`);
      return User.fromAPI(data);
    } catch (err) {
      throw new APIError('Failed to fetch profile', err.status || 500);
    }
  }

  async searchUsers(query) {
    try {
      const data = await this.get('/users/search', { q: query });
      return data.map(u => User.fromAPI(u));
    } catch (err) {
      throw new APIError('Search failed', err.status || 500);
    }
  }

  async getSuggestions() {
    try {
      const data = await this.get('/users/suggestions');
      return data.map(u => User.fromAPI(u));
    } catch (err) {
      throw new APIError('Failed to get suggestions', err.status || 500);
    }
  }

  async toggleFollow(userId) {
    try {
      return await this.put(`/users/${userId}/follow`);
    } catch (err) {
      throw new APIError('Failed to toggle follow', err.status || 500);
    }
  }

  async updateProfile(profileData) {
    try {
      const data = await this.put('/users/profile', profileData);
      return User.fromAPI(data.user || data);
    } catch (err) {
      throw new APIError('Failed to update profile', err.status || 500);
    }
  }

  async getUserPosts(userId) {
    try {
      const data = await this.get(`/users/${userId}/posts`);
      return data.posts || data;
    } catch (err) {
      throw new APIError('Failed to fetch user posts', err.status || 500);
    }
  }
}

const usersAPI = new UsersAPI();
export { UsersAPI, usersAPI };
export default usersAPI;