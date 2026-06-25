import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheck, FaHeart, FaComment, FaUserPlus } from "react-icons/fa";
import styles from "../css/Activity.module.css";
import { AuthContext } from "../Context/AuthContext";
import PostDetailModal from "./PostDetailModal";
import { buildHeaders } from "./authFetch";
import { getImageUrl } from "../services/utils/imageUtils";

function Activity() {
  const { user, token, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Post detail modal state
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postModalOpen, setPostModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications", {
          headers: buildHeaders(token)
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.warn("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [token]);

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: buildHeaders(token)
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.warn("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    // 1. Mark as read on backend
    if (!notif.read && token) {
      try {
        await fetch(`/api/notifications/${notif._id}/read`, {
          method: "PUT",
          headers: buildHeaders(token)
        });
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.warn("Failed to mark notification as read", err);
      }
    }

    // 2. Perform navigation or action
    if (notif.type === "follow") {
      navigate(`/profile/${notif.sender?._id}`);
    } else if ((notif.type === "like" || notif.type === "comment") && notif.post) {
      // Open detailed modal overlay directly
      setSelectedPostId(notif.post?._id || notif.post);
      setPostModalOpen(true);
    }
  };

  const handleFollowToggle = async (e, targetId) => {
    e.stopPropagation();
    if (!token) return;
    
    // Optimistic Update
    setUser(prev => {
      const following = [...(prev?.following || [])];
      const exists = following.some(id => (id._id || id) === targetId);
      if (exists) {
        return { ...prev, following: following.filter(id => (id._id || id) !== targetId) };
      }
      return { ...prev, following: [...following, targetId] };
    });

    try {
      const res = await fetch(`/api/users/${targetId}/follow`, {
        method: "PUT",
        headers: buildHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, following: data.following }));
      }
    } catch (err) {
      console.warn("Follow toggle failed in activity", err);
    }
  };

  const isFollowing = (targetId) => {
    return user?.following?.some(id => (id._id || id) === targetId);
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "like":
        return <FaHeart style={{ color: "#ef476f" }} />;
      case "comment":
        return <FaComment style={{ color: "#4facfe" }} />;
      case "follow":
        return <FaUserPlus style={{ color: "#43e97b" }} />;
      default:
        return <FaBell />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.activityPage}>
      <div className={styles.activityContainer}>
    
        <div className={styles.header}>
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <button className={styles.markReadBtn} onClick={handleMarkAllRead}>
              <FaCheck /> Mark all as read
            </button>
          )}
        </div>

        
        {loading ? (
          <div className={styles.loading}>
            <h3>Loading notifications...</h3>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <FaBell className={styles.emptyIcon} />
            <h3>No notifications yet</h3>
            <p>Likes, comments, and follows on your content will show up here.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map(notif => (
              <div
                key={notif._id}
                className={`${styles.notificationItem} ${!notif.read ? styles.unread : ""}`}
                onClick={() => handleNotificationClick(notif)}
              >
              
                <img
                  src={getImageUrl(notif.sender?.avatar) || "https://randomuser.me/api/portraits/lego/1.jpg"}
                  alt={notif.sender?.username}
                  className={styles.avatar}
                />

                <div className={styles.content}>
                  <div className={styles.text}>
                    <span className={styles.username}>{notif.sender?.fullName || notif.sender?.username}</span>
                    {notif.message}
                  </div>
                  <span className={styles.time}>
                    {getNotifIcon(notif.type)} &nbsp;
                    {formatTime(notif.createdAt)}
                  </span>
                </div>

                
                {notif.type === "follow" && notif.sender?._id !== user?._id && (
                  <button
                    className={isFollowing(notif.sender?._id) ? styles.followingBtn : styles.followBtn}
                    onClick={(e) => handleFollowToggle(e, notif.sender?._id)}
                  >
                    {isFollowing(notif.sender?._id) ? "Following" : "Follow Back"}
                  </button>
                )}

                {(notif.type === "like" || notif.type === "comment") && notif.post && (
                  <img
                    src={getImageUrl(notif.post.image) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"}
                    alt="post preview"
                    className={styles.postPreview}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

     
      <PostDetailModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        postId={selectedPostId}
        onUpdate={() => {}}
      />
    </div>
  );
}

export default Activity;
