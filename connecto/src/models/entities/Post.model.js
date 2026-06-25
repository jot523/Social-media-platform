/**
 * Post Entity Model
 * Defines the structure and validation for Post data
 */

export class Post {
  constructor(data = {}) {
    this._id = data._id || null;
    this.user = data.user || null; // User object or ID
    this.caption = data.caption || '';
    this.image = data.image || '';
    this.images = data.images || [];
    this.likes = data.likes || [];
    this.comments = data.comments || [];
    this.shares = data.shares || 0;
    this.saves = data.saves || [];
    this.type = data.type || 'post'; // 'post', 'reel', 'story'
    this.isPublic = data.isPublic !== undefined ? data.isPublic : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Getters for computed properties
  get likeCount() {
    return this.likes.length;
  }

  get commentCount() {
    return this.comments.length;
  }

  get shareCount() {
    return this.shares;
  }

  get saveCount() {
    return this.saves.length;
  }

  get timeAgo() {
    return Post.formatTimeAgo(this.createdAt);
  }

  get hasImage() {
    return Boolean(this.image) || this.images.length > 0;
  }

  get imageCount() {
    return this.images.length || (this.image ? 1 : 0);
  }

  get hasCaption() {
    return Boolean(this.caption && this.caption.trim());
  }

  get postUrl() {
    return `/post/${this._id}`;
  }

  get authorName() {
    return this.user?.fullName || this.user?.username || 'Unknown User';
  }

  get authorUsername() {
    return this.user?.username || 'unknown';
  }

  get authorAvatar() {
    return this.user?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg';
  }

  get isVerifiedAuthor() {
    return this.user?.isVerified || false;
  }

  // Methods for post interactions
  isLikedBy(userId) {
    return this.likes.includes(userId);
  }

  isSavedBy(userId) {
    return this.saves.includes(userId);
  }

  isOwnedBy(userId) {
    return this.user?._id === userId || this.user === userId;
  }

  // Action methods
  toggleLike(userId) {
    const index = this.likes.indexOf(userId);
    if (index > -1) {
      this.likes.splice(index, 1);
      return false; // unliked
    } else {
      this.likes.push(userId);
      return true; // liked
    }
  }

  toggleSave(userId) {
    const index = this.saves.indexOf(userId);
    if (index > -1) {
      this.saves.splice(index, 1);
      return false; // unsaved
    } else {
      this.saves.push(userId);
      return true; // saved
    }
  }

  addComment(comment) {
    const newComment = {
      _id: Date.now().toString(),
      user: comment.user,
      text: comment.text,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };
    this.comments.push(newComment);
    this.updatedAt = new Date().toISOString();
    return newComment;
  }

  removeComment(commentId) {
    const index = this.comments.findIndex(c => c._id === commentId);
    if (index > -1) {
      this.comments.splice(index, 1);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  incrementShares() {
    this.shares += 1;
    this.updatedAt = new Date().toISOString();
  }

  // Validation methods
  static validate(postData) {
    const errors = {};

    if (!postData.caption && !postData.image) {
      errors.content = 'Post must have either caption or image';
    }

    if (postData.caption && postData.caption.length > 2000) {
      errors.caption = 'Caption must be less than 2000 characters';
    }

    if (postData.image && !Post.isValidImageUrl(postData.image)) {
      errors.image = 'Please provide a valid image URL';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static isValidImageUrl(url) {
    if (!url) return true; // Optional field
    if (url instanceof File) return true; // File objects are always valid
    if (typeof url !== 'string') return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
    return imageExtensions.test(url) ||
           url.includes('data:image/') ||
           url.startsWith('http://') ||
           url.startsWith('https://') ||
           url.startsWith('blob:');
  }

  // Utility methods
  static formatTimeAgo(dateString) {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  }

  static extractHashtags(text) {
    if (!text) return [];
    const hashtagRegex = /#[\w]+/g;
    return text.match(hashtagRegex) || [];
  }

  static extractMentions(text) {
    if (!text) return [];
    const mentionRegex = /@[\w]+/g;
    return text.match(mentionRegex) || [];
  }

  // Serialization methods
  toJSON() {
    return {
      _id: this._id,
      user: this.user,
      caption: this.caption,
      image: this.image,
      images: this.images,
      likes: this.likes,
      comments: this.comments,
      shares: this.shares,
      saves: this.saves,
      type: this.type,
      isPublic: this.isPublic,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Factory method to create Post from API response
  static fromAPI(apiData) {
    return new Post(apiData);
  }

  // Method to update post data
  update(newData) {
    const allowedFields = ['caption', 'image', 'images', 'isPublic'];
    allowedFields.forEach(field => {
      if (newData.hasOwnProperty(field)) {
        this[field] = newData[field];
      }
    });
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // Method to get post engagement rate
  getEngagementRate() {
    const totalEngagements = this.likeCount + this.commentCount + this.shareCount;
    // This would typically be calculated against follower count
    return totalEngagements;
  }

  // Method to check if post is recent (within 24 hours)
  isRecent() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return new Date(this.createdAt) > oneDayAgo;
  }

  // Method to get hashtags from caption
  getHashtags() {
    return Post.extractHashtags(this.caption);
  }

  // Method to get mentions from caption
  getMentions() {
    return Post.extractMentions(this.caption);
  }
}

export default Post;