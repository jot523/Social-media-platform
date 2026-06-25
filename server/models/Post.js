const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    default: '',
    maxlength: 2000
  },
  image: {
    type: String,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  moodVector: {
    type: [Number],
    default: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
    index: true
  },
  hashtags: [{
    type: String,
    lowercase: true,
    index: true
  }],
  images: [{
    type: String
  }],
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }
}, {
  timestamps: true
});

// Pre-save hook: auto-extract hashtags from caption
postSchema.pre('save', function(next) {
  if (this.isModified('caption') && this.caption) {
    const tags = this.caption.match(/#[a-zA-Z0-9_]+/g);
    this.hashtags = tags ? tags.map(t => t.toLowerCase().replace('#', '')) : [];
  }
  // Backward compat: if single image set, mirror to images array
  if (this.isModified('image') && this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);

