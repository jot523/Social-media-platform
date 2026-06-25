/**
 * Home Feed ViewModel
 * Manages state and business logic for the home feed page
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import postsAPI from '../../models/api/posts.api';

export const useHomeViewModel = () => {
  const { user, token, updateUser, fetchCurrentUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Creator Studio States
  const [showCreator, setShowCreator] = useState(false);
  const [creatorTab, setCreatorTab] = useState('post'); // post, reel, story, live

  const [createReelState, setCreateReelState] = useState({
    caption: '',
    videoFile: null,
    videoPreview: '',
    music: '',
    publishing: false
  });

  const [createStoryState, setCreateStoryState] = useState({
    caption: '',
    mediaFile: null,
    mediaPreview: '',
    mediaType: 'image',
    bgColor: 'linear-gradient(135deg, #f9629f 0%, #ffc0e5 100%)',
    textOverlay: '',
    publishing: false
  });

  // Streaming State (Live Video)
  const [liveState, setLiveState] = useState({
    streaming: false,
    viewers: 0,
    chatMessages: [],
    cameraStream: null
  });

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreator(true);
      const tab = searchParams.get('tab') || 'post';
      setCreatorTab(tab);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('create');
      newParams.delete('tab');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // State management
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Post creation state
  const [createPostState, setCreatePostState] = useState({
    caption: '',
    imageFiles: [],
    imagePreviews: [],
    publishing: false
  });

  // UI state
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [postMenuOpen, setPostMenuOpen] = useState(null);

  // Initialize liked and saved posts from user data
  useEffect(() => {
    if (user?.savedPosts) {
      setSavedPosts(new Set(user.savedPosts));
    }
    if (user?.following) {
      setFollowedUsers(new Set(user.following));
    }
  }, [user]);

  // Fetch posts feed
  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      setError(null);
      if (!append) setLoading(true);

      const response = await postsAPI.getFeed({
        page: pageNum,
        limit: 10,
        sort: 'newest'
      });

      const newPosts = response.posts || [];
      
      if (newPosts.length > 0) {
        setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
        setHasMore(response.pagination.page < response.pagination.totalPages);
      } else if (pageNum === 1) {
        // No posts yet — show empty state
        setPosts([]);
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Failed to fetch posts:', err);
      if (pageNum === 1) {
        setPosts([]);
      }
      setError('Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/users/suggestions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch suggestions:', err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    fetchPosts(1);
    fetchSuggestions();
  }, [fetchPosts, fetchSuggestions]);

  // Load more posts (infinite scroll)
  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  }, [loading, hasMore, page, fetchPosts]);

  // Refresh posts
  const refreshPosts = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts]);

  // Create post methods
  const updateCreatePostState = useCallback((updates) => {
    setCreatePostState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleImageSelect = useCallback((files) => {
    if (files) {
      const fileList = files instanceof FileList || Array.isArray(files) ? Array.from(files) : [files];
      setCreatePostState(prev => {
        const newFiles = [...(prev.imageFiles || []), ...fileList].slice(0, 10);
        // Revoke existing previews to avoid memory leak
        if (prev.imagePreviews) {
          prev.imagePreviews.forEach(p => URL.revokeObjectURL(p));
        }
        const newPreviews = newFiles.map(f => URL.createObjectURL(f));
        return {
          ...prev,
          imageFiles: newFiles,
          imagePreviews: newPreviews
        };
      });
    }
  }, []);

  const removeImage = useCallback((index) => {
    setCreatePostState(prev => {
      const newFiles = (prev.imageFiles || []).filter((_, i) => i !== index);
      if (prev.imagePreviews && prev.imagePreviews[index]) {
        URL.revokeObjectURL(prev.imagePreviews[index]);
      }
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      return {
        ...prev,
        imageFiles: newFiles,
        imagePreviews: newPreviews
      };
    });
  }, []);

  const clearCreatePost = useCallback(() => {
    if (createPostState.imagePreviews) {
      createPostState.imagePreviews.forEach(p => URL.revokeObjectURL(p));
    }
    setCreatePostState({
      caption: '',
      imageFiles: [],
      imagePreviews: [],
      publishing: false
    });
  }, [createPostState.imagePreviews]);

  const publishPost = useCallback(async () => {
    const imageFiles = createPostState.imageFiles || [];
    const imagePreviews = createPostState.imagePreviews || [];
    if (!createPostState.caption.trim() && imageFiles.length === 0) return;

    // Capture before any state clearing
    const currentCaption = createPostState.caption;
    const currentPreviews = [...imagePreviews];

    updateCreatePostState({ publishing: true });

    try {
      // Upload all images, collecting URLs
      const uploadedUrls = [];
      for (const file of imageFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            uploadedUrls.push(data.url);
          } else {
            uploadedUrls.push(URL.createObjectURL(file));
          }
        } catch {
          uploadedUrls.push(URL.createObjectURL(file));
        }
      }

      const imageUrls = uploadedUrls.length > 0 ? uploadedUrls : currentPreviews;

      let newPost = null;
      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            caption: currentCaption,
            images: imageUrls,
            image: imageUrls[0] || ''
          })
        });
        if (res.ok) {
          newPost = await res.json();
          // Patch if server returned empty images
          if ((!newPost.images || newPost.images.length === 0) && currentPreviews.length > 0) {
            newPost.image = currentPreviews[0];
            newPost.images = currentPreviews;
          }
        }
      } catch { /* fall through to mock */ }

      if (!newPost) {
        newPost = {
          _id: 'mock_' + Date.now(),
          user,
          caption: currentCaption,
          image: imageUrls[0] || '',
          images: imageUrls,
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        };
      }

      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } finally {
      // Clear form after post is in state
      setCreatePostState({ caption: '', imageFiles: [], imagePreviews: [], publishing: false });
    }
  }, [createPostState, user, token, updateCreatePostState]);

  const handleReelVideoSelect = useCallback((file) => {
    if (file) {
      setCreateReelState(prev => ({
        ...prev,
        videoFile: file,
        videoPreview: URL.createObjectURL(file)
      }));
    }
  }, []);

  const clearCreateReel = useCallback(() => {
    if (createReelState.videoPreview) {
      URL.revokeObjectURL(createReelState.videoPreview);
    }
    setCreateReelState({
      caption: '',
      videoFile: null,
      videoPreview: '',
      music: '',
      publishing: false
    });
  }, [createReelState.videoPreview]);

  const publishReel = useCallback(async () => {
    if (!createReelState.videoFile && !createReelState.videoPreview) return;
    try {
      setCreateReelState(prev => ({ ...prev, publishing: true }));
      let newReel;
      if (token) {
        newReel = await postsAPI.createReel({
          video: createReelState.videoFile,
          caption: createReelState.caption,
          music: createReelState.music,
          thumbnail: ''
        });
      } else {
        throw new Error('Mock mode or missing token');
      }
      clearCreateReel();
      setShowCreator(false);
      window.dispatchEvent(new CustomEvent('reel-published', { detail: newReel }));
    } catch (err) {
      console.warn('Failed to create reel, creating mock:', err);
      const mockReel = {
        _id: 'mock_' + Date.now(),
        user: user || { _id: 'mock_user_id', username: 'demo_user', fullName: 'Demo User', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' },
        caption: createReelState.caption,
        videoUrl: createReelState.videoPreview || 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: '',
        likes: [],
        comments: [],
        shares: 0,
        music: createReelState.music || 'Original Audio',
        createdAt: new Date().toISOString()
      };
      const currentLocalReels = JSON.parse(localStorage.getItem('local_reels') || '[]');
      currentLocalReels.unshift(mockReel);
      localStorage.setItem('local_reels', JSON.stringify(currentLocalReels));
      clearCreateReel();
      setShowCreator(false);
      window.dispatchEvent(new CustomEvent('reel-published', { detail: mockReel }));
    }
  }, [createReelState, clearCreateReel, token, user]);

  const handleStoryMediaSelect = useCallback((file) => {
    if (file) {
      setCreateStoryState(prev => ({
        ...prev,
        mediaFile: file,
        mediaPreview: URL.createObjectURL(file),
        mediaType: file.type.startsWith('video') ? 'video' : 'image'
      }));
    }
  }, []);

  const clearCreateStory = useCallback(() => {
    if (createStoryState.mediaPreview) {
      URL.revokeObjectURL(createStoryState.mediaPreview);
    }
    setCreateStoryState({
      caption: '',
      mediaFile: null,
      mediaPreview: '',
      mediaType: 'image',
      bgColor: 'linear-gradient(135deg, #f9629f 0%, #ffc0e5 100%)',
      textOverlay: '',
      publishing: false
    });
  }, [createStoryState.mediaPreview]);

  const publishStory = useCallback(async () => {
    if (createStoryState.mediaType === 'image' && !createStoryState.mediaFile) return;
    if (createStoryState.mediaType === 'text' && !createStoryState.textOverlay.trim()) return;

    try {
      setCreateStoryState(prev => ({ ...prev, publishing: true }));
      let newStory;
      if (token) {
        newStory = await postsAPI.createStory({
          media: createStoryState.mediaFile,
          mediaType: createStoryState.mediaType,
          caption: createStoryState.caption,
          bgColor: createStoryState.bgColor,
          textOverlay: createStoryState.textOverlay
        });
      } else {
        throw new Error('Mock mode or missing token');
      }
      clearCreateStory();
      setShowCreator(false);
      window.dispatchEvent(new CustomEvent('story-published', { detail: newStory }));
    } catch (err) {
      console.warn('Failed to create story, creating mock:', err);
      const mockStory = {
        _id: 'mock_' + Date.now(),
        user: user || { _id: 'mock_user_id', username: 'demo_user', fullName: 'Demo User', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' },
        mediaUrl: createStoryState.mediaPreview || '',
        mediaType: createStoryState.mediaType,
        caption: createStoryState.caption,
        bgColor: createStoryState.bgColor,
        textOverlay: createStoryState.textOverlay,
        createdAt: new Date().toISOString(),
        viewed: false
      };
      const currentLocalStories = JSON.parse(localStorage.getItem('local_stories') || '[]');
      currentLocalStories.unshift(mockStory);
      localStorage.setItem('local_stories', JSON.stringify(currentLocalStories));
      clearCreateStory();
      setShowCreator(false);
      window.dispatchEvent(new CustomEvent('story-published', { detail: mockStory }));
    }
  }, [createStoryState, clearCreateStory, token, user]);

  // Post interaction methods
  const toggleLike = useCallback(async (postId) => {
    const post = posts.find(p => p._id === postId);
    if (!post) return;

    const userId = user?._id || user?.id;
    const wasLiked = post.likes?.some(id => (id._id || id) === userId);
    
    // Update posts state (optimistic)
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        const updatedPost = { ...p };
        if (wasLiked) {
          updatedPost.likes = updatedPost.likes.filter(id => (id._id || id) !== userId);
        } else {
          updatedPost.likes = [...(updatedPost.likes || []), userId];
        }
        return updatedPost;
      }
      return p;
    }));

    try {
      await postsAPI.toggleLike(postId);
    } catch (err) {
      // Revert on error
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const updatedPost = { ...p };
          if (wasLiked) {
            updatedPost.likes = [...(updatedPost.likes || []), userId];
          } else {
            updatedPost.likes = updatedPost.likes.filter(id => (id._id || id) !== userId);
          }
          return updatedPost;
        }
        return p;
      }));
      console.error('Failed to toggle like:', err);
    }
  }, [posts, user]);

  const toggleSave = useCallback(async (postId) => {
    const wasSaved = savedPosts.has(postId);
    
    // Optimistic update
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (wasSaved) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    try {
      await postsAPI.toggleSave(postId);
    } catch (err) {
      // Revert on error
      setSavedPosts(prev => {
        const newSet = new Set(prev);
        if (wasSaved) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      console.error('Failed to toggle save:', err);
    }
  }, [savedPosts]);

  const addComment = useCallback(async (postId, text) => {
    if (!text?.trim()) return;

    const tempComment = {
      _id: 'temp_' + Date.now(),
      user: { username: user?.username, avatar: user?.avatar },
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    // Optimistic update
    setPosts(prev => prev.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          comments: [...post.comments, tempComment]
        };
      }
      return post;
    }));

    // Clear input
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      const comment = await postsAPI.addComment(postId, text);
      
      // Replace temp comment with real one
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const comments = post.comments.filter(c => c._id !== tempComment._id);
          return {
            ...post,
            comments: [...comments, comment]
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  }, [user]);

  const sharePost = useCallback(async (postId) => {
    let captionText = 'Check out this post on Connecto!';
    // Optimistic update
    setPosts(prev => {
      const target = prev.find(p => p._id === postId);
      if (target && target.caption) {
        captionText = target.caption;
      }
      return prev.map(p => {
        if (p._id === postId) {
          return { ...p, shares: (p.shares || 0) + 1 };
        }
        return p;
      });
    });

    try {
      await postsAPI.sharePost(postId);
      
      const shareUrl = `${window.location.origin}/post/${postId}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Connecto Post',
            text: captionText,
            url: shareUrl,
          });
        } catch (shareErr) {
          console.log('Share prompt dismissed', shareErr);
        }
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Post link copied to clipboard!');
      }
    } catch (err) {
      // Revert on error
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return { ...p, shares: Math.max(0, (p.shares || 0) - 1) };
        }
        return p;
      }));
      console.error('Failed to share post:', err);
    }
  }, []);

  const deletePost = useCallback(async (postId) => {
    // Optimistic update
    setPosts(prev => prev.filter(post => post._id !== postId));
    setPostMenuOpen(null);

    try {
      await postsAPI.deletePost(postId);
    } catch (err) {
      console.error('Failed to delete post:', err);
      // Could revert here if needed
    }
  }, []);

  const toggleFollow = useCallback(async (targetUserId) => {
    const followingSet = new Set(followedUsers);
    const isFollowing = followingSet.has(targetUserId);

    // Optimistically update local view-model state
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      if (isFollowing) {
        newSet.delete(targetUserId);
      } else {
        newSet.add(targetUserId);
      }
      return newSet;
    });

    // Sync back to AuthContext
    const followingList = user?.following || [];
    const updatedFollowing = isFollowing
      ? followingList.filter(id => (id._id || id) !== targetUserId)
      : [...followingList, targetUserId];
    
    updateUser({ following: updatedFollowing });

    if (token) {
      try {
        await fetch(`/api/users/${targetUserId}/follow`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refresh current user from API to sync following list
        fetchCurrentUser(token);
      } catch (err) {
        console.error('Failed to toggle follow:', err);
        // Revert on error
        setFollowedUsers(prev => {
          const newSet = new Set(prev);
          if (isFollowing) {
            newSet.add(targetUserId);
          } else {
            newSet.delete(targetUserId);
          }
          return newSet;
        });
        updateUser({ following: user?.following || [] });
      }
    }
  }, [followedUsers, user, token, updateUser, fetchCurrentUser]);

  // UI state methods
  const updateCommentInput = useCallback((postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  }, []);

  const toggleExpandComments = useCallback((postId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const togglePostMenu = useCallback((postId) => {
    setPostMenuOpen(prev => prev === postId ? null : postId);
  }, []);

  // Computed values
  const isPostLiked = useCallback((postId) => {
    const post = posts.find(p => p._id === postId);
    if (!post) return false;
    const userId = user?._id || user?.id;
    return post.likes?.some(id => (id._id || id) === userId);
  }, [posts, user]);
  const isPostSaved = useCallback((postId) => savedPosts.has(postId), [savedPosts]);
  const isUserFollowed = useCallback((userId) => followedUsers.has(userId), [followedUsers]);
  const getCommentInput = useCallback((postId) => commentInputs[postId] || '', [commentInputs]);
  const isCommentsExpanded = useCallback((postId) => expandedComments.has(postId), [expandedComments]);

  return {
    // Data
    posts,
    suggestions,
    user,
    
    // Loading states
    loading,
    error,
    refreshing,
    hasMore,
    
    // Create post state
    createPostState,
    
    // UI state
    likedPosts,
    savedPosts,
    followedUsers,
    commentInputs,
    expandedComments,
    postMenuOpen,
    
    // Actions
    fetchPosts,
    loadMorePosts,
    refreshPosts,
    fetchSuggestions,
    
    // Create post actions
    updateCreatePostState,
    handleImageSelect,
    removeImage,
    clearCreatePost,
    publishPost,
    
    // Post interactions
    toggleLike,
    toggleSave,
    addComment,
    sharePost,
    deletePost,
    toggleFollow,
    
    // UI actions
    updateCommentInput,
    toggleExpandComments,
    togglePostMenu,
    
    // Computed values
    isPostLiked,
    isPostSaved,
    isUserFollowed,
    getCommentInput,
    isCommentsExpanded,
    
    // Creator Studio values
    showCreator,
    setShowCreator,
    creatorTab,
    setCreatorTab,
    createReelState,
    setCreateReelState,
    createStoryState,
    setCreateStoryState,
    liveState,
    setLiveState,
    handleReelVideoSelect,
    clearCreateReel,
    publishReel,
    handleStoryMediaSelect,
    clearCreateStory,
    publishStory
  };
};