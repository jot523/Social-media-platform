import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import {
  FaUserFriends, FaMapMarkerAlt, FaUsers, FaCommentDots,
  FaImage, FaVideo, FaCamera, FaMapMarkedAlt,
  FaThumbsUp, FaRegThumbsUp, FaShare, FaEllipsisH,
  FaPlayCircle, FaFire, FaBookmark, FaCheckCircle
} from "react-icons/fa";
import styles from "../css/Newsfeed.module.css";
import { buildHeaders, jsonHeaders } from "./authFetch";
import { getImageUrl } from "../services/utils/imageUtils";

const onlineUsers = [
  { _id: "o1", username: "sarah_cruz", fullName: "Sarah Cruz", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { _id: "o2", username: "john_doe", fullName: "John Anderson", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { _id: "o3", username: "emma_wilson", fullName: "Emma Wilson", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
  { _id: "o4", username: "alex_smith", fullName: "Alex Smith", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
];

const followSuggestions = [
  { _id: "f1", fullName: "Diana Amber", username: "diana_amber", avatar: "https://randomuser.me/api/portraits/women/65.jpg", mutualFriends: 3 },
  { _id: "f2", fullName: "Chris Harris", username: "chris_harris", avatar: "https://randomuser.me/api/portraits/men/76.jpg", mutualFriends: 5 },
  { _id: "f3", fullName: "Nora James", username: "nora_james", avatar: "https://randomuser.me/api/portraits/women/68.jpg", mutualFriends: 2 },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Newsfeed() {
  const { user, token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newCaption, setNewCaption] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || data || []);
      }
    } catch (err) {}
  };

  const handleCreatePost = async () => {
    if (!newCaption.trim()) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({ caption: newCaption })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => [data, ...prev]);
      } else {
        // Mock post
        const mockPost = {
          _id: 'mock_' + Date.now(),
          user: user,
          caption: newCaption,
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        };
        setPosts(prev => [mockPost, ...prev]);
      }
      setNewCaption("");
    } catch (err) {
      const mockPost = {
        _id: 'mock_' + Date.now(),
        user: user,
        caption: newCaption,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };
      setPosts(prev => [mockPost, ...prev]);
      setNewCaption("");
    } finally {
      setPublishing(false);
    }
  };

  const handleLike = async (postId) => {
    setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        const isLiked = likedPosts[postId];
        return {
          ...p,
          likes: isLiked
            ? (p.likes || []).filter(id => id !== user?._id)
            : [...(p.likes || []), user?._id]
        };
      }
      return p;
    }));
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: "PUT",
        headers: buildHeaders(token)
      });
    } catch (err) {}
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    const newComment = {
      user: { username: user?.username, avatar: user?.avatar },
      text
    };
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        return { ...p, comments: [...(p.comments || []), newComment] };
      }
      return p;
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({ text })
      });
    } catch (err) {}
  };

  const handleFollow = async (userId) => {
    setFollowedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
    try {
      await fetch(`/api/users/${userId}/follow`, {
        method: 'PUT',
        headers: buildHeaders(token)
      });
    } catch (err) {}
  };

  return (
    <div className={styles.newsfeedPage}>
      <div className={styles.newsfeedContainer}>

        {/* ===== LEFT SIDEBAR ===== */}
        <aside className={styles.leftSidebar}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileCover} />
            <div className={styles.profileCardBody}>
              <img
                src={user?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                alt="profile"
                className={styles.profileCardAvatar}
              />
              <h4 className={styles.profileCardName}>{user?.fullName || 'User'}</h4>
              <p className={styles.profileCardUsername}>@{user?.username}</p>
              <div className={styles.profileCardStats}>
                <div className={styles.profileCardStat}>
                  <strong>{user?.followers?.length || 0}</strong>
                  <span>Followers</span>
                </div>
                <div className={styles.profileCardStat}>
                  <strong>{user?.following?.length || 0}</strong>
                  <span>Following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardTitle}>Explore</div>
            {[
              { icon: <FaUserFriends />, label: "My Newsfeed", color: "var(--gradient-primary)" },
              { icon: <FaMapMarkerAlt />, label: "People Nearby", color: "var(--gradient-warm)" },
              { icon: <FaUsers />, label: "Friends", color: "var(--gradient-cool)" },
              { icon: <FaPlayCircle />, label: "Watch Videos", color: "var(--gradient-reel)" },
              { icon: <FaFire />, label: "Trending", color: "var(--gradient-story)" },
              { icon: <FaBookmark />, label: "Saved Posts", color: "var(--gradient-sunset)" },
            ].map((item, i) => (
              <div key={i} className={styles.menuItem}>
                <div className={styles.menuIcon} style={{ background: item.color }}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ===== CENTER FEED ===== */}
        <main className={styles.centerFeed}>
          {/* Create Post */}
          <div className={styles.createPostBox}>
            <div className={styles.createPostTop}>
              <img
                src={getImageUrl(user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                alt="avatar"
                className={styles.createAvatar}
              />
              <textarea
                className={styles.createInput}
                placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0] || 'there'}?`}
                value={newCaption}
                onChange={e => setNewCaption(e.target.value)}
                rows={2}
              />
            </div>
            <div className={styles.createActions}>
              <button className={styles.createActionBtn}>
                <FaImage style={{ color: '#43e97b' }} /> Photo
              </button>
              <button className={styles.createActionBtn}>
                <FaVideo style={{ color: '#4facfe' }} /> Video
              </button>
              <button className={styles.createActionBtn}>
                <FaCamera style={{ color: '#f093fb' }} /> Story
              </button>
              <button className={styles.createActionBtn}>
                <FaMapMarkedAlt style={{ color: '#ef476f' }} /> Location
              </button>
              <button
                className={styles.publishBtn}
                onClick={handleCreatePost}
                disabled={publishing || !newCaption.trim()}
              >
                {publishing ? 'Posting...' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Posts */}
          {posts.map(post => (
            <div className={styles.postCard} key={post._id}>
              {/* Header */}
              <div className={styles.postHeader}>
                <div className={styles.postUser}>
                  <img
                    src={getImageUrl(post.user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt={post.user?.username}
                    className={styles.postAvatar}
                  />
                  <div className={styles.postUserInfo}>
                    <h4>
                      {post.user?.fullName || post.user?.username}
                      {post.user?.isVerified && <FaCheckCircle style={{ color: 'var(--primary)', fontSize: '14px', marginLeft: '4px' }} />}
                      <span>following</span>
                    </h4>
                    <p className={styles.postTime}>{timeAgo(post.createdAt)}</p>
                  </div>
                </div>
                <button className={styles.postMenuBtn}><FaEllipsisH /></button>
              </div>

              {/* Image */}
              {post.image && (
                <img src={getImageUrl(post.image)} alt="post" className={styles.postImage} />
              )}

              {/* Text */}
              {post.caption && (
                <div className={styles.postText}>{post.caption}</div>
              )}

              {/* Stats */}
              <div className={styles.postStats}>
                <span className={styles.statBtn}>
                  ❤️ {(post.likes?.length || 0) + (likedPosts[post._id] ? 1 : 0)} Likes
                </span>
                <span className={styles.statBtn}>
                  💬 {post.comments?.length || 0} Comments
                </span>
              </div>

              {/* Actions */}
              <div className={styles.postActions}>
                <button
                  className={`${styles.actionBtn} ${likedPosts[post._id] ? styles.liked : ''}`}
                  onClick={() => handleLike(post._id)}
                >
                  {likedPosts[post._id] ? <FaThumbsUp /> : <FaRegThumbsUp />}
                  Like
                </button>
                <button className={styles.actionBtn}>
                  <FaCommentDots /> Comment
                </button>
                <button className={styles.actionBtn}>
                  <FaShare /> Share
                </button>
              </div>

              {/* Comments */}
              {post.comments?.length > 0 && (
                <div className={styles.commentsSection}>
                  {post.comments.slice(0, 2).map((comment, idx) => (
                    <div key={idx} className={styles.commentItem}>
                      <img
                        src={getImageUrl(comment.user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                        alt=""
                        className={styles.commentAvatar}
                      />
                      <div className={styles.commentContent}>
                        <strong>{comment.user?.username}</strong>
                        {comment.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div className={styles.commentInputBox}>
                <img
                  src={getImageUrl(user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                  alt="me"
                />
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post._id] || ''}
                  onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleComment(post._id)}
                />
              </div>
            </div>
          ))}
        </main>

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside className={styles.rightSidebar}>
          {/* Online Friends */}
          <div className={styles.onlineCard}>
            <h3>Online Now</h3>
            {onlineUsers.map(u => (
              <div key={u._id} className={styles.onlineUser}>
                <div className={styles.onlineAvatarWrap}>
                  <img src={getImageUrl(u.avatar)} alt={u.username} className={styles.onlineAvatar} />
                  <div className={styles.onlineDot} />
                </div>
                <span className={styles.onlineUserName}>{u.fullName}</span>
              </div>
            ))}
          </div>

          {/* Who to Follow */}
          <div className={styles.followCard}>
            <h3>Who to Follow</h3>
            {followSuggestions.map(u => (
              <div key={u._id} className={styles.followItem}>
                <img src={getImageUrl(u.avatar)} alt={u.username} />
                <div className={styles.followItemInfo}>
                  <h4>{u.fullName}</h4>
                  <p>{u.mutualFriends} mutual friends</p>
                </div>
                <button
                  className={styles.followBtn}
                  onClick={() => handleFollow(u._id)}
                >
                  {followedUsers[u._id] ? '✓' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}

export default Newsfeed;
