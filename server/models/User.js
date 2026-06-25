const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://randomuser.me/api/portraits/lego/1.jpg'
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 300
  },
  website: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  savedReels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  notificationSettings: {
    pauseAll: { type: Boolean, default: false },
    likes: { type: String, default: 'everyone' },
    comments: { type: String, default: 'everyone' },
    followers: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    stories: { type: Boolean, default: true },
    reels: { type: Boolean, default: true }
  },
  privacySettings: {
    privateAccount: { type: Boolean, default: false },
    activityStatus: { type: Boolean, default: true },
    hideLikes: { type: Boolean, default: false },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  themeSettings: {
    theme: { type: String, default: 'neo' },
    fontSize: { type: Number, default: 16 }
  },
  personalDetails: {
    gender: { type: String, default: '' },
    birthday: { type: Date, default: null },
    phoneNumber: { type: String, default: '' }
  },
  metaSync: {
    instagramSynced: { type: Boolean, default: false },
    instagramUsername: { type: String, default: '' },
    facebookSynced: { type: Boolean, default: false },
    facebookUsername: { type: String, default: '' }
  },
  highlights: [{
    title: { type: String, required: true, maxlength: 30 },
    coverImage: { type: String, default: '' },
    stories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Get list of all user IDs that are blocked by this user OR who have blocked this user
userSchema.statics.getBlockedUserIds = async function(userId) {
  if (!userId) return [];
  try {
    const user = await this.findById(userId);
    const myBlocked = user?.privacySettings?.blockedUsers || [];
    
    const blockedByOthers = await this.find({
      'privacySettings.blockedUsers': userId
    }).select('_id');
    
    const othersBlocked = blockedByOthers.map(u => u._id);
    
    const allBlocked = new Set([
      ...myBlocked.map(id => id.toString()),
      ...othersBlocked.map(id => id.toString())
    ]);
    
    return Array.from(allBlocked);
  } catch (err) {
    console.error('Error in getBlockedUserIds static:', err);
    return [];
  }
};

module.exports = mongoose.model('User', userSchema);
