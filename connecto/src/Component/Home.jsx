import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane, FaRegBookmark,
  FaBookmark, FaEllipsisH, FaImage, FaVideo, FaSmile, FaMapMarkerAlt,
  FaTimes, FaPaperPlane, FaHome, FaUsers, FaMapMarkedAlt, FaPlayCircle,
  FaFire, FaCheckCircle
} from "react-icons/fa";
import styles from "../css/Home.module.css";
import Stories from "./Stories";
import { AuthContext } from "../Context/AuthContext";
import FollowListModal from "./FollowListModal";
import PostDetailModal from "./PostDetailModal";
import { buildHeaders, jsonHeaders } from "./authFetch";
import { getImageUrl } from "../services/utils/imageUtils";

const demoPosts = [
  {
    _id: "demo1",
    user: { _id: "u1", username: "sarah_cruz", fullName: "Sarah Cruz", avatar: "https://randomuser.me/api/portraits/women/44.jpg", isVerified: true },
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    caption: "Golden hour in Bali 🌅 Nothing beats watching the sunset from a cliffside temple. This trip has been absolutely magical! #travel #bali #sunset",
    likes: ["u2", "u3", "u4"],
    comments: [
      { user: { username: "john_doe", avatar: "https://randomuser.me/api/portraits/men/32.jpg" }, text: "Absolutely stunning! 😍" },
      { user: { username: "diana_amber", avatar: "https://randomuser.me/api/portraits/women/65.jpg" }, text: "I need to visit Bali ASAP!" }
    ],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "demo2",
    user: { _id: "u2", username: "john_doe", fullName: "John Anderson", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800",
    caption: "Morning vibes in Central Park 🌳 Love starting my day with a peaceful walk through nature. NYC has its quiet moments too! #nyc #centralpark",
    likes: ["u1", "u3"],
    comments: [
      { user: { username: "sarah_cruz", avatar: "https://randomuser.me/api/portraits/women/44.jpg" }, text: "My favorite spot in the city! ❤️" }
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: "demo3",
    user: { _id: "u3", username: "emma_wilson", fullName: "Emma Wilson", avatar: "https://randomuser.me/api/portraits/women/12.jpg", isVerified: true },
    image: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=800",
    caption: "Made homemade pasta from scratch today! 🍝 Took 3 hours but totally worth it. Recipe coming soon on the blog! #foodie #homemade #pasta",
    likes: ["u1", "u2", "u4", "u5"],
    comments: [
      { user: { username: "olivia_page", avatar: "https://randomuser.me/api/portraits/women/50.jpg" }, text: "That looks delicious! Can't wait for the recipe 😋" },
      { user: { username: "sarah_cruz", avatar: "https://randomuser.me/api/portraits/women/44.jpg" }, text: "You're so talented Emma!" }
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  }
];

const demoSuggestions = [
  { _id: "s1", username: "olivia_page", fullName: "Olivia Page", avatar: "https://randomuser.me/api/portraits/women/50.jpg", followers: [1,2,3,4,5] },
  { _id: "s2", username: "alex_smith", fullName: "Alex Smith", avatar: "https://randomuser.me/api/portraits/men/45.jpg", followers: [1,2,3] },
  { _id: "s3", username: "diana_amber", fullName: "Diana Amber", avatar: "https://randomuser.me/api/portraits/women/65.jpg", followers: [1,2,3,4,5,6,7] },
  { _id: "s4", username: "chris_harris", fullName: "Chris Harris", avatar: "https://randomuser.me/api/portraits/men/76.jpg", followers: [1,2] },
  { _id: "s5", username: "nora_james", fullName: "Nora James", avatar: "https://randomuser.me/api/portraits/women/68.jpg", followers: [1,2,3,4] }
];

const trendingTopics = [
  { tag: "#travel", count: "24.5K posts" },
  { tag: "#photography", count: "18.2K posts" },
  { tag: "#foodie", count: "15.8K posts" },
  { tag: "#fitness", count: "12.1K posts" },
  { tag: "#sunset", count: "9.7K posts" }
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function ImageCarousel({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <img
        src={getImageUrl(images[currentIndex])}
        alt="post carousel"
        style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            style={{
              position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%',
              width: '30px', height: '30px', cursor: 'pointer', zIndex: 2
            }}
          >
            ‹
          </button>
          <button
            onClick={nextImage}
            style={{
              position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%',
              width: '30px', height: '30px', cursor: 'pointer', zIndex: 2
            }}
          >
            ›
          </button>
          <div style={{
            position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '5px', zIndex: 2
          }}>
            {images.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: i === currentIndex ? 'white' : 'rgba(255,255,255,0.5)'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Home() {
  const { user, setUser, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState(demoPosts);
  const [suggestions, setSuggestions] = useState(demoSuggestions);
  const [caption, setCaption] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const [expandedComments, setExpandedComments] = useState({});
  const [postMenuOpen, setPostMenuOpen] = useState(null);
  const fileInputRef = useRef(null);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const handleCommentClick = (postId) => {
    setSelectedPostId(postId);
    setPostModalOpen(true);
  };

  const handleFollowModalUpdate = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/me', {
        headers: buildHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.warn("Failed to refresh user profile data", err);
    }
  };

  // Mood-Based Feed AI States
  const [moodFeedActive, setMoodFeedActive] = useState(localStorage.getItem('moodFeedActive') === 'true');
  const [selectedMood, setSelectedMood] = useState(localStorage.getItem('selectedMood'));
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingMood, setPendingMood] = useState(null);

  // Fetch posts from API (re-runs when auth, toggle state, or selected mood changes)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const isMoodRank = moodFeedActive && selectedMood;
        const url = `/api/posts?moodRank=${isMoodRank ? 'true' : 'false'}`;
        const res = await fetch(url, { headers: buildHeaders(token) });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        // Fall back silently to demo posts on network error
      }
    };
    fetchPosts();
  }, [token, moodFeedActive, selectedMood]);

  const handleMoodSelect = async (moodName) => {
    const consented = localStorage.getItem('moodFeedConsent') === 'true';
    if (!consented) {
      setPendingMood(moodName);
      setShowConsentModal(true);
      return;
    }

    setSelectedMood(moodName);
    setMoodFeedActive(true);
    localStorage.setItem('selectedMood', moodName);
    localStorage.setItem('moodFeedActive', 'true');
    window.dispatchEvent(new Event('connectoMoodUpdate'));

    if (token) {
      try {
        await fetch('/api/mood/signal', {
          method: 'POST',
          headers: jsonHeaders(token),
          body: JSON.stringify({ mood: moodName, confidence: 1.0 })
        });
      } catch (err) {
        console.error('Failed to send mood signal:', err);
      }
    }
  };

  const handleToggleMoodFeed = async () => {
    if (moodFeedActive) {
      setMoodFeedActive(false);
      setSelectedMood(null);
      localStorage.setItem('moodFeedActive', 'false');
      localStorage.removeItem('selectedMood');
      window.dispatchEvent(new Event('connectoMoodUpdate'));

      if (token) {
        try {
          await fetch('/api/mood/signal', {
            method: 'DELETE',
            headers: buildHeaders(token)
          });
        } catch (err) {
          console.error('Failed to clear mood signal:', err);
        }
      }
    } else {
      const consented = localStorage.getItem('moodFeedConsent') === 'true';
      if (!consented) {
        setShowConsentModal(true);
        return;
      }
      setMoodFeedActive(true);
      localStorage.setItem('moodFeedActive', 'true');
      if (!selectedMood) {
        handleMoodSelect('Happy');
      } else {
        handleMoodSelect(selectedMood);
      }
    }
  };

  const handleAcceptConsent = () => {
    localStorage.setItem('moodFeedConsent', 'true');
    setShowConsentModal(false);
    if (pendingMood) {
      handleMoodSelect(pendingMood);
      setPendingMood(null);
    } else {
      handleToggleMoodFeed();
    }
  };


  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/users/suggestions', {
          headers: buildHeaders(token)
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {}
    };
    fetchSuggestions();
  }, [token]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newFiles = [...imageFiles, ...files].slice(0, 10); // max 10 images
    setImageFiles(newFiles);
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
    // Reset input so re-selecting same files works
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    // Revoke old blob URL
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(newFiles);
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const handlePublish = async () => {
    if (!caption.trim() && imageFiles.length === 0) return;
    setPublishing(true);

    const currentCaption = caption;
    const currentPreviews = [...imagePreviews];

    try {
      // Upload all images, collecting URLs
      const uploadedUrls = [];
      for (const file of imageFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: buildHeaders(token),
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            uploadedUrls.push(uploadData.url);
          } else {
            uploadedUrls.push(URL.createObjectURL(file));
          }
        } catch {
          uploadedUrls.push(URL.createObjectURL(file));
        }
      }

      const imageUrls = uploadedUrls.length > 0 ? uploadedUrls : currentPreviews;

      // Persist post to server
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: jsonHeaders(token),
        body: JSON.stringify({
          caption: currentCaption,
          images: imageUrls,
          image: imageUrls[0] || ''
        })
      });

      if (res.ok) {
        const newPost = await res.json();
        if (!newPost.image && currentPreviews.length > 0) {
          newPost.image = currentPreviews[0];
          newPost.images = currentPreviews;
        }
        setPosts(prev => [newPost, ...prev]);
      } else {
        setPosts(prev => [{
          _id: 'mock_' + Date.now(),
          user,
          caption: currentCaption,
          image: imageUrls[0] || '',
          images: imageUrls,
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        }, ...prev]);
      }
    } catch {
      setPosts(prev => [{
        _id: 'mock_' + Date.now(),
        user,
        caption: currentCaption,
        image: currentPreviews[0] || '',
        images: currentPreviews,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      }, ...prev]);
    } finally {
      setCaption('');
      setImageFiles([]);
      setImagePreviews([]);
      setPublishing(false);
    }
  };

  const handleLike = async (postId) => {
    const post = posts.find(p => p._id === postId);
    if (!post) return;
    const isLiked = post.likes?.some(id => (id._id || id) === user?._id);

    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        const likes = [...(p.likes || [])];
        if (isLiked) {
          return { ...p, likes: likes.filter(id => (id._id || id) !== user?._id) };
        } else {
          return { ...p, likes: [...likes, user?._id] };
        }
      }
      return p;
    }));

    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: buildHeaders(token)
      });
    } catch (err) {}
  };

  const handleSave = async (postId) => {
    const isSaved = user?.savedPosts?.some(id => (id._id || id) === postId);
    
    // Update AuthContext user state optimistically
    setUser(prev => {
      const saved = [...(prev?.savedPosts || [])];
      let newSaved;
      if (isSaved) {
        newSaved = saved.filter(id => (id._id || id) !== postId);
      } else {
        newSaved = [...saved, postId];
      }
      return { ...prev, savedPosts: newSaved };
    });

    try {
      await fetch(`/api/posts/${postId}/save`, {
        method: 'PUT',
        headers: buildHeaders(token)
      });
    } catch (err) {}
  };

  const handleFollow = async (userId) => {
    // Helper function for local/mock update
    const applyMockUpdate = () => {
      setUser(prev => {
        const following = [...(prev?.following || [])];
        const exists = following.some(id => (id._id || id) === userId);
        let newFollowing;
        if (exists) {
          newFollowing = following.filter(id => (id._id || id) !== userId);
        } else {
          newFollowing = [...following, userId];
        }
        return { ...prev, following: newFollowing };
      });
    };

    if (!token) {
      applyMockUpdate();
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'PUT',
        headers: buildHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, following: data.following }));
      } else {
        console.warn('Follow API failed, using mock fallback');
        applyMockUpdate();
      }
    } catch (err) {
      console.warn('Follow catch error, using mock fallback', err);
      applyMockUpdate();
    }
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
        method: 'POST',
        headers: jsonHeaders(token),
        body: JSON.stringify({ text })
      });
    } catch (err) {}
  };

  const handleDeletePost = async (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
    setPostMenuOpen(null);
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: buildHeaders(token)
      });
    } catch (err) {}
  };

  const handleShare = async (postId) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        return { ...p, shares: (p.shares || 0) + 1 };
      }
      return p;
    }));

    try {
      await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: buildHeaders(token)
      });
    } catch (err) {
      console.warn("Failed to share post", err);
    }
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.homeContainer}>

        {/* ===== LEFT SIDEBAR ===== */}
        <aside className={styles.leftSidebar}>
          {/* Profile Mini Card */}
          <div className={styles.profileMiniCard}>
            <img
              src={getImageUrl(user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
              alt="profile"
              className={styles.miniAvatar}
            />
            <div className={styles.miniInfo}>
              <h4>{user?.fullName || 'User'}</h4>
              <p>@{user?.username || 'username'}</p>
              <div className={styles.miniStats}>
                <div
                  className={styles.miniStat}
                  onClick={() => { setFollowModalType("followers"); setFollowModalOpen(true); }}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{user?.followers?.length || 0}</strong>
                  <span>Followers</span>
                </div>
                <div
                  className={styles.miniStat}
                  onClick={() => { setFollowModalType("following"); setFollowModalOpen(true); }}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{user?.following?.length || 0}</strong>
                  <span>Following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.sidebarCard}>
            <h3>Quick Links</h3>
            {[
              { icon: <FaHome />, label: "Home Feed", color: "var(--gradient-primary)" },
              { icon: <FaUsers />, label: "Friends", color: "var(--gradient-cool)" },
              { icon: <FaPlayCircle />, label: "Reels", color: "var(--gradient-reel)" },
              { icon: <FaMapMarkedAlt />, label: "Nearby", color: "var(--gradient-warm)" },
              { icon: <FaFire />, label: "Trending", color: "var(--gradient-story)" }
            ].map((item, i) => (
              <div key={i} className={styles.sidebarMenuItem}>
                <div className={styles.sidebarMenuIcon} style={{ background: item.color }}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ===== CENTER FEED ===== */}
        <main className={styles.centerFeed}>
          {/* Stories */}
          <Stories />

          {/* Mood-Based Feed AI Selector Widget */}
          <div className={styles.moodSelectorCard}>
            <div className={styles.moodSelectorHeader}>
              <div className={styles.moodSelectorTitle}>
                <h3>Mood-Based Feed AI</h3>
              </div>
              <button 
                className={`${styles.moodToggleBtn} ${moodFeedActive ? styles.active : ''}`}
                onClick={handleToggleMoodFeed}
              >
                {moodFeedActive ? 'Active' : 'Turn On'}
              </button>
            </div>
            
            <div className={styles.moodSelectorDesc}>
              {moodFeedActive && selectedMood 
                ? `Showing posts tailored for: ${selectedMood}` 
                : 'Enable to dynamically personalize your feed based on your mood.'}
            </div>

            <div className={styles.moodList}>
              {[
                { name: 'Happy', emoji: '😊' },
                { name: 'Sad', emoji: '😢' },
                { name: 'Stressed', emoji: '😰' },
                { name: 'Bored', emoji: '🥱' },
                { name: 'Excited', emoji: '🤩' },
                { name: 'Tired', emoji: '😴' },
                { name: 'Focused', emoji: '🧠' }
              ].map(mood => (
                <div 
                  key={mood.name} 
                  className={`${styles.moodItem} ${moodFeedActive && selectedMood === mood.name ? styles.active : ''}`}
                  onClick={() => handleMoodSelect(mood.name)}
                >
                  <span className={styles.moodEmoji}>{mood.emoji}</span>
                  <span className={styles.moodLabel}>{mood.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Consent Modal Overlay */}
          {showConsentModal && (
            <div className={styles.consentModalOverlay}>
              <div className={styles.consentModal}>
                <div className={styles.consentModalHeader}>
                  <span className={styles.consentIcon}>🧠</span>
                  <h3>Enable Mood-Based Feed AI</h3>
                </div>
                <div className={styles.consentModalBody}>
                  <p>
                    Mood-Based Feed AI dynamically shifts the order of posts on CONNECTO to align with your current emotional state.
                  </p>
                  <div className={styles.consentHighlight}>
                    🔒 <strong>Privacy First:</strong> Your facial biometrics never leave your device. High-level mood scores are sent to the server anonymously, and all logs are deleted in 24 hours.
                  </div>
                  <p>
                    By clicking accept, you authorize CONNECTO to process mood metadata to personalize your feed. You can disable this instantly at any time.
                  </p>
                </div>
                <div className={styles.consentModalFooter}>
                  <button 
                    className={styles.consentBtnCancel} 
                    onClick={() => { setShowConsentModal(false); setPendingMood(null); }}
                  >
                    Cancel
                  </button>
                  <button 
                    className={styles.consentBtnAccept} 
                    onClick={handleAcceptConsent}
                  >
                    Accept & Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Post */}
          <div className={styles.createPostCard}>
            <div className={styles.createPostTop}>
              <img
                src={getImageUrl(user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                alt="avatar"
                className={styles.createPostAvatar}
              />
              <input
                type="text"
                className={styles.createPostInput}
                placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0] || 'there'}?`}
                value={caption}
                onChange={e => setCaption(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePublish()}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className={styles.imagePreviewWrap} style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0' }}>
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={preview} alt={`preview ${idx + 1}`} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px' }} />
                    <button
                      className={styles.removeImageBtn}
                      onClick={() => removeImage(idx)}
                      style={{ position: 'absolute', top: '4px', right: '4px' }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.createPostActions}>
              <button
                className={styles.createActionBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <FaImage style={{ color: '#43e97b' }} /> Photo
              </button>
              <button className={styles.createActionBtn}>
                <FaVideo style={{ color: '#4facfe' }} /> Video
              </button>
              <button className={styles.createActionBtn}>
                <FaSmile style={{ color: '#ffd166' }} /> Feeling
              </button>
              <button className={styles.createActionBtn}>
                <FaMapMarkerAlt style={{ color: '#ef476f' }} /> Location
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                multiple
                onChange={handleImageSelect}
              />
              <button
                className={styles.publishBtn}
                onClick={handlePublish}
                disabled={publishing || (!caption.trim() && imageFiles.length === 0)}
              >
                {publishing ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className={styles.emptyFeed}>
              <FaImage />
              <h3>No posts yet</h3>
              <p>Be the first to share something!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className={styles.postCard}>
                {/* Post Header */}
                <div className={styles.postHeader}>
                  <div className={styles.postUser}>
                    <img
                      src={getImageUrl(post.user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                      alt={post.user?.username}
                      className={styles.postAvatar}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${post.user?._id}`)}
                    />
                    <div className={styles.postUserInfo}>
                      <h4
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/profile/${post.user?._id}`)}
                      >
                        {post.user?.fullName || post.user?.username}
                        {post.user?.isVerified && (
                          <FaCheckCircle className={styles.verifiedBadge} />
                        )}
                      </h4>
                      <span className={styles.postTime}>{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <button
                      className={styles.postMenuBtn}
                      onClick={() => setPostMenuOpen(postMenuOpen === post._id ? null : post._id)}
                    >
                      <FaEllipsisH />
                    </button>
                    {postMenuOpen === post._id && (
                      <div style={{
                        position: 'absolute', right: 0, top: '100%', zIndex: 10,
                        background: 'var(--neo-bg)', borderRadius: 'var(--border-radius)',
                        boxShadow: 'var(--neo-shadow-lg)', minWidth: '160px', overflow: 'hidden'
                      }}>
                        {(post.user?._id === user?._id || post.user?.username === user?.username) && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            style={{
                              display: 'block', width: '100%', padding: '12px 16px',
                              background: 'none', border: 'none', textAlign: 'left',
                              color: 'var(--danger)', cursor: 'pointer', fontSize: '14px',
                              fontWeight: '600'
                            }}
                          >
                            Delete Post
                          </button>
                        )}
                        <button
                          onClick={() => setPostMenuOpen(null)}
                          style={{
                            display: 'block', width: '100%', padding: '12px 16px',
                            background: 'none', border: 'none', textAlign: 'left',
                            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px'
                          }}
                        >
                          Report
                        </button>
                        <button
                          onClick={() => setPostMenuOpen(null)}
                          style={{
                            display: 'block', width: '100%', padding: '12px 16px',
                            background: 'none', border: 'none', textAlign: 'left',
                            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px'
                          }}
                        >
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Caption */}
                {post.caption && (
                  <div className={styles.postCaption}>
                    <strong
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${post.user?._id}`)}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {post.user?.username}{' '}
                    </strong>
                    {post.caption}
                  </div>
                )}

                {/* Post Image */}
                {post.images && post.images.length > 0 ? (
                  <ImageCarousel images={post.images} />
                ) : post.image ? (
                  <img src={getImageUrl(post.image)} alt="post" className={styles.postImage} />
                ) : null}

                {/* Post Actions */}
                <div className={styles.postActions}>
                  <button
                    className={`${styles.actionBtn} ${post.likes?.some(id => (id._id || id) === user?._id) ? styles.liked : ''}`}
                    onClick={() => handleLike(post._id)}
                  >
                    {post.likes?.some(id => (id._id || id) === user?._id) ? <FaHeart /> : <FaRegHeart />}
                    <span>{post.likes?.length || 0}</span>
                  </button>


                  <button
                    className={styles.actionBtn}
                    onClick={() => handleCommentClick(post._id)}
                  >
                    <FaRegComment />
                    <span>{post.comments?.length || 0}</span>
                  </button>

                  <button className={styles.actionBtn} onClick={() => handleShare(post._id)}>
                    <FaRegPaperPlane />
                    <span>{post.shares > 0 ? post.shares : 'Share'}</span>
                  </button>

                  <div className={styles.spacer} />

                  <button
                    className={`${styles.actionBtn} ${user?.savedPosts?.some(id => (id._id || id) === post._id) ? styles.saved : ''}`}
                    onClick={() => handleSave(post._id)}
                  >
                    {user?.savedPosts?.some(id => (id._id || id) === post._id) ? <FaBookmark /> : <FaRegBookmark />}
                  </button>
                </div>

                {/* Comments Section */}
                {(expandedComments[post._id] || (post.comments?.length > 0)) && (
                  <div className={styles.commentsSection}>
                    {post.comments?.slice(0, expandedComments[post._id] ? undefined : 2).map((comment, idx) => (
                      <div key={idx} className={styles.commentItem}>
                        <img
                          src={getImageUrl(comment.user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                          alt={comment.user?.username}
                          className={styles.commentAvatar}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/profile/${comment.user?._id || comment.user?.username}`)}
                        />
                        <div className={styles.commentBubble}>
                          <strong
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/profile/${comment.user?._id || comment.user?.username}`)}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {comment.user?.username}{' '}
                          </strong>
                          {comment.text}
                        </div>
                      </div>
                    ))}
                    {!expandedComments[post._id] && post.comments?.length > 2 && (
                      <button
                        className={styles.viewAllComments}
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post._id]: true }))}
                      >
                        View all {post.comments.length} comments
                      </button>
                    )}
                  </div>
                )}

                {/* Add Comment */}
                <div className={styles.addCommentBox}>
                  <img
                    src={getImageUrl(user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                    alt="me"
                    className={styles.addCommentAvatar}
                  />
                  <input
                    type="text"
                    className={styles.addCommentInput}
                    placeholder="Add a comment..."
                    value={commentInputs[post._id] || ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleComment(post._id)}
                  />
                  <button
                    className={styles.sendCommentBtn}
                    onClick={() => handleComment(post._id)}
                    disabled={!commentInputs[post._id]?.trim()}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            ))
          )}
        </main>

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside className={styles.rightSidebar}>
          {/* Suggestions */}
          <div className={styles.suggestionsCard}>
            <div className={styles.suggestionsHeader}>
              <h3>Suggestions</h3>
              <button className={styles.seeAllBtn}>See All</button>
            </div>
            {suggestions.map(suggestion => (
              <div key={suggestion._id} className={styles.suggestionItem}>
                <img
                  src={getImageUrl(suggestion.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                  alt={suggestion.username}
                  className={styles.suggestionAvatar}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${suggestion._id}`)}
                />
                <div 
                  className={styles.suggestionInfo}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${suggestion._id}`)}
                >
                  <span className={styles.suggestionName} style={{ textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{suggestion.fullName}</span>
                  <span className={styles.suggestionUsername}>
                    {suggestion.followers?.length || 0} followers
                  </span>
                </div>
                <button
                  className={`${styles.followBtn} ${user?.following?.some(id => (id._id || id) === suggestion._id) ? styles.following : ''}`}
                  onClick={() => handleFollow(suggestion._id)}
                >
                  {user?.following?.some(id => (id._id || id) === suggestion._id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>

          {/* Trending */}
          <div className={styles.trendingCard}>
            <h3>Trending</h3>
            {trendingTopics.map((topic, i) => (
              <div key={i} className={styles.trendingItem}>
                <span className={styles.trendingTag}>{topic.tag}</span>
                <span className={styles.trendingCount}>{topic.count}</span>
              </div>
            ))}
          </div>
        </aside>

      </div>
      <FollowListModal
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        userId={user?._id}
        type={followModalType}
        onUpdate={handleFollowModalUpdate}
      />
      <PostDetailModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        postId={selectedPostId}
        onUpdate={handleFollowModalUpdate}
      />
    </div>
  );
}

export default Home;
