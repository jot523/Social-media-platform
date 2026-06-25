/**
 * Profile ViewModel
 * Manages state and logic for the user profile page
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import { authHeaders, jsonAuthHeaders, isRealToken } from '../../services/utils/authUtils';

export const useProfileViewModel = () => {
  const { user: currentUser, token, updateUser, logout, fetchCurrentUser } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  // New state variables for reels and saved content
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Settings states
  const [settingsTab, setSettingsTab] = useState('password');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [notificationForm, setNotificationForm] = useState({
    pauseAll: false,
    likes: 'everyone',
    comments: 'everyone',
    followers: true,
    messages: true,
    stories: true,
    reels: true,
  });

  const [privacyForm, setPrivacyForm] = useState({
    privateAccount: false,
    activityStatus: true,
    hideLikes: false,
    blockedUsers: [],
  });

  const [appearanceForm, setAppearanceForm] = useState({
    theme: 'neo',
    fontSize: 16,
  });

  const [personalDetailsForm, setPersonalDetailsForm] = useState({
    gender: '',
    birthday: '',
    phoneNumber: '',
  });

  const [metaSyncForm, setMetaSyncForm] = useState({
    instagramSynced: false,
    instagramUsername: '',
    facebookSynced: false,
    facebookUsername: '',
  });

  const [mediaQualityForm, setMediaQualityForm] = useState({
    highQualityUploads: true,
    dataSaver: false,
  });

  const [supportForm, setSupportForm] = useState({
    type: 'bug',
    details: '',
  });
  const [supportSuccess, setSupportSuccess] = useState('');

  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    if (searchParams.get('settings') === 'true') {
      setShowSettings(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('settings');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Synchronize settings from current user once loaded
  useEffect(() => {
    if (currentUser) {
      if (currentUser.notificationSettings) {
        setNotificationForm({
          pauseAll: currentUser.notificationSettings.pauseAll ?? false,
          likes: currentUser.notificationSettings.likes ?? 'everyone',
          comments: currentUser.notificationSettings.comments ?? 'everyone',
          followers: currentUser.notificationSettings.followers ?? true,
          messages: currentUser.notificationSettings.messages ?? true,
          stories: currentUser.notificationSettings.stories ?? true,
          reels: currentUser.notificationSettings.reels ?? true,
        });
      }
      if (currentUser.privacySettings) {
        setPrivacyForm({
          privateAccount: currentUser.privacySettings.privateAccount ?? false,
          activityStatus: currentUser.privacySettings.activityStatus ?? true,
          hideLikes: currentUser.privacySettings.hideLikes ?? false,
          blockedUsers: currentUser.privacySettings.blockedUsers ?? [],
        });
      }
      if (currentUser.themeSettings) {
        setAppearanceForm({
          theme: currentUser.themeSettings.theme ?? 'neo',
          fontSize: currentUser.themeSettings.fontSize ?? 16,
        });
      }
      if (currentUser.personalDetails) {
        setPersonalDetailsForm({
          gender: currentUser.personalDetails.gender ?? '',
          birthday: currentUser.personalDetails.birthday ? new Date(currentUser.personalDetails.birthday).toISOString().split('T')[0] : '',
          phoneNumber: currentUser.personalDetails.phoneNumber ?? '',
        });
      }
      if (currentUser.metaSync) {
        setMetaSyncForm({
          instagramSynced: currentUser.metaSync.instagramSynced ?? false,
          instagramUsername: currentUser.metaSync.instagramUsername ?? '',
          facebookSynced: currentUser.metaSync.facebookSynced ?? false,
          facebookUsername: currentUser.metaSync.facebookUsername ?? '',
        });
      }
    }
  }, [currentUser, showSettings]);

  const [editForm, setEditForm] = useState({
    fullName: '', username: '', bio: '', website: '', location: '', avatar: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const isOwnProfile = !userId || userId === currentUser?._id || userId === currentUser?.username;
  const targetId = userId || currentUser?._id;

  // ── Fetch profile ──────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    setError(null);

    // With a mock token, skip the API and use local user data for own profile
    if (!isRealToken(token) && isOwnProfile) {
      if (currentUser) {
        setProfile(currentUser);
        setEditForm({
          fullName: currentUser.fullName || '',
          username: currentUser.username || '',
          bio: currentUser.bio || '',
          website: currentUser.website || '',
          location: currentUser.location || '',
          avatar: currentUser.avatar || ''
        });
        setAvatarPreview(currentUser.avatar || '');
      }
      setLoading(false);
      return;
    }

    try {
      const endpoint = isOwnProfile ? '/api/users/me' : `/api/users/${targetId}`;
      const res = await fetch(endpoint, { headers: authHeaders(token) });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsFollowing(data.followers?.some(id => id && (id._id || id).toString() === currentUser?._id?.toString()));
        if (isOwnProfile) {
          setEditForm({
            fullName: data.fullName || '',
            username: data.username || '',
            bio: data.bio || '',
            website: data.website || '',
            location: data.location || '',
            avatar: data.avatar || ''
          });
          setAvatarPreview(data.avatar || '');
        }
      } else {
        if (isOwnProfile && currentUser) {
          setProfile(currentUser);
        } else {
          setError('Profile not found');
        }
      }
    } catch {
      if (isOwnProfile && currentUser) {
        setProfile(currentUser);
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, [targetId, isOwnProfile, token, currentUser]);

  // ── Fetch user posts ───────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    if (!targetId) return;
    setPostsLoading(true);
    try {
      const res = await fetch(`/api/users/${targetId}/posts`, {
        headers: authHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || data || []);
      }
    } catch {
      // Keep empty posts
    } finally {
      setPostsLoading(false);
    }
  }, [targetId, token]);

  const fetchReels = useCallback(async () => {
    if (!targetId) return;
    setReelsLoading(true);
    try {
      const res = await fetch(`/api/reels?userId=${targetId}`, {
        headers: authHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setReels(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reels:', err);
    } finally {
      setReelsLoading(false);
    }
  }, [targetId, token]);

  const fetchSavedContent = useCallback(async () => {
    if (!isOwnProfile) return;
    setSavedLoading(true);
    try {
      const postsRes = await fetch('/api/posts/saved', {
        headers: authHeaders(token)
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setSavedPosts(postsData.posts || postsData || []);
      }

      const reelsRes = await fetch('/api/reels/saved', {
        headers: authHeaders(token)
      });
      if (reelsRes.ok) {
        const reelsData = await reelsRes.json();
        setSavedReels(reelsData || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved content:', err);
    } finally {
      setSavedLoading(false);
    }
  }, [isOwnProfile, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'reels') {
      fetchReels();
    } else if (activeTab === 'saved') {
      fetchSavedContent();
    }
  }, [activeTab, targetId, fetchPosts, fetchReels, fetchSavedContent]);

  // ── Follow / Unfollow ──────────────────────────────────────────
  const toggleFollow = useCallback(async () => {
    if (!profile?._id) return;
    const wasFollowing = isFollowing;
    const myId = currentUser?._id?.toString();
    setIsFollowing(!wasFollowing);

    // Optimistic UI update
    setProfile(prev => {
      if (!prev) return prev;
      const followers = prev.followers || [];
      const updatedFollowers = wasFollowing
        ? followers.filter(id => (id._id || id).toString() !== myId)
        : [...followers, currentUser?._id];
      return { ...prev, followers: updatedFollowers };
    });

    try {
      const res = await fetch(`/api/users/${profile._id}/follow`, {
        method: 'PUT',
        headers: authHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => {
          if (!prev) return prev;
          const count = data.targetFollowerCount || 0;
          const followers = prev.followers || [];
          const myId = currentUser?._id?.toString();

          // Filter out current user to avoid duplicates
          const otherFollowers = followers.filter(f => f && (f._id || f).toString() !== myId);

          const newFollowers = [];
          if (data.following) {
            newFollowers.push(currentUser?._id || myId);
          }

          // Fill with existing other followers or placeholders to match count
          let idx = 0;
          while (newFollowers.length < count) {
            const nextFollower = otherFollowers[idx++] || { _id: `placeholder_${newFollowers.length}` };
            newFollowers.push(nextFollower);
          }

          if (newFollowers.length > count) {
            newFollowers.length = count;
          }

          return { ...prev, followers: newFollowers };
        });
        fetchCurrentUser(token);
      }
    } catch {
      // Revert on error
      setIsFollowing(wasFollowing);
      setProfile(prev => {
        if (!prev) return prev;
        const followers = prev.followers || [];
        const revertedFollowers = wasFollowing
          ? [...followers, currentUser?._id]
          : followers.filter(id => (id._id || id).toString() !== myId);
        return { ...prev, followers: revertedFollowers };
      });
    }
  }, [profile, isFollowing, currentUser, token, fetchCurrentUser]);

  // ── Edit profile ───────────────────────────────────────────────
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (editError) setEditError('');
  };

  const handleEditSubmit = async () => {
    if (!editForm.fullName.trim()) { setEditError('Full name is required'); return; }
    if (!editForm.username.trim()) { setEditError('Username is required'); return; }

    setEditSubmitting(true);
    setEditError('');

    let avatarUrl = editForm.avatar;

    if (avatarFile) {
      if (isRealToken(token)) {
        try {
          const formData = new FormData();
          formData.append('file', avatarFile);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: authHeaders(token),
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            avatarUrl = uploadData.url;
          }
        } catch (err) {
          console.warn("Avatar upload failed, falling back to preview URL:", err);
        }
      } else {
        avatarUrl = avatarPreview;
      }
    }

    const payload = {
      ...editForm,
      avatar: avatarUrl
    };

    // Mock mode — just update locally
    if (!isRealToken(token)) {
      setProfile(prev => ({ ...prev, ...payload }));
      updateUser(payload);
      setShowEditModal(false);
      setEditSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: jsonAuthHeaders(token),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated.user || updated);
        updateUser(updated.user || updated);
      } else {
        setProfile(prev => ({ ...prev, ...payload }));
        updateUser(payload);
      }
      setShowEditModal(false);
    } catch {
      setProfile(prev => ({ ...prev, ...payload }));
      updateUser(payload);
      setShowEditModal(false);
    } finally {
      setEditSubmitting(false);
      setAvatarFile(null);
    }
  };

  // ── Save Settings Tab Data ──────────────────────────────────────
  const handleSettingsSave = async (section, data) => {
    setSettingsSaving(true);
    setSettingsError('');
    setSettingsSuccess('');

    if (!isRealToken(token)) {
      updateUser({ [section]: data });
      setSettingsSuccess('Settings saved locally (Mock Mode)');
      setSettingsSaving(false);
      setTimeout(() => setSettingsSuccess(''), 4000);
      return;
    }

    try {
      const res = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: jsonAuthHeaders(token),
        body: JSON.stringify({ [section]: data })
      });

      const responseData = await res.json();
      if (res.ok) {
        setSettingsSuccess('Settings saved successfully!');
        updateUser(responseData.user || responseData);
        setTimeout(() => setSettingsSuccess(''), 4000);
      } else {
        setSettingsError(responseData.message || 'Failed to save settings');
      }
    } catch (err) {
      setSettingsError('Network error occurred');
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Change Password ─────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordSuccess('');
      return;
    }
    setPasswordSaving(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (!isRealToken(token)) {
      setPasswordSuccess('Password updated successfully (Mock Mode)!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: jsonAuthHeaders(token),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setPasswordError('Network error occurred');
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Toggle Block / Unblock ──────────────────────────────────────
  const handleToggleBlock = async (targetId) => {
    if (!isRealToken(token)) {
      // Mock toggle
      const alreadyBlocked = privacyForm.blockedUsers.some(u => u._id === targetId || u === targetId);
      let newBlocked = [];
      if (alreadyBlocked) {
        newBlocked = privacyForm.blockedUsers.filter(u => (u._id || u) !== targetId);
      } else {
        newBlocked = [...privacyForm.blockedUsers, { _id: targetId, username: 'blocked_user', fullName: 'Blocked Account' }];
      }
      setPrivacyForm(prev => ({ ...prev, blockedUsers: newBlocked }));
      updateUser({ privacySettings: { ...privacyForm, blockedUsers: newBlocked } });
      return;
    }

    try {
      const res = await fetch(`/api/users/block/${targetId}`, {
        method: 'PUT',
        headers: jsonAuthHeaders(token)
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.user || data);
      }
    } catch (err) {
      console.error('Failed to toggle block status:', err);
    }
  };

  // ── Cover Photo Upload ──────────────────────────────────────────
  const handleCoverChange = async (file) => {
    if (!file) return;

    if (!isRealToken(token)) {
      const localUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, coverPhoto: localUrl }));
      updateUser({ coverPhoto: localUrl });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: authHeaders(token),
        body: formData
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        const coverUrl = uploadData.url;

        const payload = {
          fullName: profile?.fullName || currentUser?.fullName || '',
          username: profile?.username || currentUser?.username || '',
          bio: profile?.bio || currentUser?.bio || '',
          website: profile?.website || currentUser?.website || '',
          location: profile?.location || currentUser?.location || '',
          avatar: profile?.avatar || currentUser?.avatar || '',
          coverPhoto: coverUrl
        };

        const res = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: jsonAuthHeaders(token),
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const updated = await res.json();
          setProfile(updated.user || updated);
          updateUser(updated.user || updated);
        }
      }
    } catch (err) {
      console.error('Failed to change cover photo:', err);
    }
  };

  // ── Support submission ──────────────────────────────────────────
  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSupportSuccess('Thank you for reporting! We will review this issue shortly.');
    setSupportForm({ type: 'bug', details: '' });
    setTimeout(() => setSupportSuccess(''), 5000);
  };

  const followerCount = profile?.followers?.length || 0;
  const followingCount = profile?.following?.length || 0;
  const postCount = posts.length;

  return {
    profile, posts, currentUser, token,
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
    handleEditChange, handleEditSubmit, fetchProfile, logout,
    avatarFile, setAvatarFile,
    avatarPreview, setAvatarPreview,
    handleCoverChange, navigate
  };
};