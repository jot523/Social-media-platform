import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaSearch, FaUserFriends, FaCheckCircle } from "react-icons/fa";
import styles from "../css/FollowListModal.module.css";
import { AuthContext } from "../Context/AuthContext";
import { buildHeaders } from "./authFetch";

function FollowListModal({ isOpen, onClose, userId, type, onUpdate }) {
  const { user, token, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;
    
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${userId}/${type}`);
        if (res.ok) {
          const data = await res.json();
          setList(data);
        }
      } catch (err) {
        console.warn("Failed to fetch follow list", err);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  const handleFollowToggle = async (targetId) => {
    const applyMockUpdate = () => {
      setUser(prev => {
        const following = [...(prev?.following || [])];
        const exists = following.some(id => (id._id || id) === targetId);
        if (exists) {
          return { ...prev, following: following.filter(id => (id._id || id) !== targetId) };
        }
        return { ...prev, following: [...following, targetId] };
      });
      if (onUpdate) onUpdate();
    };

    if (!token) {
      applyMockUpdate();
      return;
    }

    try {
      const res = await fetch(`/api/users/${targetId}/follow`, {
        method: "PUT",
        headers: buildHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, following: data.following }));
        if (onUpdate) onUpdate();
      } else {
        applyMockUpdate();
      }
    } catch (err) {
      applyMockUpdate();
    }
  };

  const isFollowing = (targetId) => {
    return user?.following?.some(id => (id._id || id) === targetId);
  };

  const filteredList = list.filter(item => {
    const nameMatch = item.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const usernameMatch = item.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || usernameMatch;
  });

  const handleUserClick = (targetId) => {
    onClose();
    navigate(`/profile/${targetId}`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3>{type === "followers" ? "Followers" : "Following"}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <div className={styles.modalSearch}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className={styles.listContainer}>
          {loading ? (
            <div className={styles.loading}>Loading list...</div>
          ) : filteredList.length === 0 ? (
            <div className={styles.empty}>
              <FaUserFriends className={styles.emptyIcon} />
              <p>No users found</p>
            </div>
          ) : (
            filteredList.map(item => (
              <div key={item._id} className={styles.userRow}>
                <img
                  src={item.avatar}
                  alt={item.username}
                  className={styles.avatar}
                  onClick={() => handleUserClick(item._id)}
                />
                <div className={styles.info} onClick={() => handleUserClick(item._id)}>
                  <div className={styles.name}>
                    {item.fullName}
                    {item.isVerified && <FaCheckCircle className={styles.verified} />}
                  </div>
                  <div className={styles.username}>@{item.username}</div>
                </div>
                {user?._id !== item._id && (
                  <button
                    className={`${styles.actionBtn} ${isFollowing(item._id) ? styles.followingBtn : styles.followBtn}`}
                    onClick={() => handleFollowToggle(item._id)}
                  >
                    {isFollowing(item._id) ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowListModal;
