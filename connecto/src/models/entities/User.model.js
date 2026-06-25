/**
 * User Entity Model
 * Defines the structure and validation for User data
 */

export class User {
  constructor(data = {}) {
    this._id = data._id || null;
    this.username = data.username || '';
    this.email = data.email || '';
    this.fullName = data.fullName || '';
    this.avatar = data.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg';
    this.coverPhoto = data.coverPhoto || '';
    this.bio = data.bio || '';
    this.website = data.website || '';
    this.location = data.location || '';
    this.followers = data.followers || [];
    this.following = data.following || [];
    this.savedPosts = data.savedPosts || [];
    this.isOnline = data.isOnline || false;
    this.isVerified = data.isVerified || false;
    this.isPrivate = data.isPrivate || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Getters for computed properties
  get displayName() {
    return this.fullName || this.username;
  }

  get followerCount() {
    return this.followers.length;
  }

  get followingCount() {
    return this.following.length;
  }

  get isCurrentUser() {
    // This would be set by the auth context
    return this._isCurrentUser || false;
  }

  get profileUrl() {
    return `/profile/${this.username}`;
  }

  get avatarUrl() {
    return this.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg';
  }

  // Methods for user actions
  isFollowing(userId) {
    return this.following.includes(userId);
  }

  isFollowedBy(userId) {
    return this.followers.includes(userId);
  }

  hasSavedPost(postId) {
    return this.savedPosts.includes(postId);
  }

  // Validation methods
  static validate(userData) {
    const errors = {};

    if (!userData.username || userData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    if (!userData.email || !User.isValidEmail(userData.email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (!userData.fullName || userData.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters long';
    }

    if (userData.bio && userData.bio.length > 300) {
      errors.bio = 'Bio must be less than 300 characters';
    }

    if (userData.website && !User.isValidUrl(userData.website)) {
      errors.website = 'Please provide a valid website URL';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Serialization methods
  toJSON() {
    return {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
      avatar: this.avatar,
      coverPhoto: this.coverPhoto,
      bio: this.bio,
      website: this.website,
      location: this.location,
      followers: this.followers,
      following: this.following,
      savedPosts: this.savedPosts,
      isOnline: this.isOnline,
      isVerified: this.isVerified,
      isPrivate: this.isPrivate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Factory method to create User from API response
  static fromAPI(apiData) {
    return new User(apiData);
  }

  // Method to update user data
  update(newData) {
    Object.keys(newData).forEach(key => {
      if (this.hasOwnProperty(key)) {
        this[key] = newData[key];
      }
    });
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Method to follow/unfollow another user
  toggleFollow(userId) {
    const index = this.following.indexOf(userId);
    if (index > -1) {
      this.following.splice(index, 1);
      return false; // unfollowed
    } else {
      this.following.push(userId);
      return true; // followed
    }
  }

  // Method to save/unsave a post
  toggleSavePost(postId) {
    const index = this.savedPosts.indexOf(postId);
    if (index > -1) {
      this.savedPosts.splice(index, 1);
      return false; // unsaved
    } else {
      this.savedPosts.push(postId);
      return true; // saved
    }
  }
}

export default User;