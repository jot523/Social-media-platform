import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../css/Profile.module.css";
import { AuthContext } from "../Context/AuthContext";
import { buildHeaders, jsonHeaders } from "./authFetch";
import { getImageUrl } from "../services/utils/imageUtils";
import {
  FaTh, FaPlayCircle, FaUserTag, FaTimes, FaCamera,
  FaEdit, FaCog, FaMapMarkerAlt, FaLink, FaCheckCircle,
  FaSignOutAlt, FaLock, FaBell, FaShieldAlt, FaCommentDots, FaRegBookmark, FaBan
} from "react-icons/fa";
import FollowListModal from "./FollowListModal";
import PostDetailModal from "./PostDetailModal";

function Profile() {
  const { user, setUser, token, logout, updateUser } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('POSTS');
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [isFollowHovered, setIsFollowHovered] = useState(false);
  
  // Highlights States
  const [highlights, setHighlights] = useState([]);
  const [showCreateHighlight, setShowCreateHighlight] = useState(false);
  const [userStories, setUserStories] = useState([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState([]);
  const [highlightTitle, setHighlightTitle] = useState("");
  const [creatingHighlight, setCreatingHighlight] = useState(false);
  
  // Viewing Highlight State
  const [viewingHighlight, setViewingHighlight] = useState(null);
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyPaused, setStoryPaused] = useState(false);
  
  const isBlocked = user?.privacySettings?.blockedUsers?.some(
    u => (u._id || u) === profileUser?._id
  );

  const handleToggleBlock = async () => {
    if (!profileUser || !token) return;
    try {
      const res = await fetch(`/api/users/block/${profileUser._id}`, {
        method: 'PUT',
        headers: jsonHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data);
      }
    } catch (err) {
      console.warn("Failed to block/unblock user", err);
    }
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setPostModalOpen(true);
  };

  const isOwnProfile = !userId || userId === user?._id;

  useEffect(() => {
    if (activeTab === 'SAVED' && isOwnProfile && token) {
      const fetchSavedPosts = async () => {
        setLoadingSaved(true);
        try {
          const res = await fetch('/api/posts/saved', {
            headers: buildHeaders(token)
          });
          if (res.ok) {
            const data = await res.json();
            setSavedPosts(data.posts || data || []);
          }
        } catch (err) {
          console.warn("Failed to fetch saved posts", err);
        } finally {
          setLoadingSaved(false);
        }
      };
      fetchSavedPosts();
    }
  }, [activeTab, isOwnProfile, token]);

  const handleFollowModalUpdate = async () => {
    const targetId = userId || user?._id;
    if (!targetId) return;
    try {
      const res = await fetch(`/api/users/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setProfileUser(data);
        if (targetId === user?._id) {
          setUser(data);
        }
      }
    } catch (err) {
      console.warn("Failed to update profile user stats", err);
    }
  };

  // Story Highlight Timer and Navigation
  useEffect(() => {
    if (!viewingHighlight || storyPaused) return;

    const storiesCount = viewingHighlight.stories?.length || 0;
    if (storiesCount === 0) return;

    const timer = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          if (viewingStoryIndex < storiesCount - 1) {
            setViewingStoryIndex(idx => idx + 1);
            return 0;
          } else {
            setViewingHighlight(null);
            setViewingStoryIndex(0);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [viewingHighlight, viewingStoryIndex, storyPaused]);

  const handleOpenHighlightViewer = (hl) => {
    setViewingHighlight(hl);
    setViewingStoryIndex(0);
    setStoryProgress(0);
    setStoryPaused(false);
  };

  const handleNextHighlightStory = () => {
    const storiesCount = viewingHighlight?.stories?.length || 0;
    if (viewingStoryIndex < storiesCount - 1) {
      setViewingStoryIndex(idx => idx + 1);
      setStoryProgress(0);
    } else {
      setViewingHighlight(null);
      setViewingStoryIndex(0);
      setStoryProgress(0);
    }
  };

  const handlePrevHighlightStory = () => {
    if (viewingStoryIndex > 0) {
      setViewingStoryIndex(idx => idx - 1);
      setStoryProgress(0);
    }
  };

  const fetchUserStories = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/stories', {
        headers: buildHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        const ownGroup = data.find(g => g.user?._id === user?._id);
        setUserStories(ownGroup ? ownGroup.stories : []);
      }
    } catch (err) {
      console.warn("Failed to fetch user stories", err);
    }
  };

  const handleOpenCreateHighlight = () => {
    setSelectedStoryIds([]);
    setHighlightTitle("");
    fetchUserStories();
    setShowCreateHighlight(true);
  };

  const handleCreateHighlightSubmit = async () => {
    if (!highlightTitle.trim()) {
      alert("Please enter a title");
      return;
    }
    if (selectedStoryIds.length === 0) {
      alert("Please select at least one story");
      return;
    }

    setCreatingHighlight(true);
    try {
      const firstStoryId = selectedStoryIds[0];
      const firstStoryObj = userStories.find(s => s._id === firstStoryId);
      const coverImage = firstStoryObj ? firstStoryObj.mediaUrl : "";

      const res = await fetch('/api/users/highlights', {
        method: 'POST',
        headers: jsonHeaders(token),
        body: JSON.stringify({
          title: highlightTitle.trim(),
          coverImage,
          storyIds: selectedStoryIds
        })
      });

      if (res.ok) {
        const targetId = userId || user?._id;
        const highlightsRes = await fetch(`/api/users/${targetId}/highlights`, {
          headers: buildHeaders(token)
        });
        if (highlightsRes.ok) {
          const hData = await highlightsRes.json();
          setHighlights(hData);
        }
        setShowCreateHighlight(false);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to create highlight");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setCreatingHighlight(false);
    }
  };

  const handleDeleteHighlight = async (highlightId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this highlight?")) return;

    try {
      const res = await fetch(`/api/users/highlights/${highlightId}`, {
        method: 'DELETE',
        headers: buildHeaders(token)
      });
      if (res.ok) {
        setHighlights(prev => prev.filter(h => h._id !== highlightId));
        if (viewingHighlight?._id === highlightId) {
          setViewingHighlight(null);
        }
      }
    } catch (err) {
      console.warn("Failed to delete highlight", err);
    }
  };

  // Edit Profile States
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Load target user profile and posts
  useEffect(() => {
    const loadProfileAndPosts = async () => {
      const targetId = userId || user?._id;
      if (!targetId) return;

      // 1. Fetch user profile details
      let targetUserObj = null;
      if (!userId || userId === user?._id) {
        targetUserObj = user;
        setProfileUser(user);
      } else {
        try {
          const profileRes = await fetch(`/api/users/${userId}`);
          if (profileRes.ok) {
            const data = await profileRes.json();
            targetUserObj = data;
            setProfileUser(data);
          }
        } catch (err) {
          console.error("Failed to fetch target user profile", err);
        }
      }

      // 2. Populate edit states (only relevant for own profile)
      if (targetUserObj) {
        setFullName(targetUserObj.fullName || '');
        setBio(targetUserObj.bio || '');
        setWebsite(targetUserObj.website || '');
        setLocation(targetUserObj.location || '');
        setAvatarPreview(targetUserObj.avatar || '');
      }

      // 3. Fetch user's posts
      try {
        const res = await fetch(`/api/users/${targetId}/posts`);
        if (res.ok) {
          const data = await res.json();
          setUserPosts(data);
        } else {
          // Fallback: filter from all posts
          const allRes = await fetch('/api/posts');
          if (allRes.ok) {
            const allData = await allRes.json();
            const myPosts = allData.filter(p =>
              p.user?._id === targetId || p.user?.username === targetId
            );
            setUserPosts(myPosts);
          }
        }
      } catch (err) {
        console.error("Failed to fetch posts", err);
      }

      // 4. Fetch highlights
      try {
        const highlightsRes = await fetch(`/api/users/${targetId}/highlights`, {
          headers: buildHeaders(token)
        });
        if (highlightsRes.ok) {
          const hData = await highlightsRes.json();
          setHighlights(hData);
        }
      } catch (err) {
        console.warn("Failed to fetch highlights", err);
      }
    };

    loadProfileAndPosts();
  }, [userId, user, token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleFollowToggle = async () => {
    if (!profileUser) return;

    // Helper function for local/mock update
    const applyMockUpdate = () => {
      setUser(prev => {
        const following = [...(prev?.following || [])];
        const exists = following.some(id => (id._id || id) === profileUser._id);
        let newFollowing;
        if (exists) {
          newFollowing = following.filter(id => (id._id || id) !== profileUser._id);
        } else {
          newFollowing = [...following, profileUser._id];
        }
        return { ...prev, following: newFollowing };
      });
      setProfileUser(prev => {
        const followers = [...(prev.followers || [])];
        const exists = followers.some(f => (f._id || f) === user?._id);
        let newFollowers;
        if (exists) {
          newFollowers = followers.filter(f => (f._id || f) !== user?._id);
        } else {
          newFollowers = [...followers, user];
        }
        return { ...prev, followers: newFollowers };
      });
    };

    if (!token) {
      applyMockUpdate();
      return;
    }

    try {
      const res = await fetch(`/api/users/${profileUser._id}/follow`, {
        method: 'PUT',
        headers: buildHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, following: data.following }));
        setProfileUser(prev => {
          const followers = [...(prev.followers || [])];
          const exists = followers.some(f => (f._id || f) === user._id);
          let newFollowers;
          if (exists) {
            newFollowers = followers.filter(f => (f._id || f) !== user._id);
          } else {
            newFollowers = [...followers, user];
          }
          return { ...prev, followers: newFollowers };
        });
      } else {
        console.warn('Profile follow API failed, using mock fallback');
        applyMockUpdate();
      }
    } catch (err) {
      console.warn('Profile follow catch error, using mock fallback', err);
      applyMockUpdate();
    }
  };

  const handleMessageClick = () => {
    if (!profileUser) return;
    navigate('/chat', { state: { selectUser: profileUser } });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    let avatarUrl = user.avatar;

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: buildHeaders(token),
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.url;
        }
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: jsonHeaders(token),
        body: JSON.stringify({ fullName, bio, avatar: avatarUrl, website, location })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      } else {
        // Mock update for UI testing
        updateUser({ fullName, bio, avatar: avatarUrl, website, location });
      }
      setShowEdit(false);
    } catch (err) {
      // Mock update fallback
      updateUser({ fullName, bio, avatar: avatarUrl, website, location });
      setShowEdit(false);
    } finally {
      setSaving(false);
    }
  };


  if (!profileUser) {
    return (
      <div className={styles.profilePage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Loading profile...</p>
      </div>
    );
  }

  const isFollowing = user?.following?.some(id => (id._id || id) === profileUser?._id);

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>

        {/* Cover Photo */}
        <div className={styles.coverPhotoWrap}>
          {profileUser.coverPhoto ? (
            <img src={getImageUrl(profileUser.coverPhoto)} alt="cover" className={styles.coverPhoto} />
          ) : (
            <div className={styles.coverPhotoPlaceholder} />
          )}
          {isOwnProfile && (
            <button className={styles.changeCoverBtn}>
              <FaCamera /> Change Cover
            </button>
          )}
        </div>

        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              <img
                src={getImageUrl(profileUser.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                alt="profile"
                className={styles.profileAvatar}
              />
              {isOwnProfile && (
                <div
                  className={styles.changeAvatarOverlay}
                  onClick={() => { setShowEdit(true); setTimeout(() => fileInputRef.current?.click(), 100); }}
                >
                  <FaCamera />
                </div>
              )}
            </div>

            <div className={styles.profileActions}>
              {isOwnProfile ? (
                <>
                  <button className={styles.editProfileBtn} onClick={() => setShowEdit(true)}>
                    <FaEdit /> Edit Profile
                  </button>
                  <button className={styles.settingsBtn} onClick={() => setShowSettings(true)}>
                    <FaCog />
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {isBlocked ? (
                    <button 
                      className={styles.editProfileBtn}
                      style={{ color: 'var(--danger, #ef476f)' }}
                      onClick={handleToggleBlock}
                    >
                      <FaBan /> Unblock
                    </button>
                  ) : (
                    <>
                      <button 
                        className={isFollowing ? styles.editProfileBtn : styles.followProfileBtn} 
                        onClick={handleFollowToggle}
                        onMouseEnter={() => setIsFollowHovered(true)}
                        onMouseLeave={() => setIsFollowHovered(false)}
                      >
                        {isFollowing ? (isFollowHovered ? 'Unfollow' : 'Following') : 'Follow'}
                      </button>
                      <button className={styles.messageProfileBtn} onClick={handleMessageClick}>
                        <FaCommentDots /> Message
                      </button>
                      <button 
                        className={styles.editProfileBtn}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          color: '#ef476f', 
                          border: '1px solid rgba(239, 71, 111, 0.2)',
                          background: 'rgba(239, 71, 111, 0.1)',
                          padding: 0 
                        }}
                        onClick={handleToggleBlock}
                        title="Block User"
                      >
                        <FaBan />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className={styles.profileInfo}>
            <div className={styles.profileNameRow}>
              <h1 className={styles.profileFullName}>{profileUser.fullName || 'User Name'}</h1>
              {profileUser.isVerified && <FaCheckCircle className={styles.verifiedBadge} />}
            </div>
            <p className={styles.profileUsername}>@{profileUser.username || 'username'}</p>

            {profileUser.bio && (
              <p className={styles.profileBio}>{profileUser.bio}</p>
            )}

            <div className={styles.profileMeta}>
              {profileUser.location && (
                <span className={styles.profileMetaItem}>
                  <FaMapMarkerAlt /> {profileUser.location}
                </span>
              )}
              {profileUser.website && (
                <span className={styles.profileMetaItem}>
                  <FaLink />
                  <a href={profileUser.website} target="_blank" rel="noopener noreferrer">
                    {profileUser.website.replace(/^https?:\/\//, '')}
                  </a>
                </span>
              )}
            </div>

            <div className={styles.profileStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{userPosts.length}</span>
                <span className={styles.statLabel}>Posts</span>
              </div>
              <div
                className={styles.statItem}
                onClick={() => { setFollowModalType("followers"); setFollowModalOpen(true); }}
                style={{ cursor: "pointer" }}
              >
                <span className={styles.statNumber}>{profileUser.followers?.length || 0}</span>
                <span className={styles.statLabel}>Followers</span>
              </div>
              <div
                className={styles.statItem}
                onClick={() => { setFollowModalType("following"); setFollowModalOpen(true); }}
                style={{ cursor: "pointer" }}
              >
                <span className={styles.statNumber}>{profileUser.following?.length || 0}</span>
                <span className={styles.statLabel}>Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights Tray */}
        {profileUser && (
          <div className={styles.highlightsTray}>
            {isOwnProfile && (
              <div className={styles.highlightItem} onClick={handleOpenCreateHighlight}>
                <div className={styles.addHighlightCircle}>
                  <span className={styles.plusSign}>+</span>
                </div>
                <span className={styles.highlightTitle}>New</span>
              </div>
            )}
            
            {highlights && highlights.map(hl => (
              <div key={hl._id} className={styles.highlightItem} onClick={() => handleOpenHighlightViewer(hl)}>
                <div className={styles.highlightCircle}>
                  <img 
                    src={getImageUrl(hl.coverImage) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'} 
                    alt={hl.title} 
                    className={styles.highlightCover} 
                  />
                  {isOwnProfile && (
                    <button 
                      className={styles.deleteHighlightBtn} 
                      onClick={(e) => handleDeleteHighlight(hl._id, e)}
                      title="Delete highlight"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className={styles.highlightTitle}>{hl.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Profile Tabs */}
        <div className={styles.profileTabs}>
          <div
            className={`${styles.tab} ${activeTab === 'POSTS' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('POSTS')}
          >
            <FaTh /> Posts
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'REELS' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('REELS')}
          >
            <FaPlayCircle /> Reels
          </div>
          <div
            className={`${styles.tab} ${activeTab === 'TAGGED' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('TAGGED')}
          >
            <FaUserTag /> Tagged
          </div>
          {isOwnProfile && (
            <div
              className={`${styles.tab} ${activeTab === 'SAVED' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('SAVED')}
            >
              <FaRegBookmark /> Saved
            </div>
          )}
        </div>

        {/* Post Grid */}
        <div className={styles.profileGrid}>
          {activeTab === 'SAVED' ? (
            loadingSaved ? (
              <div className={styles.loadingSaved}>Loading saved posts...</div>
            ) : savedPosts.length === 0 ? (
              <div className={styles.emptyState}>
                <FaRegBookmark />
                <h2>No Saved Posts</h2>
                <p>Save posts to see them here</p>
              </div>
            ) : (
              savedPosts.map(post => (
                <div className={styles.gridItem} key={post._id} onClick={() => handlePostClick(post._id)}>
                  {post.image ? (
                    <img src={getImageUrl(post.image)} alt="post" />
                  ) : (
                    <div className={styles.textPostPreview}>
                      <p>{post.caption}</p>
                    </div>
                  )}
                  <div className={styles.gridOverlay}>
                    <span>❤️ {post.likes?.length || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                  </div>
                </div>
              ))
            )
          ) : userPosts.length === 0 ? (
            <div className={styles.emptyState}>
              <FaTh />
              <h2>No Posts Yet</h2>
              <p>Share your first photo or video</p>
            </div>
          ) : (
            userPosts.map(post => (
              <div className={styles.gridItem} key={post._id} onClick={() => handlePostClick(post._id)}>
                {post.image ? (
                  <img src={getImageUrl(post.image)} alt="post" />
                ) : (
                  <div className={styles.textPostPreview}>
                    <p>{post.caption}</p>
                  </div>
                )}
                <div className={styles.gridOverlay}>
                  <span>❤️ {post.likes?.length || 0}</span>
                  <span>💬 {post.comments?.length || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ===== EDIT PROFILE MODAL ===== */}
      {showEdit && (
        <div className={styles.modalOverlay} onClick={() => setShowEdit(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Profile</h3>
              <button className={styles.closeBtn} onClick={() => setShowEdit(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.avatarEditWrap}>
                <img src={getImageUrl(avatarPreview)} alt="avatar preview" className={styles.avatarPreview} />
                <button className={styles.changeAvatarBtn} onClick={() => fileInputRef.current?.click()}>
                  Change Profile Photo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Bio</label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Write something about yourself..."
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SETTINGS MODAL ===== */}
      {showSettings && (
        <div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Settings</h3>
              <button className={styles.closeBtn} onClick={() => setShowSettings(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.settingsList}>
                <button className={styles.settingsItem}>
                  <FaLock /> Change Password
                </button>
                <button className={styles.settingsItem}>
                  <FaShieldAlt /> Privacy and Security
                </button>
                <button className={styles.settingsItem}>
                  <FaBell /> Notifications
                </button>
                <button
                  className={`${styles.settingsItem} ${styles.logoutText}`}
                  onClick={logout}
                >
                  <FaSignOutAlt /> Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <FollowListModal
        isOpen={followModalOpen}
        onClose={() => setFollowModalOpen(false)}
        userId={profileUser?._id}
        type={followModalType}
        onUpdate={handleFollowModalUpdate}
      />
      <PostDetailModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        postId={selectedPostId}
        onUpdate={handleFollowModalUpdate}
      />

      {/* ===== CREATE HIGHLIGHT MODAL ===== */}
      {showCreateHighlight && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateHighlight(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h3>Create Story Highlight</h3>
              <button className={styles.closeBtn} onClick={() => setShowCreateHighlight(false)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="Highlight Title (e.g. Vacation)"
                  value={highlightTitle}
                  onChange={e => setHighlightTitle(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: 'var(--neo-shadow-inset)',
                    background: 'var(--neo-bg)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  maxLength={30}
                />

                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Select Stories to include:
                </span>

                {userStories.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
                    No active stories found. Post a story first!
                  </p>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    padding: '6px'
                  }}>
                    {userStories.map(story => {
                      const isSelected = selectedStoryIds.includes(story._id);
                      return (
                        <div
                          key={story._id}
                          onClick={() => {
                            setSelectedStoryIds(prev =>
                              isSelected ? prev.filter(id => id !== story._id) : [...prev, story._id]
                            );
                          }}
                          style={{
                            position: 'relative',
                            aspectRatio: '9/16',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 0 0 3px var(--primary)' : 'var(--neo-shadow-sm)',
                            transition: 'var(--transition-fast)'
                          }}
                        >
                          <img
                            src={getImageUrl(story.mediaUrl) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {story.caption && (
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px',
                              padding: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'
                            }}>
                              {story.caption}
                            </div>
                          )}
                          <div style={{
                            position: 'absolute', top: '8px', right: '8px',
                            width: '18px', height: '18px', borderRadius: '50%',
                            background: isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.3)',
                            border: '1.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '10px', fontWeight: 'bold'
                          }}>
                            {isSelected ? '✓' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={handleCreateHighlightSubmit}
                  disabled={creatingHighlight || !highlightTitle.trim() || selectedStoryIds.length === 0}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--gradient-primary)',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: 'var(--neo-shadow-sm)',
                    transition: 'var(--transition-fast)',
                    opacity: (creatingHighlight || !highlightTitle.trim() || selectedStoryIds.length === 0) ? 0.6 : 1
                  }}
                >
                  {creatingHighlight ? 'Creating...' : 'Create Highlight'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== HIGHLIGHT STORY VIEWER ===== */}
      {viewingHighlight && viewingHighlight.stories && viewingHighlight.stories.length > 0 && (
        <div 
          className={styles.modalOverlay} 
          onClick={() => { setViewingHighlight(null); setStoryProgress(0); }}
          style={{ background: 'rgba(0,0,0,0.9)', zIndex: 1000 }}
        >
          <div 
            className={styles.storyViewerBox} 
            onClick={e => e.stopPropagation()}
          >
            {/* Progress Bars */}
            <div className={styles.storyProgressHeader}>
              {viewingHighlight.stories.map((_, i) => (
                <div key={i} className={styles.storyProgressBar}>
                  <div 
                    className={styles.storyProgressFill}
                    style={{
                      width: i < viewingStoryIndex ? '100%' :
                             i === viewingStoryIndex ? `${storyProgress}%` : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Viewer Header */}
            <div className={styles.storyViewerHeader}>
              <div className={styles.storyViewerUser}>
                <img 
                  src={getImageUrl(profileUser?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                  alt="" 
                  className={styles.storyViewerAvatar} 
                />
                <div>
                  <span className={styles.storyViewerName}>
                    {viewingHighlight.title}
                  </span>
                  <span className={styles.storyViewerTime}>
                    {new Date(viewingHighlight.stories[viewingStoryIndex].createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button 
                className={styles.storyCloseBtn} 
                onClick={() => { setViewingHighlight(null); setStoryProgress(0); }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Content (Image or Video) */}
            <div className={styles.storyViewerBody}>
              <img 
                src={getImageUrl(viewingHighlight.stories[viewingStoryIndex].mediaUrl)} 
                alt="highlight story" 
                className={styles.storyViewerMedia} 
              />
              {viewingHighlight.stories[viewingStoryIndex].caption && (
                <div className={styles.storyViewerCaption}>
                  {viewingHighlight.stories[viewingStoryIndex].caption}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            {viewingStoryIndex > 0 && (
              <button 
                className={`${styles.storyViewerNav} ${styles.storyViewerPrev}`}
                onClick={handlePrevHighlightStory}
              >
                ‹
              </button>
            )}
            <button 
              className={`${styles.storyViewerNav} ${styles.storyViewerNext}`}
              onClick={handleNextHighlightStory}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
