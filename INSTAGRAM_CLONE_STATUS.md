# CONNECTO - Instagram Clone Feature Status Report

This document reviews the implemented, advanced, and pending features of Connecto in comparison to Instagram.

---

## 1. Implemented Core Instagram Features

### 👤 User Accounts & Profiles
- **Authentication**: Email/password registration and login backed by JWT. Fallback mock token mechanism for offline testing.
- **Dynamic Profiles**: Editable profile parameters (full name, username, bio, website, location, avatar, cover photo).
- **Follow System**: Live following and follower counts with modal listings. Custom hover effects transitions from "Following" to "Unfollow".
- **Account Settings**: Passwords changes, profile details toggles, notification settings, privacy flags, and Instagram/Facebook integrations.
- **Blocking System**: Facebook/Instagram-style blocking. Prevents blocked users from:
  - Searching for your profile.
  - Sending direct messages.
  - Seeing your posts, reels, or stories.
  - Viewing your profile (shows a clean `403 Forbidden` "Profile unavailable" state).

### 📰 Content Feed (Posts & Reels)
- **Chronological Feed**: Protected home feed listing posts from followed accounts (excluding blocked accounts).
- **Interactive Posts**: Supports double-tap and heart-click liking, post details view, and adding threaded comments.
- **Post & Reel Sharing**: Integrates the native **Web Share API** (for sharing on native apps) with a clipboard copy fallback (`/post/:id` link) and updates share counters.
- **Stories Tray**: Top horizontal tray for viewing active stories. Animated progress bars auto-advance every 5 seconds. Supports text replies and quick emoji reactions.
- **Reels swipe Feed**: Implements a dedicated reels view allowing vertical swipes to view short videos, post comments, like, and save content.
- **Saved Collections**: Custom "Saved Posts" and "Saved Reels" grids on the user's profile page.

### 🔍 Explore & Search
- **Unified Search Bar**: Navbar autocomplete dropdown searches the database in real-time on keypress for usernames, full names, and exact database ObjectIds.
- **Explore Grid**: Mosaic/masonry layout on the `/explore` tab featuring category chips and trending hashtags.
- **Hashtag Pages**: Dedicated hashtag routes (`/explore/tag/:tag`) showing all related posts.

### 💬 Messaging & DMs
- **Direct Messaging**: 1-to-1 real-time direct messaging backed by Socket.io.
- **Chat State Indication**: Live user online indicators and typing notifications.
- **Safe Messaging**: Strict backend checks block users from loading chats or messaging if blocked.

---

## 2. Advanced Custom Features (Unique to Connecto)

### 🧠 Mood-Driven Feed Personalization
Connecto features an advanced, emotional-state ranking algorithm for posts that is unique to this platform:
- **7-Dimensional Mood Vectors**: Both posts and user states are represented as affinity values across 7 emotional vectors:
  `[Happy, Sad, Stressed, Bored, Excited, Tired, Focused]`
- **Claude Sonnet API Classification**: When posts are created, the backend uses the **Claude 3.5 Sonnet API** (with a local keyword/emoji regex classifier fallback) to tag the post's text caption into its corresponding mood vector.
- **Personalized Ranking**: When a user selects their current mood in the navbar dropdown, the home feed calculates the **dot product** between the user's vector and each post's vector. It ranks candidates by weighting **60% mood affinity** and **40% social engagement** (likes/comments/shares) to personalize the feed dynamically.
- **TTL Anonymous Expiry**: Mood signals are stored anonymously (using hashed user IDs) and automatically expire via MongoDB TTL indexes after a set time.

---

## 3. Pending Features (To Complete Instagram Parity)

| Feature Area | Current Implementation | Pending Enhancements |
| :--- | :--- | :--- |
| **DMs & Chat** | 1-to-1 text messaging only. | - Sending media (photos, videos, audio notes) in chat.<br>- Group chats and direct voice calls.<br>- Vanish Mode (disappearing messages). |
| **Stories** | Camera capture with single text overlay. | - Drawing brushes, interactive stickers (polls, questions, countdowns).<br>- Creating Story Highlights folders on user profile.<br>- Story Archiving. |
| **Posts Creation** | Single image or video upload. | - Multiple image carousel posts (`post.images`).<br>- User tagging (people tags) and Location tagging.<br>- Option to hide likes count. |
| **Reels Editing** | Direct file upload or camera capture. | - Video editing timeline (splicing, text, audio selection, filters).<br>- Reel draft saving. |
| **Live Broadcasts** | Mode exists in UI but does not broadcast. | - WebRTC integration to allow real-time live broadcasting to followers with live chat. |

---

## 4. Build Validation
The project was tested and built successfully:
- Frontend compiled successfully with zero ESM or JSX warnings.
- Multer upload services are fully active and write directly to `server/uploads`.
- Search ID routing and query parameters are fully synchronized.
