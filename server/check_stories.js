const mongoose = require('mongoose');

async function checkStories() {
  try {
    await mongoose.connect('mongodb://localhost:27017/insta');
    console.log('Connected to MongoDB');
    
    const Story = mongoose.model('Story', new mongoose.Schema({
      user: mongoose.Schema.Types.ObjectId,
      mediaUrl: String,
      mediaType: String,
      caption: String,
      expiresAt: Date
    }, { timestamps: true }));
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      fullName: String
    }));
    
    const stories = await Story.find().lean();
    console.log(`Found ${stories.length} stories in total:`);
    for (const story of stories) {
      const userObj = await User.findById(story.user);
      console.log(`- User: ${userObj ? userObj.username : 'Unknown'} (${story.user})`);
      console.log(`  mediaUrl: "${story.mediaUrl}"`);
      console.log(`  mediaType: "${story.mediaType}"`);
      console.log(`  createdAt: ${story.createdAt}`);
      console.log(`  expiresAt: ${story.expiresAt}`);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkStories();
