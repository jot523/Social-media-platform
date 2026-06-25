require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Reel = require('./models/Reel');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Reel.deleteMany({});
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Create demo users
    const users = await User.insertMany([
      { username: 'sarah_cruz', email: 'sarah@demo.com', password, fullName: 'Sarah Cruz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', bio: 'Creative Director | Travel Lover 🌍', isOnline: true },
      { username: 'john_doe', email: 'john@demo.com', password, fullName: 'John Anderson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', bio: 'Photographer 📸 | NYC', isOnline: true },
      { username: 'diana_amber', email: 'diana@demo.com', password, fullName: 'Diana Amber', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', bio: 'Designer & Artist ✨', isOnline: false },
      { username: 'alex_smith', email: 'alex@demo.com', password, fullName: 'Alex Smith', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', bio: 'Software Engineer at Google', isOnline: true },
      { username: 'sophia_lee', email: 'sophia@demo.com', password, fullName: 'Sophia Lee', avatar: 'https://randomuser.me/api/portraits/women/21.jpg', bio: 'Music | Coffee | Code ☕', isOnline: false },
      { username: 'emma_wilson', email: 'emma@demo.com', password, fullName: 'Emma Wilson', avatar: 'https://randomuser.me/api/portraits/women/12.jpg', bio: 'Food blogger 🍕 | Recipe creator', isOnline: true },
      { username: 'chris_harris', email: 'chris@demo.com', password, fullName: 'Chris Harris', avatar: 'https://randomuser.me/api/portraits/men/76.jpg', bio: 'Fitness & Health 💪', isOnline: false },
      { username: 'olivia_page', email: 'olivia@demo.com', password, fullName: 'Olivia Page', avatar: 'https://randomuser.me/api/portraits/women/50.jpg', bio: 'Writer & Book lover 📚', isOnline: true },
    ]);

    console.log(`Created ${users.length} users`);

    // Add followers
    users[0].followers = [users[1]._id, users[2]._id, users[3]._id, users[4]._id];
    users[0].following = [users[1]._id, users[5]._id];
    users[1].followers = [users[0]._id, users[3]._id];
    users[1].following = [users[0]._id, users[2]._id, users[4]._id];
    await users[0].save();
    await users[1].save();

    // Create demo posts
    const posts = await Post.insertMany([
      {
        user: users[0]._id,
        caption: 'Golden hour in Bali 🌅 Nothing beats watching the sunset from a cliffside temple. This trip has been absolutely magical! #travel #bali #sunset',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        likes: [users[1]._id, users[2]._id, users[3]._id, users[4]._id, users[5]._id],
        comments: [
          { user: users[1]._id, text: 'Absolutely stunning! 😍' },
          { user: users[2]._id, text: 'I need to visit Bali ASAP!' },
          { user: users[5]._id, text: 'The colors are incredible 🌈' }
        ],
        moodVector: [0.5, 0.0, 0.0, 0.1, 0.4, 0.0, 0.0] // Happy/Excited focus
      },
      {
        user: users[1]._id,
        caption: 'Morning vibes in Central Park 🌳 Love starting my day with a peaceful walk through nature. NYC has its quiet moments too! #nyc #centralpark #morning',
        image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800',
        likes: [users[0]._id, users[3]._id, users[4]._id],
        comments: [
          { user: users[0]._id, text: 'My favorite spot in the city! ❤️' },
          { user: users[3]._id, text: 'Great shot John!' }
        ],
        moodVector: [0.4, 0.1, 0.0, 0.1, 0.0, 0.4, 0.0] // Happy/Tired focus (relaxed)
      },
      {
        user: users[5]._id,
        caption: 'Made homemade pasta from scratch today! 🍝 Took 3 hours but totally worth it. Recipe coming soon on the blog! #foodie #homemade #pasta',
        image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=800',
        likes: [users[0]._id, users[1]._id, users[2]._id, users[3]._id, users[6]._id, users[7]._id],
        comments: [
          { user: users[7]._id, text: 'That looks delicious! Can\'t wait for the recipe 😋' },
          { user: users[0]._id, text: 'You\'re so talented Emma!' },
          { user: users[6]._id, text: 'I tried this last week, turned out amazing!' }
        ],
        moodVector: [0.4, 0.0, 0.1, 0.3, 0.2, 0.0, 0.0] // Happy/Bored/Excited focus
      },
      {
        user: users[3]._id,
        caption: 'Just shipped a new feature at work! 🚀 After weeks of coding, it feels amazing to see it live. The team crushed it! #coding #tech #launch',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
        likes: [users[0]._id, users[1]._id, users[4]._id],
        comments: [
          { user: users[4]._id, text: 'Congrats Alex! 🎉' },
          { user: users[1]._id, text: 'That\'s awesome man!' }
        ],
        moodVector: [0.1, 0.0, 0.0, 0.0, 0.3, 0.0, 0.6] // Focused/Excited
      },
      {
        user: users[2]._id,
        caption: 'New art piece finished today 🎨 Inspired by the ocean waves and sunset colors. What do you think? #art #painting #creative',
        image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
        likes: [users[0]._id, users[4]._id, users[5]._id, users[7]._id],
        comments: [
          { user: users[0]._id, text: 'This is breathtaking Diana! 💜' },
          { user: users[7]._id, text: 'Would love to see this in person!' }
        ],
        moodVector: [0.3, 0.2, 0.0, 0.0, 0.0, 0.0, 0.5] // Focused/Happy/Sad
      },
      {
        user: users[6]._id,
        caption: 'Post-workout gains 💪 Consistency is the key to progress. 6 months of dedicated training and the results speak for themselves! #fitness #gym #motivation',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
        likes: [users[0]._id, users[3]._id],
        comments: [
          { user: users[3]._id, text: 'You\'re looking great Chris! Keep it up!' }
        ],
        moodVector: [0.0, 0.0, 0.1, 0.0, 0.5, 0.0, 0.4] // Excited/Focused/Stressed
      },
      {
        user: users[7]._id,
        caption: 'Lost in a good book at my favorite café ☕📖 There\'s something magical about rainy afternoons and a great novel. Currently reading "The Midnight Library" #books #reading',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
        likes: [users[0]._id, users[2]._id, users[4]._id, users[5]._id],
        comments: [
          { user: users[4]._id, text: 'That book is amazing! 📚' },
          { user: users[2]._id, text: 'Love this cozy vibe ✨' }
        ],
        moodVector: [0.0, 0.2, 0.0, 0.0, 0.0, 0.5, 0.3] // Tired/Focused/Sad
      },
      {
        user: users[4]._id,
        caption: 'Late night coding session with lo-fi beats 🎵💻 Building something cool — can\'t share details yet but stay tuned! #developer #coding #nightowl',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        likes: [users[3]._id, users[1]._id, users[6]._id],
        comments: [
          { user: users[3]._id, text: 'The best way to code! 🎧' }
        ],
        moodVector: [0.0, 0.0, 0.1, 0.0, 0.0, 0.3, 0.6] // Focused/Tired/Stressed
      }
    ]);


    console.log(`Created ${posts.length} posts`);

    // Create demo reels
    const reels = await Reel.insertMany([
      {
        user: users[0]._id,
        caption: 'Sunset timelapse in Santorini 🇬🇷✨ #travel #sunset',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
        likes: [users[1]._id, users[2]._id, users[3]._id],
        views: 12400
      },
      {
        user: users[5]._id,
        caption: '60-second chocolate cake recipe 🍫🎂 #food #recipe #quick',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        likes: [users[0]._id, users[1]._id, users[7]._id],
        views: 34200
      },
      {
        user: users[6]._id,
        caption: '5-minute morning workout routine 💪🔥 #fitness #workout',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
        likes: [users[3]._id, users[4]._id],
        views: 8900
      },
      {
        user: users[1]._id,
        caption: 'NYC at night — cinematic drone shot 🏙️🎬 #photography #drone',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
        likes: [users[0]._id, users[2]._id, users[5]._id, users[7]._id],
        views: 45600
      },
      {
        user: users[2]._id,
        caption: 'Speed painting — ocean sunset 🎨🌊 #art #speedpaint',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
        likes: [users[0]._id, users[4]._id],
        views: 6700
      },
      {
        user: users[4]._id,
        caption: 'Building a React app in 60 seconds ⚛️💻 #coding #react #tech',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        likes: [users[3]._id, users[1]._id, users[6]._id],
        views: 18300
      }
    ]);

    console.log(`Created ${reels.length} reels`);
    console.log('\n✅ Database seeded successfully!');
    console.log('Demo login: email=sarah@demo.com password=password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
