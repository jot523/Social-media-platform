# 🚀 CONNECTO - Instagram & Facebook Hybrid Social Platform

<div align="center">

![Connecto Logo](https://img.shields.io/badge/CONNECTO-Social%20Platform-6c63ff?style=for-the-badge&logo=react)

**A modern social media platform combining the best features of Instagram and Facebook with a stunning neomorphism UI design.**

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat&logo=socket.io)](https://socket.io/)

</div>

---

## ✨ Features

### 🎨 **Neomorphism UI Design**
- Modern soft UI design with depth and shadows
- Smooth animations and transitions
- Dark mode support
- Responsive across all devices
- Beautiful gradient accents

### 📱 **Core Social Features**

#### **Posts & Feed**
- Create posts with images and captions
- Like, comment, and share posts
- Instagram-style feed with infinite scroll
- Facebook-style newsfeed with sidebars
- Save posts for later
- Delete your own posts

#### **Stories**
- 24-hour ephemeral stories
- Camera integration for instant capture
- Story viewers tracking
- Story highlights (coming soon)

#### **Reels**
- TikTok-style short-form video feed
- Vertical scrolling video player
- Like, comment, and share reels
- View count tracking
- Music attribution

#### **Real-time Chat**
- Instant messaging with Socket.io
- Online/offline status indicators
- Typing indicators
- Message read receipts
- Conversation list with last message preview

#### **User Profiles**
- Instagram-style profile layout
- Post grid view
- Reels and tagged tabs
- Edit profile with avatar upload
- Bio, website, and location fields
- Follower/following counts
- Profile statistics

#### **Social Interactions**
- Follow/unfollow users
- Real-time notifications for:
  - Likes on your posts
  - Comments on your posts
  - New followers
  - Mentions (coming soon)
- User suggestions
- Search users by name or username

#### **Authentication & Security**
- JWT-based authentication
- Bcrypt password hashing
- Protected routes
- Secure API endpoints
- Session management

---

## 🏗️ Architecture

### **Frontend Stack**
- **React 19** - UI library
- **React Router v7** - Client-side routing
- **Context API** - State management
- **CSS Modules** - Scoped styling
- **Socket.io Client** - Real-time communication
- **React Icons** - Icon library

### **Backend Stack**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - WebSocket server
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

---

## 📂 Project Structure

```
connecto2/
├── connecto/                    # Frontend React App
│   ├── public/
│   ├── src/
│   │   ├── Component/          # React Components
│   │   │   ├── Home.jsx        # Instagram-style feed
│   │   │   ├── Newsfeed.jsx    # Facebook-style feed
│   │   │   ├── Profile.jsx     # User profile
│   │   │   ├── Reels.jsx       # Video reels
│   │   │   ├── Chat.jsx        # Messaging
│   │   │   ├── Stories.jsx     # Story carousel
│   │   │   ├── CreatePost.jsx  # Post creation modal
│   │   │   ├── CameraModal.jsx # Camera capture
│   │   │   ├── Page1.jsx       # Landing page
│   │   │   └── ...
│   │   ├── Context/
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── Layout/
│   │   │   ├── Layout.jsx      # Main layout wrapper
│   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   └── Footer.jsx      # Footer
│   │   ├── css/                # CSS Modules
│   │   ├── img/                # Images
│   │   ├── App.js              # Main app component
│   │   ├── index.js            # Entry point
│   │   └── index.css           # Global styles
│   └── package.json
│
├── server/                      # Backend Node.js API
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── auth.js             # JWT authentication
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Post.js             # Post schema
│   │   ├── Reel.js             # Reel schema
│   │   ├── Story.js            # Story schema
│   │   ├── Message.js          # Message schema
│   │   └── Notification.js     # Notification schema
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── posts.js            # Post CRUD routes
│   │   ├── reels.js            # Reel routes
│   │   ├── stories.js          # Story routes
│   │   ├── users.js            # User routes
│   │   ├── messages.js         # Chat routes
│   │   ├── notifications.js    # Notification routes
│   │   └── upload.js           # File upload route
│   ├── uploads/                # Uploaded files
│   ├── server.js               # Express server + Socket.io
│   ├── .env                    # Environment variables
│   └── package.json
│
└── README.md                    # This file
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### **Installation**

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd connecto2
```

2. **Setup Backend**
```bash
cd server
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the `server` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/connecto
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/connecto

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Server Port
PORT=5000
```

4. **Setup Frontend**
```bash
cd ../connecto
npm install
```

5. **Start Development Servers**

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd connecto
npm start
```

The app will open at `http://localhost:3000`

---

## 📡 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### **Posts**
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (auth)
- `DELETE /api/posts/:id` - Delete post (auth)
- `PUT /api/posts/:id/like` - Toggle like (auth)
- `POST /api/posts/:id/comment` - Add comment (auth)
- `PUT /api/posts/:id/save` - Toggle save (auth)

### **Stories**
- `GET /api/stories` - Get active stories (auth)
- `POST /api/stories` - Create story (auth)
- `PUT /api/stories/:id/view` - Mark story viewed (auth)
- `DELETE /api/stories/:id` - Delete story (auth)

### **Reels**
- `GET /api/reels` - Get all reels
- `POST /api/reels` - Create reel (auth)
- `PUT /api/reels/:id/like` - Toggle like (auth)

### **Users**
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/suggestions` - Get user suggestions (auth)
- `GET /api/users/me` - Get current user (auth)
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/posts` - Get user's posts
- `PUT /api/users/:id/follow` - Toggle follow (auth)
- `PUT /api/users/profile` - Update profile (auth)

### **Messages**
- `GET /api/messages/conversations` - Get conversations (auth)
- `GET /api/messages/:userId` - Get messages with user (auth)
- `POST /api/messages` - Send message (auth)

### **Notifications**
- `GET /api/notifications` - Get notifications (auth)
- `PUT /api/notifications/read-all` - Mark all read (auth)
- `PUT /api/notifications/:id/read` - Mark single read (auth)

### **Upload**
- `POST /api/upload` - Upload file (auth)

---

## 🎨 Design System

### **Color Palette**
```css
/* Primary Colors */
--primary: #6c63ff;
--secondary: #ff6584;
--accent: #43e97b;

/* Neomorphism Base */
--neo-bg: #e8edf2;
--neo-shadow-light: 6px 6px 12px #c5cad4, -6px -6px 12px #ffffff;
--neo-shadow-inset: inset 4px 4px 8px #c5cad4, inset -4px -4px 8px #ffffff;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #6c63ff 0%, #a855f7 100%);
--gradient-story: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--gradient-reel: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

### **Typography**
- **Font Family:** Inter, Poppins
- **Headings:** 700-900 weight
- **Body:** 400-600 weight

### **Border Radius**
- Small: 10px
- Medium: 16px
- Large: 24px
- Full: 9999px (pills/circles)

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt rounds
- **Protected Routes** - Frontend route guards
- **API Authorization** - Bearer token validation
- **Input Validation** - Server-side validation
- **CORS Configuration** - Controlled cross-origin requests
- **Environment Variables** - Sensitive data protection

---

## 🌟 Key Improvements Made

### **Backend Enhancements**
✅ Added Stories model and routes with 24hr auto-expiry  
✅ Added Notifications system with real-time delivery  
✅ Enhanced User model with savedPosts, coverPhoto, website, location  
✅ Improved authentication middleware (Bearer token support)  
✅ Added search functionality for users  
✅ Added pagination support for posts  
✅ Enhanced Socket.io with typing indicators and online users  
✅ Added post save/unsave functionality  
✅ Added notification creation on likes, comments, follows  

### **Frontend Redesign**
✅ Complete neomorphism UI redesign  
✅ Modern landing page with features showcase  
✅ Enhanced navbar with search, notifications, dark mode  
✅ Improved profile page with edit modal  
✅ Better responsive design for mobile  
✅ Smooth animations and transitions  
✅ Dark mode support  
✅ Loading states and skeletons  

---

## 📱 Screenshots

### Landing Page
Beautiful neomorphism landing page with auth forms and feature showcase.

### Home Feed
Instagram-style feed with stories, posts, and sidebar suggestions.

### Profile
Instagram-style profile with post grid, stats, and edit functionality.

### Reels
TikTok-style vertical video feed with overlay actions.

### Chat
Real-time messaging with conversation list and online indicators.

---

## 🛠️ Technologies Used

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, React Router v7, Context API, CSS Modules |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Real-time** | Socket.io (WebSockets) |
| **Authentication** | JWT, Bcrypt |
| **File Upload** | Multer |
| **Styling** | CSS Modules, Neomorphism Design |
| **Icons** | React Icons |

---

## 🚧 Roadmap / Future Features

### **Phase 1 - Core Enhancements**
- [ ] Live streaming with WebRTC
- [ ] Video calls in chat
- [ ] Group chats
- [ ] Story highlights
- [ ] Multi-image posts (carousel)

### **Phase 2 - Social Features**
- [ ] Groups/Communities
- [ ] Events with RSVP
- [ ] Marketplace
- [ ] Business pages
- [ ] Verified badges
- [ ] User tagging in posts
- [ ] Hashtag system with trending

### **Phase 3 - Advanced Features**
- [ ] Image filters for camera
- [ ] Story reactions and polls
- [ ] Post analytics
- [ ] Ad system
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Private accounts
- [ ] Close friends list
- [ ] Archive posts

### **Phase 4 - Infrastructure**
- [ ] CDN integration (AWS S3/Cloudinary)
- [ ] Redis caching
- [ ] Rate limiting
- [ ] Database indexing optimization
- [ ] Horizontal scaling for Socket.io
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Amarjot Kaur**

Made with ❤️ using React, Node.js, and MongoDB

---

## 🙏 Acknowledgments

- Design inspiration from Instagram and Facebook
- Neomorphism design trend
- React and Node.js communities
- MongoDB Atlas for database hosting
- Socket.io for real-time features

---

## 📞 Support

For support, email support@connecto.com or open an issue in the repository.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with 💜 by Amarjot Kaur

</div>
