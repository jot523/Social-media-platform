/**
 * Posts API Service
 * Handles all post-related API operations
 */

import { BaseAPI, APIError } from './base.api.js';
import { Post } from '../entities/Post.model.js';

class PostsAPI extends BaseAPI {
  constructor() {
    super('/api');
  }

  /**
   * Get posts feed with pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Posts per page
   * @param {string} params.sort - Sort order ('newest', 'popular')
   * @param {string} params.userId - Filter by user ID
   * @returns {Promise<{posts: Post[], pagination: Object}>}
   */
  async getFeed(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        limit: 10,
        sort: 'newest'
      };

      const queryParams = { ...defaultParams, ...params };
      const data = await this.get('/posts', queryParams);

      return {
        posts: data.posts?.map(post => Post.fromAPI(post)) || [],
        pagination: data.pagination || {
          page: queryParams.page,
          limit: queryParams.limit,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error) {
      console.error('Failed to fetch posts feed:', error);
      throw new APIError('Failed to load posts', error.status || 500);
    }
  }

  /**
   * Get a single post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Post>}
   */
  async getPost(postId) {
    try {
      const data = await this.get(`/posts/${postId}`);
      return Post.fromAPI(data);
    } catch (error) {
      console.error(`Failed to fetch post ${postId}:`, error);
      throw new APIError('Failed to load post', error.status || 500);
    }
  }

  /**
   * Create a new post
   * @param {Object} postData - Post data
   * @param {string} postData.caption - Post caption
   * @param {File|string} postData.image - Image file or URL
   * @returns {Promise<Post>}
   */
  async createPost(postData) {
    try {
      // Validate post data
      const validation = Post.validate(postData);
      if (!validation.isValid) {
        throw new APIError('Invalid post data', 400, validation.errors);
      }

      let imageUrl = postData.image;

      // Upload image if it's a File object
      if (postData.image instanceof File) {
        const uploadResponse = await this.upload('/upload', postData.image);
        imageUrl = uploadResponse.url;
      }

      const payload = {
        caption: postData.caption,
        image: imageUrl,
        type: postData.type || 'post'
      };

      const data = await this.post('/posts', payload);
      return Post.fromAPI(data);
    } catch (error) {
      console.error('Failed to create post:', error);
      throw new APIError('Failed to create post', error.status || 500);
    }
  }

  /**
   * Update an existing post
   * @param {string} postId - Post ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Post>}
   */
  async updatePost(postId, updateData) {
    try {
      const data = await this.put(`/posts/${postId}`, updateData);
      return Post.fromAPI(data);
    } catch (error) {
      console.error(`Failed to update post ${postId}:`, error);
      throw new APIError('Failed to update post', error.status || 500);
    }
  }

  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @returns {Promise<boolean>}
   */
  async deletePost(postId) {
    try {
      await this.delete(`/posts/${postId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete post ${postId}:`, error);
      throw new APIError('Failed to delete post', error.status || 500);
    }
  }

  /**
   * Toggle like on a post
   * @param {string} postId - Post ID
   * @returns {Promise<{liked: boolean, likeCount: number}>}
   */
  async toggleLike(postId) {
    try {
      const data = await this.put(`/posts/${postId}/like`);
      return {
        liked: data.liked,
        likeCount: data.likeCount
      };
    } catch (error) {
      console.error(`Failed to toggle like on post ${postId}:`, error);
      throw new APIError('Failed to like post', error.status || 500);
    }
  }

  /**
   * Toggle save on a post
   * @param {string} postId - Post ID
   * @returns {Promise<{saved: boolean}>}
   */
  async toggleSave(postId) {
    try {
      const data = await this.put(`/posts/${postId}/save`);
      return {
        saved: data.saved
      };
    } catch (error) {
      console.error(`Failed to toggle save on post ${postId}:`, error);
      throw new APIError('Failed to save post', error.status || 500);
    }
  }

  /**
   * Add a comment to a post
   * @param {string} postId - Post ID
   * @param {string} text - Comment text
   * @returns {Promise<Object>}
   */
  async addComment(postId, text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new APIError('Comment text is required', 400);
      }

      const data = await this.post(`/posts/${postId}/comment`, { text });
      return data.comment;
    } catch (error) {
      console.error(`Failed to add comment to post ${postId}:`, error);
      throw new APIError('Failed to add comment', error.status || 500);
    }
  }

  /**
   * Delete a comment from a post
   * @param {string} postId - Post ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<boolean>}
   */
  async deleteComment(postId, commentId) {
    try {
      await this.delete(`/posts/${postId}/comment/${commentId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete comment ${commentId}:`, error);
      throw new APIError('Failed to delete comment', error.status || 500);
    }
  }

  /**
   * Share a post
   * @param {string} postId - Post ID
   * @returns {Promise<{shareCount: number}>}
   */
  async sharePost(postId) {
    try {
      const data = await this.post(`/posts/${postId}/share`);
      return {
        shareCount: data.shareCount
      };
    } catch (error) {
      console.error(`Failed to share post ${postId}:`, error);
      throw new APIError('Failed to share post', error.status || 500);
    }
  }

  /**
   * Get posts by user
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Post[]>}
   */
  async getUserPosts(userId, params = {}) {
    try {
      const data = await this.get(`/users/${userId}/posts`, params);
      return data.posts?.map(post => Post.fromAPI(post)) || [];
    } catch (error) {
      console.error(`Failed to fetch posts for user ${userId}:`, error);
      throw new APIError('Failed to load user posts', error.status || 500);
    }
  }

  /**
   * Get saved posts for current user
   * @param {Object} params - Query parameters
   * @returns {Promise<Post[]>}
   */
  async getSavedPosts(params = {}) {
    try {
      const data = await this.get('/posts/saved', params);
      return data.posts?.map(post => Post.fromAPI(post)) || [];
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
      throw new APIError('Failed to load saved posts', error.status || 500);
    }
  }

  /**
   * Search posts by hashtag or text
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise<Post[]>}
   */
  async searchPosts(query, params = {}) {
    try {
      const searchParams = { q: query, ...params };
      const data = await this.get('/posts/search', searchParams);
      return data.posts?.map(post => Post.fromAPI(post)) || [];
    } catch (error) {
      console.error(`Failed to search posts with query "${query}":`, error);
      throw new APIError('Failed to search posts', error.status || 500);
    }
  }

  /**
   * Get trending posts
   * @param {Object} params - Query parameters
   * @returns {Promise<Post[]>}
   */
  async getTrendingPosts(params = {}) {
    try {
      const data = await this.get('/posts/trending', params);
      return data.posts?.map(post => Post.fromAPI(post)) || [];
    } catch (error) {
      console.error('Failed to fetch trending posts:', error);
      throw new APIError('Failed to load trending posts', error.status || 500);
    }
  }

  /**
   * Report a post
   * @param {string} postId - Post ID
   * @param {string} reason - Report reason
   * @returns {Promise<boolean>}
   */
  async reportPost(postId, reason) {
    try {
      await this.post(`/posts/${postId}/report`, { reason });
      return true;
    } catch (error) {
      console.error(`Failed to report post ${postId}:`, error);
      throw new APIError('Failed to report post', error.status || 500);
    }
  }

  /**
   * Get post analytics (for post owner)
   * @param {string} postId - Post ID
   * @returns {Promise<Object>}
   */
  async getPostAnalytics(postId) {
    try {
      const data = await this.get(`/posts/${postId}/analytics`);
      return data.analytics;
    } catch (error) {
      console.error(`Failed to fetch analytics for post ${postId}:`, error);
      throw new APIError('Failed to load post analytics', error.status || 500);
    }
  }

  /**
   * Create a new reel
   */
  async createReel(reelData) {
    try {
      let videoUrl = reelData.video;
      if (reelData.video instanceof File) {
        const uploadResponse = await this.upload('/upload', reelData.video);
        videoUrl = uploadResponse.url;
      }
      
      const payload = {
        videoUrl,
        caption: reelData.caption,
        music: reelData.music,
        thumbnail: reelData.thumbnail || ''
      };
      
      return await this.post('/reels', payload);
    } catch (error) {
      console.error('Failed to create reel:', error);
      throw new APIError('Failed to create reel', error.status || 500);
    }
  }

  /**
   * Create a new story
   */
  async createStory(storyData) {
    try {
      let mediaUrl = storyData.media;
      if (storyData.media instanceof File) {
        const uploadResponse = await this.upload('/upload', storyData.media);
        mediaUrl = uploadResponse.url;
      }
      
      const payload = {
        mediaUrl,
        mediaType: storyData.mediaType || 'image',
        caption: storyData.caption || '',
        bgColor: storyData.bgColor || '',
        textOverlay: storyData.textOverlay || ''
      };
      
      return await this.post('/stories', payload);
    } catch (error) {
      console.error('Failed to create story:', error);
      throw new APIError('Failed to create story', error.status || 500);
    }
  }
}

// Create singleton instance
const postsAPI = new PostsAPI();

export { PostsAPI, postsAPI };
export default postsAPI;