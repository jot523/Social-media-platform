import React, { useState, useEffect, useContext } from "react";
import {
  FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark,
  FaChevronLeft, FaChevronRight, FaTimes, FaEllipsisH
} from "react-icons/fa";
import styles from "../css/PostDetailModal.module.css";
import { AuthContext } from "../Context/AuthContext";
import { buildHeaders, jsonHeaders } from "./authFetch";
import { getImageUrl } from "../services/utils/imageUtils";

function PostDetailModal({ isOpen, onClose, postId, onUpdate }) {
  const { user, token, setUser } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Carousel index state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Interaction states
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isOpen || !postId) return;
    
    const fetchPostDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          setLikeCount(data.likes?.length || 0);
          setLiked(data.likes?.some(id => (id._id || id) === user?._id) || false);
          setIsSaved(user?.savedPosts?.some(id => (id._id || id) === data._id) || false);
          setCurrentImageIndex(0);
        }
      } catch (err) {
        console.warn("Failed to fetch post details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [isOpen, postId, user]);

  if (!isOpen) return null;

  const handleLike = async () => {
    if (!post) return;
    const prevLiked = liked;
    setLiked(!prevLiked);
    setLikeCount(prev => prevLiked ? prev - 1 : prev + 1);

    if (!token) return;
    try {
      await fetch(`/api/posts/${post._id}/like`, {
        method: "PUT",
        headers: buildHeaders(token)
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn("Like API failed", err);
    }
  };

  const handleSave = async () => {
    if (!post || !token) return;

    // Optimistic Update
    setUser(prev => {
      const savedPosts = [...(prev?.savedPosts || [])];
      const index = savedPosts.indexOf(post._id);
      if (index === -1) {
        savedPosts.push(post._id);
      } else {
        savedPosts.splice(index, 1);
      }
      return { ...prev, savedPosts };
    });
    setIsSaved(!isSaved);

    try {
      await fetch(`/api/posts/${post._id}/save`, {
        method: "PUT",
        headers: buildHeaders(token)
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.warn("Save API failed", err);
    }
  };

  const handleAddComment = async (e) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || !token || !post) return;

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

    // Optimistic comment update
    setPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newCommentMock]
    }));
    setCommentText("");

    try {
      const res = await fetch(`/api/posts/${post._id}/comment`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({ text: commentText })
      });
      if (res.ok) {
        const data = await res.json();
        setPost(prev => {
          const newComments = Array.isArray(data) 
            ? data 
            : (data.comment ? [...(prev.comments || []).filter(c => c._id !== newCommentMock._id), data.comment] : prev.comments);
          return { ...prev, comments: newComments };
        });
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.warn("Comment API failed", err);
    }
  };

  // Carousel navigation
  const images = post?.images || (post?.image ? [post.image] : []);
  const showCarousel = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose}>
        <FaTimes />
      </button>

      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-secondary)' }}>
            <h3>Loading details...</h3>
          </div>
        ) : post ? (
          <>
            {/* Left Column: Media Section */}
            <div className={styles.mediaSection}>
              {images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(images[currentImageIndex])}
                    alt="post media"
                    className={styles.postImg}
                  />

                  {showCarousel && (
                    <>
                      <button className={`${styles.navArrow} ${styles.leftArrow}`} onClick={prevImage}>
                        <FaChevronLeft />
                      </button>
                      <button className={`${styles.navArrow} ${styles.rightArrow}`} onClick={nextImage}>
                        <FaChevronRight />
                      </button>
                      <div className={styles.carouselIndicators}>
                        {images.map((_, i) => (
                          <div
                            key={i}
                            className={`${styles.dot} ${i === currentImageIndex ? styles.activeDot : ""}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ color: "white", padding: "40px", textAlign: "center" }}>
                  <p>{post.caption}</p>
                </div>
              )}
            </div>

            {/* Right Column: Information & Comments */}
            <div className={styles.detailsSection}>
              {/* Header */}
              <div className={styles.postHeader}>
                <div className={styles.userInfo}>
                  <img src={getImageUrl(post.user?.avatar) || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={post.user?.username} className={styles.avatar} />
                  <span className={styles.username}>@{post.user?.username}</span>
                </div>
                <button className={styles.moreBtn}>
                  <FaEllipsisH />
                </button>
              </div>

              {/* Comments Area (includes Caption as first entry) */}
              <div className={styles.commentsArea}>
                {post.caption && (
                  <div className={styles.captionRow}>
                    <img src={getImageUrl(post.user?.avatar) || "https://randomuser.me/api/portraits/lego/1.jpg"} alt="" className={styles.avatar} />
                    <div className={styles.commentBubble}>
                      <span className={styles.commentUser}>@{post.user?.username}</span>
                      <span className={styles.commentText}>{post.caption}</span>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                {post.comments?.map((comment, index) => (
                  <div key={comment._id || index} className={styles.commentRow}>
                    <img src={getImageUrl(comment.user?.avatar) || "https://randomuser.me/api/portraits/lego/1.jpg"} alt="" className={styles.avatar} />
                    <div className={styles.commentBubble}>
                      <span className={styles.commentUser}>@{comment.user?.username}</span>
                      <span className={styles.commentText}>{comment.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons Footer */}
              <div className={styles.actionsFooter}>
                <div className={styles.actionButtons}>
                  <span className={`${styles.actionIcon} ${liked ? styles.liked : ""}`} onClick={handleLike}>
                    {liked ? <FaHeart /> : <FaRegHeart />}
                  </span>
                  <span className={styles.actionIcon}>
                    <FaRegComment />
                  </span>
                  <div style={{ flex: 1 }} />
                  <span className={styles.actionIcon} onClick={handleSave}>
                    {isSaved ? <FaBookmark className={styles.liked} /> : <FaRegBookmark />}
                  </span>
                </div>
                <div className={styles.likesCount}>
                  {likeCount} {likeCount === 1 ? "like" : "likes"}
                </div>
              </div>

              {/* Comment Input */}
              <form className={styles.inputBox} onSubmit={handleAddComment}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className={styles.commentInput}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button type="submit" className={styles.postCommentBtn} disabled={!commentText.trim()}>
                  Post
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-secondary)' }}>
            <h3>Failed to load post.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetailModal;
