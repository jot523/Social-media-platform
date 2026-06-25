import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FaHeart, FaRegHeart, FaComment, FaShare, FaMusic,
  FaEllipsisV, FaVolumeMute, FaVolumeUp, FaPlay, FaPause
} from "react-icons/fa";
import styles from "../css/Reels.module.css";
import { AuthContext } from "../Context/AuthContext";
import { buildHeaders, jsonHeaders } from "./authFetch";
import { getImageUrl } from "../services/utils/imageUtils";

const demoReels = [
  {
    _id: "r1",
    user: { _id: "u1", username: "sarah_cruz", fullName: "Sarah Cruz", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    caption: "Sunset timelapse in Santorini 🇬🇷✨ The colors were absolutely breathtaking! #travel #sunset #santorini",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400",
    likes: ["u2", "u3", "u4", "u5"],
    comments: [{ text: "Stunning!" }, { text: "Goals 😍" }],
    shares: 45,
    music: "Original Audio - sarah_cruz"
  },
  {
    _id: "r2",
    user: { _id: "u2", username: "emma_wilson", fullName: "Emma Wilson", avatar: "https://randomuser.me/api/portraits/women/12.jpg" },
    caption: "60-second chocolate cake recipe 🍫🎂 Save this for later! #food #recipe #baking",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    likes: ["u1", "u3", "u4", "u5", "u6"],
    comments: [{ text: "Making this tonight!" }, { text: "Yum 😋" }, { text: "Recipe please!" }],
    shares: 120,
    music: "Trending Song 2024"
  },
  {
    _id: "r3",
    user: { _id: "u3", username: "chris_harris", fullName: "Chris Harris", avatar: "https://randomuser.me/api/portraits/men/76.jpg" },
    caption: "5-minute morning workout routine 💪🔥 No equipment needed! #fitness #workout #morning",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400",
    likes: ["u1", "u2"],
    comments: [{ text: "This is amazing!" }],
    shares: 12,
    music: "Workout Motivation - Gym Beats"
  }
];

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n;
}

function ReelItem({ reel, isActive }) {
  const { user, setUser, token } = useContext(AuthContext);
  const videoRef = useRef(null);
  const lastTapRef = useRef(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(reel.likes?.includes(user?._id) || false);
  const [likeCount, setLikeCount] = useState(reel.likes?.length || 0);
  
  // Follow status computed directly from auth context
  const followed = user?.following?.some(id => (id._id || id) === reel.user?._id);

  // Saved status computed directly from auth context
  const isSaved = user?.savedReels?.includes(reel._id) || false;

  // Comments drawer states
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(reel.comments || []);
  const [commentText, setCommentText] = useState("");

  // Share states
  const [sharesCount, setSharesCount] = useState(reel.shares || 0);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async (e) => {
    if (e) e.stopPropagation();
    const prevLiked = liked;
    setLiked(!prevLiked);
    setLikeCount(prev => prevLiked ? prev - 1 : prev + 1);
    
    if (!token) return;
    try {
      await fetch(`/api/reels/${reel._id}/like`, {
        method: 'PUT',
        headers: buildHeaders(token)
      });
    } catch (err) {
      console.warn("Failed to toggle like on reel", err);
    }
  };

  const handleDoubleTap = (e) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) {
        handleLike(e);
      }
    }
    lastTapRef.current = now;
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!token) return;
    
    // Optimistic Update
    setUser(prev => {
      const following = [...(prev?.following || [])];
      const exists = following.some(id => (id._id || id) === reel.user._id);
      if (exists) {
        return { ...prev, following: following.filter(id => (id._id || id) !== reel.user._id) };
      }
      return { ...prev, following: [...following, reel.user._id] };
    });

    try {
      const res = await fetch(`/api/users/${reel.user._id}/follow`, {
        method: 'PUT',
        headers: buildHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, following: data.following }));
      }
    } catch (err) {
      console.warn("Follow failed", err);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!token) return;

    // Optimistic Update
    setUser(prev => {
      const savedReels = [...(prev?.savedReels || [])];
      const index = savedReels.indexOf(reel._id);
      if (index === -1) {
        savedReels.push(reel._id);
      } else {
        savedReels.splice(index, 1);
      }
      return { ...prev, savedReels };
    });

    try {
      await fetch(`/api/reels/${reel._id}/save`, {
        method: 'PUT',
        headers: buildHeaders(token)
      });
    } catch (err) {
      console.warn("Failed to save reel", err);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    setSharesCount(prev => prev + 1);
    
    try {
      await fetch(`/api/reels/${reel._id}/share`, {
        method: 'PUT',
        headers: buildHeaders(token)
      });

      const shareUrl = `${window.location.origin}/reel/${reel._id}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Connecto Reel',
            text: reel.caption || 'Check out this reel on Connecto!',
            url: shareUrl,
          });
        } catch (shareErr) {
          console.log('Share prompt dismissed', shareErr);
        }
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Reel link copied to clipboard!');
      }
    } catch (err) {
      console.warn("Failed to share reel", err);
    }
  };

  const handleAddComment = async (e) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || !token) return;

    const newCommentMock = {
      _id: "mock_" + Date.now(),
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar
      },
      text: commentText,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, newCommentMock]);
    setCommentText("");

    try {
      const res = await fetch(`/api/reels/${reel._id}/comment`, {
        method: 'POST',
        headers: jsonHeaders(token),
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const updatedComments = await res.json();
        setComments(updatedComments);
      }
    } catch (err) {
      console.warn("Failed to add comment", err);
    }
  };

  return (
    <div className={styles.reelItem}>
      {/* Video */}
      <video
        ref={videoRef}
        className={styles.reelVideo}
        src={getImageUrl(reel.videoUrl)}
        poster={getImageUrl(reel.thumbnail)}
        loop
        muted={isMuted}
        playsInline
        onClick={handleDoubleTap}
      />

      {/* Play/Pause Overlay */}
      <div className={styles.playPauseOverlay} onClick={togglePlay}>
        <div className={styles.playPauseIcon}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </div>
      </div>

      {/* Mute Button */}
      <button className={styles.muteBtn} onClick={toggleMute}>
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </button>

      {/* Right Actions */}
      <div className={styles.actionsRight}>
        <div className={styles.actionAvatar}>
          <img src={getImageUrl(reel.user.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt={reel.user.username} />
          {reel.user._id !== user?._id && (
            <button className={styles.followBtn} onClick={handleFollow}>
              {followed ? '✓' : '+'}
            </button>
          )}
        </div>

        <div className={styles.actionBtn} onClick={handleLike}>
          <div className={`${styles.iconCircle} ${liked ? styles.liked : ''}`}>
            {liked ? <FaHeart /> : <FaRegHeart />}
          </div>
          <span>{formatCount(likeCount)}</span>
        </div>

        <div className={styles.actionBtn} onClick={() => setCommentsOpen(true)}>
          <div className={styles.iconCircle}>
            <FaComment />
          </div>
          <span>{formatCount(comments.length)}</span>
        </div>

        <div className={styles.actionBtn} onClick={handleShare}>
          <div className={styles.iconCircle}>
            <FaShare />
          </div>
          <span>{formatCount(sharesCount)}</span>
        </div>

        <div className={styles.actionBtn} onClick={handleSave}>
          <div className={`${styles.iconCircle} ${isSaved ? styles.liked : ''}`}>
            <FaEllipsisV />
          </div>
          <span>{isSaved ? "Saved" : "Save"}</span>
        </div>

        <div className={styles.audioTrack}>
          <img src={getImageUrl(reel.user.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt="audio" />
        </div>
      </div>

      {/* Bottom Info */}
      <div className={styles.infoBottom}>
        <div className={styles.userInfo}>
          <span className={styles.username}>@{reel.user.username}</span>
          {reel.user._id !== user?._id && !followed && (
            <button className={styles.followTextBtn} onClick={handleFollow}>
              Follow
            </button>
          )}
        </div>
        <p className={styles.caption}>{reel.caption}</p>
        <div className={styles.musicMarquee}>
          <FaMusic className={styles.musicIcon} />
          <span className={styles.musicText}>{reel.music}</span>
        </div>
      </div>

      {/* Comments Drawer */}
      {commentsOpen && (
        <div className={styles.commentsDrawer}>
          <div className={styles.drawerHeader}>
            <h4>Comments</h4>
            <button className={styles.drawerCloseBtn} onClick={() => setCommentsOpen(false)}>✕</button>
          </div>
          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No comments yet.</div>
            ) : (
              comments.map((comment, index) => (
                <div key={comment._id || index} className={styles.commentRow}>
                  <img src={getImageUrl(comment.user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt="" className={styles.commentAvatar} />
                  <div className={styles.commentBubble}>
                    <span className={styles.commentUser}>@{comment.user?.username || 'user'}</span>
                    <span className={styles.commentText}>{comment.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <form className={styles.drawerInputBox} onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder="Add a comment..."
              className={styles.drawerInput}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button type="submit" className={styles.sendBtn}>✓</button>
          </form>
        </div>
      )}
    </div>
  );
}

function Reels() {
  const [reels, setReels] = useState(demoReels);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const localReels = JSON.parse(localStorage.getItem('local_reels') || '[]');
    if (localReels.length > 0) {
      setReels(prev => {
        const existingIds = new Set(prev.map(r => r._id));
        const filteredLocal = localReels.filter(r => !existingIds.has(r._id));
        return [...filteredLocal, ...prev];
      });
    }

    const fetchReels = async () => {
      try {
        const res = await fetch('/api/reels');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const mapped = data.map(r => ({
              _id: r._id,
              user: r.user,
              caption: r.caption,
              videoUrl: r.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
              thumbnail: r.thumbnail,
              likes: r.likes || [],
              comments: r.comments || [],
              shares: r.shares || 0,
              music: r.music || 'Original Audio'
            }));
            setReels(prev => {
              const existingIds = new Set(prev.map(r => r._id));
              const filteredMapped = mapped.filter(r => !existingIds.has(r._id));
              return [...prev, ...filteredMapped];
            });
          }
        }
      } catch (err) {}
    };
    fetchReels();
  }, []);

  useEffect(() => {
    const handleReelPublished = (e) => {
      if (e.detail) {
        setReels(prev => {
          const existingIds = new Set(prev.map(r => r._id));
          if (existingIds.has(e.detail._id)) return prev;
          return [e.detail, ...prev];
        });
      }
    };
    window.addEventListener('reel-published', handleReelPublished);
    return () => window.removeEventListener('reel-published', handleReelPublished);
  }, []);

  // Track which reel is visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      setActiveIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.reelsPage}>
      <div className={styles.reelsContainer} ref={containerRef}>
        {reels.map((reel, idx) => (
          <ReelItem key={reel._id} reel={reel} isActive={idx === activeIndex} />
        ))}
      </div>
    </div>
  );
}

export default Reels;
