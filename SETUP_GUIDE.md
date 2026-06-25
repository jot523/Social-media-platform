# 🚀 CONNECTO - Complete Setup Guide

This guide will walk you through setting up the Connecto social media platform from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Setup](#mongodb-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Features](#testing-the-features)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v16 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`

- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

- **MongoDB** (v5.0 or higher)
  - **Option A:** Local installation from https://www.mongodb.com/try/download/community
  - **Option B:** MongoDB Atlas (cloud) from https://www.mongodb.com/cloud/atlas

- **Git** (optional, for cloning)
  - Download from: https://git-scm.com/

### Recommended Tools

- **VS Code** - Code editor
- **Postman** - API testing
- **MongoDB Compass** - Database GUI

---

## 2. MongoDB Setup

### Option A: Local MongoDB

1. **Install MongoDB Community Edition**
   - Windows: Download MSI installer
   - Mac: `brew install mongodb-community`
   - Linux: Follow official docs

2. **Start MongoDB Service**
   ```bash
   # Windows (as service)
   net start MongoDB

   # Mac
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is running**
   ```bash
   mongosh
   # Should connect to mongodb://localhost:27017
   ```

### Option B: MongoDB Atlas (Cloud)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**
   - Choose FREE tier (M0)
   - Select region closest to you
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access"
   - Add new database user
   - Choose password authentication
   - Save username and password

4. **Setup Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/connecto`

---

## 3. Backend Setup

### Step 1: Navigate to Server Directory

```bash
cd connecto2/server
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- socket.io
- cors
- dotenv
- multer

### Step 3: Create Environment File

Create a file named `.env` in the `server` directory:

```bash
# Windows
type nul > .env

# Mac/Linux
touch .env
```

### Step 4: Configure Environment Variables

Open `.env` and add:

```env
# MongoDB Connection String
# For Local MongoDB:
MONGO_URI=mongodb://localhost:27017/connecto

# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/connecto

# JWT Secret (change this to a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_to_something_random

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a random, secure string!

### Step 5: Create Uploads Directory

```bash
# Windows
mkdir uploads

# Mac/Linux
mkdir -p uploads
```

### Step 6: Test Backend

```bash
npm start
```

You should see:
```
🚀 Connecto Server running on port 5000
MongoDB Connected: localhost
```

If you see errors, check the [Troubleshooting](#troubleshooting) section.

---

## 4. Frontend Setup

### Step 1: Navigate to Frontend Directory

Open a **NEW terminal** window and:

```bash
cd connecto2/connecto
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- react
- react-dom
- react-router-dom
- react-icons
- socket.io-client

### Step 3: Verify Proxy Configuration

Open `package.json` and ensure this line exists:

```json
"proxy": "http://localhost:5000"
```

This allows the frontend to communicate with the backend.

---

## 5. Running the Application

### Start Both Servers

You need **TWO terminal windows**:

#### Terminal 1 - Backend

```bash
cd connecto2/server
npm start
```

Keep this running. You should see:
```
🚀 Connecto Server running on port 5000
MongoDB Connected: ...
```

#### Terminal 2 - Frontend

```bash
cd connecto2/connecto
npm start
```

This will:
- Start the React development server
- Automatically open http://localhost:3000 in your browser

### What You Should See

1. **Landing Page** - Beautiful neomorphism design with login/signup forms
2. **No errors in console** - Check browser DevTools (F12)
3. **Backend logs** - Check Terminal 1 for API requests

---

## 6. Testing the Features

### Create Your First Account

1. **Go to Landing Page** (http://localhost:3000/landing)
2. **Click "Sign Up" tab**
3. **Fill in the form:**
   - Username: `testuser`
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. **Click "Create Account"**
5. **You should be redirected to the Home feed**

### Test Core Features

#### ✅ **Posts**
1. Click the "What's on your mind?" input
2. Type a caption
3. Click "Publish"
4. Your post should appear in the feed

#### ✅ **Stories**
1. Click "Your Story" in the stories carousel
2. Allow camera access
3. Take a photo
4. Add caption and publish

#### ✅ **Reels**
1. Navigate to "Reels" in the navbar
2. Scroll through demo reels
3. Like and comment on reels

#### ✅ **Chat**
1. Navigate to "Chat" in the navbar
2. Create a second account in another browser/incognito
3. Send messages between accounts
4. Messages should appear in real-time

#### ✅ **Profile**
1. Navigate to "Profile" in the navbar
2. Click "Edit Profile"
3. Update your bio and avatar
4. Save changes

#### ✅ **Search**
1. Use the search bar in navbar
2. Search for users by name or username
3. Click a user to view their profile

#### ✅ **Notifications**
1. Like or comment on another user's post
2. They should receive a notification
3. Click the bell icon to view notifications

---

## 7. Troubleshooting

### Backend Issues

#### ❌ "MongoDB connection error"

**Solution:**
- Check if MongoDB is running: `mongosh`
- Verify `MONGO_URI` in `.env`
- For Atlas: Check network access and credentials

#### ❌ "Port 5000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

Or change `PORT` in `.env` to `5001`

#### ❌ "JWT_SECRET is not defined"

**Solution:**
- Ensure `.env` file exists in `server` directory
- Check `JWT_SECRET` is set
- Restart the server

### Frontend Issues

#### ❌ "Cannot connect to backend"

**Solution:**
- Ensure backend is running on port 5000
- Check `proxy` in `package.json`
- Clear browser cache and restart

#### ❌ "Module not found" errors

**Solution:**
```bash
cd connecto
rm -rf node_modules package-lock.json
npm install
```

#### ❌ "CORS errors"

**Solution:**
- Backend should have `cors()` middleware
- Check `server.js` has `app.use(cors())`

### Socket.io Issues

#### ❌ "Real-time features not working"

**Solution:**
- Check browser console for Socket.io errors
- Ensure backend Socket.io server is running
- Try refreshing the page

---

## 8. Production Deployment

### Backend Deployment (Heroku Example)

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd server
   heroku create connecto-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_secret_key
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

### Frontend Deployment (Vercel Example)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build Frontend**
   ```bash
   cd connecto
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Update API URL**
   - Remove `proxy` from `package.json`
   - Update API calls to use full Heroku URL
   - Example: `fetch('https://connecto-api.herokuapp.com/api/posts')`

### Environment Variables for Production

**Backend (.env):**
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=super_secure_random_string
PORT=5000
NODE_ENV=production
```

**Frontend:**
- Create `.env.production`
```env
REACT_APP_API_URL=https://connecto-api.herokuapp.com
```

---

## 🎉 Success!

If you've followed all steps, you should now have:

✅ Backend API running on http://localhost:5000  
✅ Frontend app running on http://localhost:3000  
✅ MongoDB database connected  
✅ All features working (posts, stories, reels, chat, profile)  
✅ Real-time notifications and messaging  

---

## 📞 Need Help?

- **Check the main README.md** for feature documentation
- **Open an issue** on GitHub
- **Check browser console** (F12) for errors
- **Check server logs** in Terminal 1

---

## 🚀 Next Steps

1. **Customize the design** - Edit CSS files in `src/css/`
2. **Add more features** - Check the Roadmap in README.md
3. **Deploy to production** - Follow deployment guide above
4. **Invite friends** - Share your deployed app!

---

<div align="center">

**Happy Coding! 💜**

Made with ❤️ by Amarjot Kaur

</div>
