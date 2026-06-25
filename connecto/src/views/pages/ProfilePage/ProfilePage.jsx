/**
 * ProfilePage Component (View Layer)
 * User profile with posts grid, stats, and edit functionality
 */

import React from 'react';
import { 
  FaCheckCircle, FaMapMarkerAlt, FaLink, FaEdit, FaUserPlus, FaUserCheck, 
  FaThLarge, FaPlayCircle, FaUserTag, FaCog, FaLock, FaShieldAlt, FaBell, 
  FaSignOutAlt, FaInfoCircle, FaPalette, FaUser, FaBan, FaSlidersH, FaRegBookmark, FaTimes, FaCamera,
  FaPhone, FaVideo, FaCommentDots
} from 'react-icons/fa';
import { useProfileViewModel } from '../../../viewmodels/profile/useProfileViewModel';
import Avatar from '../../components/common/Avatar/Avatar';
import Button from '../../components/common/Button/Button';
import { getImageUrl } from '../../../services/utils/imageUtils';
import styles from './ProfilePage.module.css';

const MOCK_USERS_DB = [
  { _id: 'u1', username: 'sarah_cruz', fullName: 'Sarah Cruz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { _id: 'u2', username: 'john_doe', fullName: 'John Anderson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { _id: 'u3', username: 'emma_wilson', fullName: 'Emma Wilson', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
  { _id: 'u4', username: 'chris_harris', fullName: 'Chris Harris', avatar: 'https://randomuser.me/api/portraits/men/76.jpg' },
  { _id: 'u5', username: 'nora_james', fullName: 'Nora James', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { _id: 's1', username: 'olivia_page', fullName: 'Olivia Page', avatar: 'https://randomuser.me/api/portraits/women/50.jpg' },
  { _id: 's2', username: 'alex_smith', fullName: 'Alex Smith', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { _id: 's3', username: 'diana_amber', fullName: 'Diana Amber', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' }
];

const ProfilePage = () => {
  const {
    profile, posts, currentUser,
    loading, postsLoading, error,
    activeTab, isOwnProfile, isFollowing,
    reels, reelsLoading, savedPosts, savedReels, savedLoading,
    showEditModal, showFollowersModal, showFollowingModal,
    showSettings, setShowSettings,
    settingsTab, setSettingsTab,
    passwordForm, setPasswordForm,
    notificationForm, setNotificationForm,
    privacyForm, setPrivacyForm,
    appearanceForm, setAppearanceForm,
    personalDetailsForm, setPersonalDetailsForm,
    metaSyncForm, setMetaSyncForm,
    mediaQualityForm, setMediaQualityForm,
    supportForm, setSupportForm,
    passwordSaving, passwordSuccess, passwordError,
    supportSuccess, settingsSaving, settingsSuccess, settingsError,
    handlePasswordChange, handleSettingsSave, handleSupportSubmit, handleToggleBlock,
    editForm, editSubmitting, editError,
    followerCount, followingCount, postCount,
    setActiveTab, toggleFollow,
    setShowEditModal, setShowFollowersModal, setShowFollowingModal,
    handleEditChange, handleEditSubmit, logout, token,
    avatarPreview, setAvatarPreview,
    handleCoverChange, setAvatarFile, navigate
  } = useProfileViewModel();

  const [blockedSearchQuery, setBlockedSearchQuery] = React.useState('');
  const [blockedSearchResults, setBlockedSearchResults] = React.useState([]);
  const [savedSubTab, setSavedSubTab] = React.useState('posts');
  const [isFollowHovered, setIsFollowHovered] = React.useState(false);
  const isBlocked = privacyForm?.blockedUsers?.some(u => (u._id || u) === profile?._id);

  const coverFileInputRef = React.useRef(null);
  const avatarFileInputRef = React.useRef(null);

  const handleAvatarClick = () => {
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Followers and Following list states
  const [followersList, setFollowersList] = React.useState([]);
  const [followingList, setFollowingList] = React.useState([]);
  const [listLoading, setListLoading] = React.useState(false);

  React.useEffect(() => {
    if (showFollowersModal && profile?._id) {
      const isReal = Boolean(token);
      if (!isReal) {
        const mockFollowers = (profile.followers || []).map(f => {
          const id = f._id || f;
          return MOCK_USERS_DB.find(u => u._id === id) || { _id: id, username: 'user_' + id, fullName: 'Follower Account', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' };
        });
        setFollowersList(mockFollowers);
        return;
      }

      setListLoading(true);
      fetch(`/api/users/${profile._id}/followers`, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
      })
        .then(res => res.json())
        .then(data => {
          setFollowersList(Array.isArray(data) ? data : []);
          setListLoading(false);
        })
        .catch(() => setListLoading(false));
    }
  }, [showFollowersModal, profile, token]);

  React.useEffect(() => {
    if (showFollowingModal && profile?._id) {
      const isReal = Boolean(token);
      if (!isReal) {
        const mockFollowing = (profile.following || []).map(f => {
          const id = f._id || f;
          return MOCK_USERS_DB.find(u => u._id === id) || { _id: id, username: 'user_' + id, fullName: 'Following Account', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' };
        });
        setFollowingList(mockFollowing);
        return;
      }

      setListLoading(true);
      fetch(`/api/users/${profile._id}/following`, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
      })
        .then(res => res.json())
        .then(data => {
          setFollowingList(Array.isArray(data) ? data : []);
          setListLoading(false);
        })
        .catch(() => setListLoading(false));
    }
  }, [showFollowingModal, profile, token]);

  const handleBlockedSearch = async (e) => {
    const q = e.target.value;
    setBlockedSearchQuery(q);
    if (!q.trim()) {
      setBlockedSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${q}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const users = await res.json();
        const blockedIds = (privacyForm.blockedUsers || []).map(u => u._id || u);
        setBlockedSearchResults(
          users.filter(u => u._id !== currentUser?._id && !blockedIds.includes(u._id))
        );
      }
    } catch (err) {
      console.error('Failed to search users for blocking:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner} />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      {showSettings ? (
        /* Render settings inline as a sub-page with low/subtle shadow */
        <div style={{
          background: 'var(--neo-surface, #e0e0e0)',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '600px',
          color: 'var(--text-primary)'
        }}>
          {/* Settings Sub-Page Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button 
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Back to Profile
              </button>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Settings</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {settingsSuccess && (
                <span style={{ color: '#06d6a0', fontSize: '0.9rem', fontWeight: '600', background: 'rgba(6, 214, 160, 0.08)', padding: '4px 10px', borderRadius: '4px' }}>
                  {settingsSuccess}
                </span>
              )}
              {settingsError && (
                <span style={{ color: '#ef476f', fontSize: '0.9rem', fontWeight: '600', background: 'rgba(239, 71, 111, 0.08)', padding: '4px 10px', borderRadius: '4px' }}>
                  {settingsError}
                </span>
              )}
            </div>
          </div>

          {/* Settings Content Split View */}
          <div style={{ display: 'flex', flex: 1, gap: '20px' }}>
            {/* Sidebar Navigation */}
            <div style={{
              width: '240px',
              borderRight: '1px solid rgba(0,0,0,0.06)',
              paddingRight: '15px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {[
                { id: 'meta', label: 'Account Center (Meta)', icon: <FaUser /> },
                { id: 'password', label: 'Password & Security', icon: <FaLock /> },
                { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
                { id: 'privacy', label: 'Privacy & Safety', icon: <FaShieldAlt /> },
                { id: 'blocked', label: 'Blocked Accounts', icon: <FaBan /> },
                { id: 'appearance', label: 'Theme & Appearance', icon: <FaPalette /> },
                { id: 'media', label: 'Media & Quality', icon: <FaSlidersH /> },
                { id: 'support', label: 'Help & Support', icon: <FaInfoCircle /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSettingsTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 14px',
                    background: settingsTab === item.id ? 'var(--primary, #6b24b3)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: settingsTab === item.id ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (settingsTab !== item.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (settingsTab !== item.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}

              <div style={{ flex: 1 }} />

              <button
                onClick={() => {
                  setShowSettings(false);
                  logout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(239, 71, 111, 0.04)',
                  border: '1px solid rgba(239, 71, 111, 0.12)',
                  borderRadius: '6px',
                  color: '#ff4d4d',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontWeight: 'bold'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 71, 111, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 71, 111, 0.04)'}
              >
                <FaSignOutAlt />
                <span>Log Out</span>
              </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, paddingLeft: '15px' }}>
              
              {/* TAB 1: META ACCOUNT CENTER */}
              {settingsTab === 'meta' && (
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Meta Account Center</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                    Manage synced Facebook/Instagram profiles and personal details.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
                    {/* Sync Section */}
                    <div style={{ border: '1px solid rgba(0,0,0,0.06)', padding: '16px', borderRadius: '8px', background: 'rgba(0,0,0,0.02)' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>Connected Experiences</h4>
                      
                      {/* Instagram */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>Instagram</p>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {metaSyncForm.instagramSynced ? `Synced as @${metaSyncForm.instagramUsername}` : 'Sync profile content & stories'}
                          </span>
                        </div>
                        {metaSyncForm.instagramSynced ? (
                          <button 
                            onClick={() => {
                              const updated = { instagramSynced: false, instagramUsername: '' };
                              setMetaSyncForm(prev => ({ ...prev, ...updated }));
                              handleSettingsSave('metaSync', { ...metaSyncForm, ...updated });
                            }}
                            style={{ padding: '6px 12px', border: '1px solid #ef476f', background: 'transparent', color: '#ef476f', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Disconnect
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              placeholder="Username" 
                              value={metaSyncForm.instagramUsername}
                              onChange={e => setMetaSyncForm(prev => ({ ...prev, instagramUsername: e.target.value }))}
                              style={{ padding: '4px 8px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', fontSize: '0.8rem', width: '120px' }}
                            />
                            <button 
                              onClick={() => {
                                if (metaSyncForm.instagramUsername.trim()) {
                                  const updated = { instagramSynced: true };
                                  setMetaSyncForm(prev => ({ ...prev, ...updated }));
                                  handleSettingsSave('metaSync', { ...metaSyncForm, ...updated });
                                }
                              }}
                              style={{ padding: '6px 12px', background: 'var(--primary, #6b24b3)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Link
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Facebook */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>Facebook</p>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {metaSyncForm.facebookSynced ? `Connected as ${metaSyncForm.facebookUsername}` : 'Connect account login & sharing'}
                          </span>
                        </div>
                        {metaSyncForm.facebookSynced ? (
                          <button 
                            onClick={() => {
                              const updated = { facebookSynced: false, facebookUsername: '' };
                              setMetaSyncForm(prev => ({ ...prev, ...updated }));
                              handleSettingsSave('metaSync', { ...metaSyncForm, ...updated });
                            }}
                            style={{ padding: '6px 12px', border: '1px solid #ef476f', background: 'transparent', color: '#ef476f', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Disconnect
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              placeholder="Profile Name" 
                              value={metaSyncForm.facebookUsername}
                              onChange={e => setMetaSyncForm(prev => ({ ...prev, facebookUsername: e.target.value }))}
                              style={{ padding: '4px 8px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', fontSize: '0.8rem', width: '120px' }}
                            />
                            <button 
                              onClick={() => {
                                if (metaSyncForm.facebookUsername.trim()) {
                                  const updated = { facebookSynced: true };
                                  setMetaSyncForm(prev => ({ ...prev, ...updated }));
                                  handleSettingsSave('metaSync', { ...metaSyncForm, ...updated });
                                }
                              }}
                              style={{ padding: '6px 12px', background: 'var(--primary, #6b24b3)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personal Details Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: '0', fontSize: '0.95rem', fontWeight: 'bold' }}>Personal Details</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Phone Number</label>
                        <input 
                          type="tel"
                          value={personalDetailsForm.phoneNumber}
                          onChange={e => setPersonalDetailsForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                          placeholder="+1 234 567 8900"
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Gender</label>
                        <select 
                          value={personalDetailsForm.gender}
                          onChange={e => setPersonalDetailsForm(prev => ({ ...prev, gender: e.target.value }))}
                          style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', background: 'transparent' }}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="custom">Custom</option>
                          <option value="unspecified">Prefer not to say</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Date of Birth</label>
                        <input 
                          type="date"
                          value={personalDetailsForm.birthday}
                          onChange={e => setPersonalDetailsForm(prev => ({ ...prev, birthday: e.target.value }))}
                          style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                        />
                      </div>

                      <button
                        onClick={() => handleSettingsSave('personalDetails', personalDetailsForm)}
                        disabled={settingsSaving}
                        style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '10px 20px', background: 'var(--primary, #6b24b3)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                      >
                        {settingsSaving ? 'Saving...' : 'Save Personal Details'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PASSWORD & SECURITY */}
              {settingsTab === 'password' && (
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Change Password</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                    Choose a strong password containing at least 6 characters.
                  </p>
                  
                  {passwordError && (
                    <div style={{ padding: '10px 15px', background: 'rgba(239, 71, 111, 0.08)', border: '1px solid rgba(239, 71, 111, 0.2)', color: '#ef476f', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div style={{ padding: '10px 15px', background: 'rgba(6, 214, 160, 0.08)', border: '1px solid rgba(6, 214, 160, 0.2)', color: '#06d6a0', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>
                      {passwordSuccess}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Current Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>New Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Confirm New Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={passwordSaving}
                      style={{ marginTop: '10px', alignSelf: 'flex-start', padding: '10px 20px', background: 'var(--primary, #6b24b3)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {passwordSaving ? 'Saving...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: NOTIFICATIONS */}
              {settingsTab === 'notifications' && (
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Notification Preferences</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                    Choose what notifications you want to receive.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Pause All</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Temporarily pause all notifications</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notificationForm.pauseAll}
                        onChange={e => setNotificationForm(prev => ({ ...prev, pauseAll: e.target.checked }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>Likes</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {[
                          { value: 'off', label: 'Off' },
                          { value: 'follow', label: 'From people I follow' },
                          { value: 'everyone', label: 'From everyone' }
                        ].map(opt => (
                          <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input 
                              type="radio" 
                              name="likes" 
                              value={opt.value}
                              checked={notificationForm.likes === opt.value}
                              onChange={e => setNotificationForm(prev => ({ ...prev, likes: e.target.value }))}
                              disabled={notificationForm.pauseAll}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem' }}>Comments</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {[
                          { value: 'off', label: 'Off' },
                          { value: 'follow', label: 'From people I follow' },
                          { value: 'everyone', label: 'From everyone' }
                        ].map(opt => (
                          <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input 
                              type="radio" 
                              name="comments" 
                              value={opt.value}
                              checked={notificationForm.comments === opt.value}
                              onChange={e => setNotificationForm(prev => ({ ...prev, comments: e.target.value }))}
                              disabled={notificationForm.pauseAll}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>New Followers</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notify when someone follows you</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notificationForm.followers}
                        onChange={e => setNotificationForm(prev => ({ ...prev, followers: e.target.checked }))}
                        disabled={notificationForm.pauseAll}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Direct Messages</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notify on incoming chat messages</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notificationForm.messages}
                        onChange={e => setNotificationForm(prev => ({ ...prev, messages: e.target.checked }))}
                        disabled={notificationForm.pauseAll}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Stories & Reels</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notify on stories interactions</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={notificationForm.stories}
                        onChange={e => setNotificationForm(prev => ({ ...prev, stories: e.target.checked, reels: e.target.checked }))}
                        disabled={notificationForm.pauseAll}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <button
                      onClick={() => handleSettingsSave('notificationSettings', notificationForm)}
                      disabled={settingsSaving}
                      style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '10px 20px', background: 'var(--primary, #6b24b3)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {settingsSaving ? 'Saving...' : 'Save Notification Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: PRIVACY & SAFETY */}
              {settingsTab === 'privacy' && (
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Privacy Settings</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                    Control your visibility and accessibility options.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Private Account</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Only approved followers can view your feed and media</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={privacyForm.privateAccount}
                        onChange={e => setPrivacyForm(prev => ({ ...prev, privateAccount: e.target.checked }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Show Active Status</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Show other accounts when you were last online</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={privacyForm.activityStatus}
                        onChange={e => setPrivacyForm(prev => ({ ...prev, activityStatus: e.target.checked }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Hide Likes Count</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Do not display like counts on your posts to others</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={privacyForm.hideLikes}
                        onChange={e => setPrivacyForm(prev => ({ ...prev, hideLikes: e.target.checked }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <button
                      onClick={() => handleSettingsSave('privacySettings', privacyForm)}
                      disabled={settingsSaving}
                      style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '10px 20px', background: 'var(--primary, #6b24b3)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {settingsSaving ? 'Saving...' : 'Save Privacy Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: BLOCKED ACCOUNTS */}
              {settingsTab === 'blocked' && (
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Blocked Accounts</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                    Block users to prevent them from searching your profile or messaging you.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                    
                    {/* Block search box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Search and block user</label>
                      <input 
                        type="text"
                        placeholder="Search by username or name..."
                        value={blockedSearchQuery}
                        onChange={handleBlockedSearch}
                        style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                      />

                      {/* Search Results */}
                      {blockedSearchResults.length > 0 && (
                        <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px', overflow: 'hidden', background: 'var(--neo-surface)', maxHeight: '160px', overflowY: 'auto', marginTop: '5px' }}>
                          {blockedSearchResults.map(user => (
                            <div key={user._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Avatar src={user.avatar} size="sm" />
                                <div>
                                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>@{user.username}</p>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.fullName}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  handleToggleBlock(user._id);
                                  setBlockedSearchQuery('');
                                  setBlockedSearchResults([]);
                                }}
                                style={{ padding: '4px 10px', background: '#ef476f', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                Block
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Blocked Accounts List */}
                    <div>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>Currently Blocked</h4>
                      {(!privacyForm.blockedUsers || privacyForm.blockedUsers.length === 0) ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>No blocked users.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {privacyForm.blockedUsers.map(user => (
                            <div key={user._id || user} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '6px', background: 'rgba(0,0,0,0.01)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Avatar src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} size="sm" />
                                <div>
                                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>@{user.username || 'user'}</p>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.fullName || 'Blocked User'}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleToggleBlock(user._id || user)}
                                style={{ padding: '5px 10px', border: '1px solid rgba(0,0,0,0.15)', background: 'transparent', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                Unblock
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 6: THEME & APPEARANCE */}
              {settingsTab === 'appearance' && (
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Theme & Appearance</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                    Personalize your interface and neomorphic configurations.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Application Theme</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {[
                          { id: 'dark', label: 'Dark Mode', bg: '#121212', text: '#fff' },
                          { id: 'light', label: 'Light Mode', bg: '#f5f5f7', text: '#333' },
                          { id: 'neo', label: 'Neomorphic', bg: '#e0e0e0', text: '#333' }
                        ].map(themeOpt => (
                          <button
                            key={themeOpt.id}
                            type="button"
                            onClick={() => {
                              setAppearanceForm(prev => ({ ...prev, theme: themeOpt.id }));
                              document.documentElement.setAttribute('data-theme', themeOpt.id);
                            }}
                            style={{
                              padding: '12px',
                              background: themeOpt.bg,
                              border: appearanceForm.theme === themeOpt.id ? '2px solid var(--primary, #6b24b3)' : '1px solid rgba(0,0,0,0.1)',
                              borderRadius: '6px',
                              color: themeOpt.text,
                              fontWeight: '600',
                              cursor: 'pointer',
                              textAlign: 'center',
                              fontSize: '0.85rem'
                            }}
                          >
                            {themeOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Font Size</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.75rem' }}>A</span>
                        <input 
                          type="range" 
                          min="12" 
                          max="22" 
                          value={appearanceForm.fontSize}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            setAppearanceForm(prev => ({ ...prev, fontSize: val }));
                            document.documentElement.style.fontSize = `${val}px`;
                          }}
                          style={{ flex: 1, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>A</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current size: {appearanceForm.fontSize}px</span>
                    </div>

                    <button
                      onClick={() => handleSettingsSave('themeSettings', appearanceForm)}
                      disabled={settingsSaving}
                      style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '10px 20px', background: 'var(--primary, #6b24b3)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {settingsSaving ? 'Saving...' : 'Save Theme Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 7: MEDIA & QUALITY */}
              {settingsTab === 'media' && (
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Media Preferences</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                    Adjust upload quality and data usage.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Upload in High Quality</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Always upload high-definition images and videos</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={mediaQualityForm.highQualityUploads}
                        onChange={e => setMediaQualityForm(prev => ({ ...prev, highQualityUploads: e.target.checked }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Data Saver Mode</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reduce data consumption by lowering image resolutions in feed</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={mediaQualityForm.dataSaver}
                        onChange={e => setMediaQualityForm(prev => ({ ...prev, dataSaver: e.target.checked }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </div>

                    <button
                      onClick={() => handleSettingsSave('mediaQuality', mediaQualityForm)}
                      disabled={settingsSaving}
                      style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '10px 20px', background: 'var(--primary, #6b24b3)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {settingsSaving ? 'Saving...' : 'Save Media Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 8: HELP & SUPPORT */}
              {settingsTab === 'support' && (
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Help & Support</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
                    Reach out to support or report system bugs.
                  </p>

                  {supportSuccess && (
                    <div style={{ padding: '10px 15px', background: 'rgba(6, 214, 160, 0.08)', border: '1px solid rgba(6, 214, 160, 0.2)', color: '#06d6a0', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>
                      {supportSuccess}
                    </div>
                  )}

                  <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Issue Type</label>
                      <select 
                        value={supportForm.type}
                        onChange={e => setSupportForm(prev => ({ ...prev, type: e.target.value }))}
                        style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', background: 'transparent' }}
                      >
                        <option value="bug">Report a Bug</option>
                        <option value="account">Account Access Issue</option>
                        <option value="abuse">Spam or Abuse</option>
                        <option value="suggestion">Suggestion / Feedback</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Details</label>
                      <textarea 
                        rows="4"
                        value={supportForm.details}
                        onChange={e => setSupportForm(prev => ({ ...prev, details: e.target.value }))}
                        placeholder="Describe the issue in detail..."
                        style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      style={{ alignSelf: 'flex-start', padding: '10px 20px', background: 'var(--primary, #6b24b3)', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Submit Report
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cover Photo */}
          <div className={styles.coverPhoto}>
            {profile?.coverPhoto ? (
              <img src={getImageUrl(profile.coverPhoto)} alt="cover" className={styles.coverImg} />
            ) : (
              <div className={styles.coverPlaceholder} />
            )}
            {isOwnProfile && (
              <>
                <button 
                  onClick={() => coverFileInputRef.current?.click()} 
                  className={styles.changeCoverBtn}
                  title="Change Cover Photo"
                >
                  <FaCamera /> Change Cover
                </button>
                <input 
                  type="file" 
                  ref={coverFileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverChange(file);
                  }} 
                  accept="image/*"
                />
              </>
            )}
          </div>

          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarWrapper}>
              <Avatar
                src={profile?.avatar}
                alt={profile?.fullName}
                size="3xl"
                isVerified={profile?.isVerified}
              />
            </div>

            <div className={styles.profileInfo}>
              <div className={styles.profileNameRow}>
                <h1 className={styles.profileName}>
                  {profile?.fullName}
                  {profile?.isVerified && <FaCheckCircle className={styles.verifiedBadge} />}
                </h1>
                <span className={styles.profileUsername}>@{profile?.username}</span>
              </div>

              {profile?.bio && <p className={styles.profileBio}>{profile.bio}</p>}

              <div className={styles.profileMeta}>
                {profile?.location && (
                  <span className={styles.metaItem}>
                    <FaMapMarkerAlt /> {profile.location}
                  </span>
                )}
                {profile?.website && (
                  <a href={profile.website} className={styles.metaItem} target="_blank" rel="noopener noreferrer">
                    <FaLink /> {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className={styles.profileStats}>
                <div className={styles.stat}>
                  <strong>{postCount}</strong>
                  <span>Posts</span>
                </div>
                <button className={styles.stat} onClick={() => setShowFollowersModal(true)}>
                  <strong>{followerCount}</strong>
                  <span>Followers</span>
                </button>
                <button className={styles.stat} onClick={() => setShowFollowingModal(true)}>
                  <strong>{followingCount}</strong>
                  <span>Following</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className={styles.profileActions}>
                {isOwnProfile ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Button
                      variant="default"
                      icon={<FaEdit />}
                      onClick={() => setShowEditModal(true)}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="ghost"
                      icon={<FaCommentDots />}
                      onClick={() => navigate('/chat')}
                    >
                      Messages
                    </Button>
                    <button
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-primary, #ffffff)',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s, border-color 0.2s',
                      }}
                      onClick={() => setShowSettings(true)}
                      title="Settings"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <FaCog />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {isBlocked ? (
                      <Button
                        variant="danger"
                        icon={<FaBan />}
                        onClick={() => handleToggleBlock(profile?._id)}
                      >
                        Unblock
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant={isFollowing ? 'ghost' : 'primary'}
                          icon={isFollowing ? (isFollowHovered ? <FaTimes /> : <FaUserCheck />) : <FaUserPlus />}
                          onClick={toggleFollow}
                          onMouseEnter={() => setIsFollowHovered(true)}
                          onMouseLeave={() => setIsFollowHovered(false)}
                        >
                          {isFollowing ? (isFollowHovered ? 'Unfollow' : 'Following') : 'Follow'}
                        </Button>
                        <Button
                          variant="ghost"
                          icon={<FaCommentDots />}
                          onClick={() => navigate(`/chat?userId=${profile?._id}`)}
                        >
                          Message
                        </Button>
                        <Button
                          variant="ghost"
                          icon={<FaPhone />}
                          onClick={() => navigate(`/chat?userId=${profile?._id}&startCall=audio`)}
                          title="Audio Call"
                          style={{ padding: '10px 12px' }}
                        />
                        <Button
                          variant="ghost"
                          icon={<FaVideo />}
                          onClick={() => navigate(`/chat?userId=${profile?._id}&startCall=video`)}
                          title="Video Call"
                          style={{ padding: '10px 12px' }}
                        />
                        <Button
                          style={{
                            background: 'rgba(239, 71, 111, 0.1)',
                            border: '1px solid rgba(239, 71, 111, 0.2)',
                            color: '#ef476f',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef476f';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 71, 111, 0.1)';
                            e.currentTarget.style.color = '#ef476f';
                          }}
                          onClick={() => handleToggleBlock(profile?._id)}
                        >
                          <FaBan /> Block
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            {[
              { id: 'posts', icon: <FaThLarge />, label: 'Posts' },
              { id: 'reels', icon: <FaPlayCircle />, label: 'Reels' },
              ...(isOwnProfile ? [{ id: 'saved', icon: <FaRegBookmark />, label: 'Saved' }] : []),
              { id: 'tagged', icon: <FaUserTag />, label: 'Tagged' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Grid Renderings */}
          {activeTab === 'posts' && (
            <div className={styles.postsGrid}>
              {postsLoading ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={styles.postSkeleton} />
                ))
              ) : posts.length === 0 ? (
                <div className={styles.emptyPosts}>
                  <p>No posts yet</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post._id} className={styles.postGridItem}>
                    {post.image ? (
                      <img src={getImageUrl(post.image)} alt="post" className={styles.postGridImg} loading="lazy" />
                    ) : (
                      <div className={post.caption ? styles.postGridText : styles.postGridImg} style={post.caption ? {} : {background: '#333'}}>
                        <p>{post.caption || ''}</p>
                      </div>
                    )}
                    <div className={styles.postGridOverlay}>
                      <span>❤️ {post.likes?.length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'reels' && (
            <div className={styles.postsGrid}>
              {reelsLoading ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={styles.postSkeleton} />
                ))
              ) : reels.length === 0 ? (
                <div className={styles.emptyPosts}>
                  <p>No reels yet</p>
                </div>
              ) : (
                reels.map(reel => (
                  <div key={reel._id} className={styles.postGridItem}>
                    {reel.thumbnail ? (
                      <img src={getImageUrl(reel.thumbnail)} alt="reel" className={styles.postGridImg} loading="lazy" />
                    ) : (
                      <div className={styles.postGridImg} style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
                        <FaPlayCircle size={40} />
                      </div>
                    )}
                    <div className={styles.postGridOverlay}>
                      <span>❤️ {reel.likes?.length || 0}</span>
                      <span>💬 {reel.comments?.length || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', justifyContent: 'center' }}>
                <button
                  onClick={() => setSavedSubTab('posts')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: savedSubTab === 'posts' ? 'var(--primary, #6b24b3)' : 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Saved Posts
                </button>
                <button
                  onClick={() => setSavedSubTab('reels')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: savedSubTab === 'reels' ? 'var(--primary, #6b24b3)' : 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Saved Reels
                </button>
              </div>

              {savedSubTab === 'posts' ? (
                <div className={styles.postsGrid}>
                  {savedLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={styles.postSkeleton} />
                    ))
                  ) : savedPosts.length === 0 ? (
                    <div className={styles.emptyPosts}>
                      <p>No saved posts</p>
                    </div>
                  ) : (
                    savedPosts.map(post => (
                      <div key={post._id} className={styles.postGridItem}>
                        {post.image ? (
                          <img src={getImageUrl(post.image)} alt="post" className={styles.postGridImg} loading="lazy" />
                        ) : (
                          <div className={post.caption ? styles.postGridText : styles.postGridImg} style={post.caption ? {} : {background: '#333'}}>
                            <p>{post.caption || ''}</p>
                          </div>
                        )}
                        <div className={styles.postGridOverlay}>
                          <span>❤️ {post.likes?.length || 0}</span>
                          <span>💬 {post.comments?.length || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className={styles.postsGrid}>
                  {savedLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={styles.postSkeleton} />
                    ))
                  ) : savedReels.length === 0 ? (
                    <div className={styles.emptyPosts}>
                      <p>No saved reels</p>
                    </div>
                  ) : (
                    savedReels.map(reel => (
                      <div key={reel._id} className={styles.postGridItem}>
                        {reel.thumbnail ? (
                          <img src={getImageUrl(reel.thumbnail)} alt="reel" className={styles.postGridImg} loading="lazy" />
                        ) : (
                          <div className={styles.postGridImg} style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
                            <FaPlayCircle size={40} />
                          </div>
                        )}
                        <div className={styles.postGridOverlay}>
                          <span>❤️ {reel.likes?.length || 0}</span>
                          <span>💬 {reel.comments?.length || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tagged' && (
            <div className={styles.emptyPosts}>
              <p>No tagged posts yet</p>
            </div>
          )}
        </>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Profile</h2>
              <button className={styles.modalClose} onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            {editError && <div className={styles.editError}>{editError}</div>}

            <div className={styles.editForm}>
              <div className={styles.editAvatarSection}>
                <div className={styles.editAvatarWrap} onClick={handleAvatarClick}>
                  <Avatar src={avatarPreview || editForm.avatar} size="xl" />
                  <div className={styles.avatarEditOverlay}>
                    <FaCamera />
                  </div>
                </div>
                <span className={styles.changePhotoText} onClick={handleAvatarClick}>Change Profile Photo</span>
                <input 
                  type="file" 
                  ref={avatarFileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleAvatarFileChange} 
                  accept="image/*"
                />
              </div>

              {[
                { field: 'fullName', label: 'Full Name', type: 'text' },
                { field: 'username', label: 'Username', type: 'text' },
                { field: 'website', label: 'Website', type: 'url' },
                { field: 'location', label: 'Location', type: 'text' },
              ].map(({ field, label, type }) => (
                <div key={field} className={styles.editField}>
                  <label className={styles.editLabel}>{label}</label>
                  <input
                    type={type}
                    className={styles.editInput}
                    value={editForm[field]}
                    onChange={e => handleEditChange(field, e.target.value)}
                    placeholder={label}
                  />
                </div>
              ))}

              <div className={styles.editField}>
                <label className={styles.editLabel}>Bio</label>
                <textarea
                  className={styles.editTextarea}
                  value={editForm.bio}
                  onChange={e => handleEditChange('bio', e.target.value)}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  maxLength={300}
                />
                <span className={styles.charCount}>{editForm.bio.length}/300</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
              <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleEditSubmit} loading={editSubmitting}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFollowersModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Followers</h2>
              <button className={styles.modalClose} onClick={() => setShowFollowersModal(false)}>✕</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '15px' }}>
              {listLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
              ) : followersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No followers yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {followersList.map(u => (
                    <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <Avatar src={u.avatar} size="md" />
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{u.fullName}</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{u.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFollowingModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Following</h2>
              <button className={styles.modalClose} onClick={() => setShowFollowingModal(false)}>✕</button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '15px' }}>
              {listLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
              ) : followingList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Not following anyone yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {followingList.map(u => (
                    <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <Avatar src={u.avatar} size="md" />
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{u.fullName}</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{u.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;