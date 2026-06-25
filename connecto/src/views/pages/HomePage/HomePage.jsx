/**
 * HomePage Component (View Layer)
 * Pure presentation component that uses HomeViewModel for logic
 */

import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaImage, FaVideo, FaPaperPlane, FaHome, FaPlusCircle, 
  FaPlayCircle, FaCamera, FaBroadcastTower
} from 'react-icons/fa';

import { useHomeViewModel } from '../../../viewmodels/feed/useHomeViewModel';
import Avatar from '../../components/common/Avatar/Avatar';
import Button from '../../components/common/Button/Button';
import Stories from '../../components/feed/Stories/Stories';
import PostCard from '../../components/feed/PostCard/PostCard';
import CreatePost from '../../components/feed/CreatePost/CreatePost';

import styles from './HomePage.module.css';

const HomePage = () => {
  const {
    // Data
    posts,
    suggestions,
    user,
    
    // Loading states
    loading,
    error,
    hasMore,
    
    // Create post state
    createPostState,
    
    // UI state
    postMenuOpen,
    
    // Actions
    loadMorePosts,
    refreshPosts,
    toggleFollow,
    token,
    
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
    handleReelVideoSelect,
    clearCreateReel,
    publishReel,
    handleStoryMediaSelect,
    clearCreateStory,
    publishStory
  } = useHomeViewModel();

  const fileInputRef = useRef(null);
  const reelVideoInputRef = useRef(null);
  const storyMediaInputRef = useRef(null);

  // Live streaming local UI simulation hooks
  const [liveStreaming, setLiveStreaming] = useState(false);
  const [liveViewers, setLiveViewers] = useState(0);
  const [liveChat, setLiveChat] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const [liveEnded, setLiveEnded] = useState(false);
  const [liveReplayCaption, setLiveReplayCaption] = useState('My Live Stream Replay 🔴');
  const [liveReplaySharing, setLiveReplaySharing] = useState(false);
  const [liveReplaySuccess, setLiveReplaySuccess] = useState(false);

  const handleShareLiveReplay = async () => {
    setLiveReplaySharing(true);
    const captionText = liveReplayCaption.trim() || 'Live Broadcast Replay 🔴';
    
    const payload = {
      caption: `${captionText}\n\n[Live Stream Replay Archive]`,
      image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=800',
      type: 'post'
    };

    try {
      if (token) {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          refreshPosts();
        }
      } else {
        window.dispatchEvent(new CustomEvent('new-mock-post', { detail: {
          _id: 'mock_live_' + Date.now(),
          user: user || { username: 'demo_user', fullName: 'Demo User', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' },
          caption: payload.caption,
          image: payload.image,
          likes: [],
          comments: [],
          createdAt: new Date().toISOString()
        }}));
      }
      setLiveReplaySuccess(true);
      setTimeout(() => {
        setLiveEnded(false);
        setLiveReplaySuccess(false);
        setShowCreator(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to share live replay:', err);
    } finally {
      setLiveReplaySharing(false);
    }
  };

  const chatContainerRef = useRef(null);

  useEffect(() => {
    let viewerInterval;
    let chatInterval;

    if (liveStreaming) {
      // Initialize chat
      setLiveChat([
        { user: 'connecto_bot', text: 'Live broadcast started! Say hi to your viewers.' }
      ]);
      setLiveViewers(12);

      // Viewer count increment simulation
      viewerInterval = setInterval(() => {
        setLiveViewers(prev => {
          const delta = Math.floor(Math.random() * 15) - 4; // mostly increments
          return Math.max(1, prev + delta);
        });
      }, 3000);

      // Scrolling comments simulation
      const mockUsers = ['sarah_cruz', 'alex_smith', 'diana_amber', 'wanderer_99', 'neo_traveler', 'lisa_pink', 'coder_kid'];
      const mockTexts = [
        'Awesome stream!',
        'Hello from SF! 👋',
        'So cool to see this live!',
        'Which camera is this?',
        'Stunning visual setup! 🔥',
        'Is this neomorphic live streaming? Amazing!',
        'Loving the background music!',
        'Keep up the great stream! ❤️'
      ];

      chatInterval = setInterval(() => {
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
        setLiveChat(prev => [...prev, { user: randomUser, text: randomText }]);
      }, 2500);
    } else {
      setLiveViewers(0);
      setLiveChat([]);
    }

    return () => {
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
    };
  }, [liveStreaming]);

  // Scroll live chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [liveChat]);

  const handleImageSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageSelect(files);
    }
  };

  const handlePublishClick = async () => {
    await publishPost();
  };



  if (loading && posts.length === 0) {
    return (
      <div className={styles.homePage}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.homeContainer}>

        {/* ===== LEFT SIDEBAR ===== */}
        <aside className={styles.leftSidebar}>
          {/* Profile Mini Card */}
          <div className={styles.profileMiniCard}>
            <Avatar
              src={user?.avatar}
              alt={user?.fullName}
              size="lg"
              isVerified={user?.isVerified}
            />
            <div className={styles.miniInfo}>
              <h4>{user?.fullName || 'User'}</h4>
              <p>@{user?.username || 'username'}</p>
              <div className={styles.miniStats}>
                <div className={styles.miniStat}>
                  <strong>{user?.followerCount || user?.followers?.length || 0}</strong>
                  <span>Followers</span>
                </div>
                <div className={styles.miniStat}>
                  <strong>{user?.followingCount || user?.following?.length || 0}</strong>
                  <span>Following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.sidebarCard}>
            <h3>Quick Links</h3>
            {[
              { icon: <FaHome />, label: "Home Feed", color: "var(--gradient-primary)", action: () => setShowCreator(false) },
              { icon: <FaPlusCircle />, label: "Create Content", color: "var(--gradient-cool)", action: () => setShowCreator(true) },
              { icon: <FaPlayCircle />, label: "Reels Studio", color: "var(--gradient-reel)", action: () => { setShowCreator(true); setCreatorTab('reel'); } },
              { icon: <FaCamera />, label: "Add Story", color: "var(--gradient-story)", action: () => { setShowCreator(true); setCreatorTab('story'); } },
              { icon: <FaBroadcastTower />, label: "Go Live", color: "var(--gradient-warm)", action: () => { setShowCreator(true); setCreatorTab('live'); } }
            ].map((item, i) => (
              <div key={i} className={styles.sidebarMenuItem} onClick={item.action} style={{ cursor: 'pointer' }}>
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
          {showCreator ? (
            /* Creator Studio Sub-page with subtle/low shadows */
            <div style={{
              background: 'var(--neo-surface, #e0e0e0)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              color: 'var(--text-primary)'
            }}>
              {/* Creator Studio Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={() => setShowCreator(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                  >
                    ← Feed
                  </button>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>Creator Studio</h2>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {['post', 'reel', 'story', 'live'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setCreatorTab(tab)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: creatorTab === tab ? 'var(--primary, #6b24b3)' : 'rgba(0,0,0,0.04)',
                        color: creatorTab === tab ? '#fff' : 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* MODE 1: POST CREATOR */}
              {creatorTab === 'post' && (
                <div>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Create a New Post</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <textarea 
                      rows="3"
                      value={createPostState.caption}
                      onChange={e => updateCreatePostState({ caption: e.target.value })}
                      placeholder="Write an interesting caption..."
                      style={{ padding: '12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', background: 'rgba(0,0,0,0.01)', outline: 'none', resize: 'vertical' }}
                    />

                    {createPostState.imagePreviews && createPostState.imagePreviews.length > 0 && (
                      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                        {createPostState.imagePreviews.map((preview, index) => (
                          <div key={index} style={{ position: 'relative', minWidth: '100px', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }}>
                            <img src={preview} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                              onClick={() => removeImage(index)}
                              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', zIndex: 3 }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                        multiple
                      />
                      <button 
                        onClick={handleImageSelectClick}
                        style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <FaImage /> Upload Photo(s)
                      </button>
                      <button 
                        onClick={handlePublishClick}
                        disabled={createPostState.publishing || (!createPostState.caption.trim() && (!createPostState.imageFiles || createPostState.imageFiles.length === 0))}
                        style={{ padding: '8px 20px', background: 'var(--primary, #6b24b3)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        {createPostState.publishing ? 'Sharing...' : 'Share Post'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: REEL CREATOR */}
              {creatorTab === 'reel' && (
                <div>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Create a New Reel</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <textarea 
                      rows="3"
                      value={createReelState.caption}
                      onChange={e => setCreateReelState(prev => ({ ...prev, caption: e.target.value }))}
                      placeholder="Describe your reel..."
                      style={{ padding: '12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', background: 'rgba(0,0,0,0.01)', outline: 'none', resize: 'vertical' }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Add Music Audio Title</label>
                      <input 
                        type="text"
                        placeholder="e.g. Original Audio - Lofi Vibe"
                        value={createReelState.music}
                        onChange={e => setCreateReelState(prev => ({ ...prev, music: e.target.value }))}
                        style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>

                    {createReelState.videoPreview && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#000', borderRadius: '8px', padding: '10px' }}>
                        <video 
                          src={createReelState.videoPreview} 
                          controls 
                          style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px' }} 
                        />
                        <button 
                          onClick={clearCreateReel}
                          style={{ marginTop: '10px', padding: '4px 12px', border: '1px solid #ef476f', background: 'transparent', color: '#ef476f', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Remove Video
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="file" 
                        ref={reelVideoInputRef} 
                        onChange={e => handleReelVideoSelect(e.target.files[0])} 
                        style={{ display: 'none' }} 
                        accept="video/*" 
                      />
                      <button 
                        onClick={() => reelVideoInputRef.current?.click()}
                        style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <FaVideo /> Select Vertical Video
                      </button>
                      <button 
                        onClick={publishReel}
                        disabled={createReelState.publishing || !createReelState.videoFile}
                        style={{ padding: '8px 20px', background: 'var(--primary, #6b24b3)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        {createReelState.publishing ? 'Sharing...' : 'Share Reel'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 3: STORY CREATOR */}
              {creatorTab === 'story' && (
                <div>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Upload a Story</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {/* Story Style Selection */}
                    <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                      <button
                        onClick={() => setCreateStoryState(prev => ({ ...prev, mediaType: 'image' }))}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          background: createStoryState.mediaType === 'image' ? 'var(--primary)' : 'rgba(0,0,0,0.03)',
                          color: createStoryState.mediaType === 'image' ? '#fff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Media Upload (Photo/Video)
                      </button>
                      <button
                        onClick={() => setCreateStoryState(prev => ({ ...prev, mediaType: 'text', mediaPreview: '' }))}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          background: createStoryState.mediaType === 'text' ? 'var(--primary)' : 'rgba(0,0,0,0.03)',
                          color: createStoryState.mediaType === 'text' ? '#fff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Text Story Vibe
                      </button>
                    </div>

                    {createStoryState.mediaType === 'text' ? (
                      /* Text Story creator with background picker */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{
                          background: createStoryState.bgColor,
                          height: '260px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '20px',
                          position: 'relative'
                        }}>
                          <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
                            {createStoryState.textOverlay || 'Type your story vibe...'}
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Story Text</label>
                          <input 
                            type="text" 
                            placeholder="Type here..." 
                            value={createStoryState.textOverlay}
                            onChange={e => setCreateStoryState(prev => ({ ...prev, textOverlay: e.target.value }))}
                            style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Select Gradient Color</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                              { label: 'Sunset', value: 'linear-gradient(135deg, #f9629f 0%, #ffc0e5 100%)' },
                              { label: 'Oceanic', value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
                              { label: 'Neon', value: 'linear-gradient(135deg, #00f260 0%, #0575e6 100%)' },
                              { label: 'Velvet', value: 'linear-gradient(135deg, #e65c00 0%, #f9d423 100%)' }
                            ].map(grad => (
                              <button
                                key={grad.label}
                                onClick={() => setCreateStoryState(prev => ({ ...prev, bgColor: grad.value }))}
                                style={{
                                  padding: '8px 12px',
                                  background: grad.value,
                                  border: createStoryState.bgColor === grad.value ? '2px solid var(--text-primary)' : 'none',
                                  borderRadius: '6px',
                                  color: '#fff',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  cursor: 'pointer'
                                }}
                              >
                                {grad.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* File upload Story */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {createStoryState.mediaPreview && (
                          <div style={{ textAlign: 'center', background: '#000', borderRadius: '8px', padding: '10px' }}>
                            {createStoryState.mediaPreview.includes('video') || (createStoryState.mediaFile && createStoryState.mediaFile.type.startsWith('video')) ? (
                              <video src={createStoryState.mediaPreview} style={{ maxHeight: '260px', maxWidth: '100%' }} controls />
                            ) : (
                              <img src={createStoryState.mediaPreview} alt="preview" style={{ maxHeight: '260px', maxWidth: '100%', objectFit: 'contain' }} />
                            )}
                            <button 
                              onClick={clearCreateStory}
                              style={{ marginTop: '10px', padding: '4px 12px', border: '1px solid #ef476f', background: 'transparent', color: '#ef476f', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Remove Media
                            </button>
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Story Caption (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="Add a story caption..." 
                            value={createStoryState.caption}
                            onChange={e => setCreateStoryState(prev => ({ ...prev, caption: e.target.value }))}
                            style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type="file" 
                            ref={storyMediaInputRef} 
                            onChange={e => handleStoryMediaSelect(e.target.files[0])} 
                            style={{ display: 'none' }} 
                            accept="image/*,video/*" 
                          />
                          <button 
                            onClick={() => storyMediaInputRef.current?.click()}
                            style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            <FaCamera /> Select Photo / Video
                          </button>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={publishStory}
                      disabled={createStoryState.publishing || (createStoryState.mediaType === 'image' && !createStoryState.mediaFile) || (createStoryState.mediaType === 'text' && !createStoryState.textOverlay.trim())}
                      style={{ alignSelf: 'flex-start', padding: '8px 20px', background: 'var(--primary, #6b24b3)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {createStoryState.publishing ? 'Sharing...' : 'Share to Story'}
                    </button>
                  </div>
                </div>
              )}
              {/* MODE 4: LIVE BROADCAST */}
              {creatorTab === 'live' && (
                <div>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Go Live Video Stream</h3>
                  
                  {liveEnded && !liveStreaming ? (
                    /* Replay Options Card */
                    <div style={{
                      background: 'rgba(0,0,0,0.02)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '8px',
                      padding: '25px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '15px',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'rgba(107, 36, 179, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        marginBottom: '10px'
                      }}>
                        🔴
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Broadcast Ended!</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '350px', margin: 0 }}>
                        Your live broadcast has successfully finished. You can now share a replay of this broadcast to your main feed, or discard it.
                      </p>

                      {liveReplaySuccess ? (
                        <div style={{ background: '#06d6a0', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          ✓ Live replay shared to feed!
                        </div>
                      ) : (
                        <>
                          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', marginTop: '10px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Replay Caption</label>
                            <input 
                              type="text" 
                              value={liveReplayCaption} 
                              onChange={e => setLiveReplayCaption(e.target.value)}
                              placeholder="Write a caption for the replay..." 
                              style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', outline: 'none', fontSize: '0.9rem', background: 'transparent', color: 'var(--text-primary)' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button
                              onClick={handleShareLiveReplay}
                              disabled={liveReplaySharing}
                              style={{
                                padding: '10px 20px',
                                background: 'var(--primary, #6b24b3)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              {liveReplaySharing ? 'Sharing...' : 'Share Replay to Feed'}
                            </button>
                            <button
                              onClick={() => {
                                setLiveEnded(false);
                                setShowCreator(false);
                              }}
                              style={{
                                padding: '10px 20px',
                                background: 'rgba(0,0,0,0.04)',
                                border: '1px solid rgba(0,0,0,0.1)',
                                color: 'var(--text-primary)',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Discard
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        {/* Streaming Viewport */}
                        <div style={{
                          flex: 1,
                          height: '350px',
                          background: '#1a1a1a',
                          borderRadius: '8px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          {/* Pulse Live Animation Overlay */}
                          {liveStreaming ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                              <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(239, 71, 111, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                animation: 'pulse 1.5s infinite'
                              }}>
                                <FaBroadcastTower style={{ color: '#ef476f', fontSize: '2.5rem' }} />
                              </div>
                              <span style={{ color: '#fff', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem' }}>STREAMING IS ACTIVE</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                              <FaBroadcastTower style={{ color: 'rgba(255,255,255,0.2)', fontSize: '3.5rem' }} />
                              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Stream is currently offline</span>
                            </div>
                          )}

                          {/* Header overlay */}
                          <div style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {liveStreaming && (
                              <>
                                <div style={{ background: '#ef476f', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                  LIVE
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  👁️ {liveViewers}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Chat Sidebar Overlay */}
                        <div style={{
                          width: '260px',
                          height: '350px',
                          border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden'
                        }}>
                          <div style={{ background: 'rgba(0,0,0,0.04)', padding: '10px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>Live Chat</h4>
                          </div>
                          
                          <div 
                            ref={chatContainerRef}
                            style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                          >
                            {liveChat.length === 0 ? (
                              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                Chat messages appear when live.
                              </div>
                            ) : (
                              liveChat.map((msg, i) => (
                                <div key={i} style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                                  <strong style={{ color: msg.user === 'connecto_bot' ? '#6b24b3' : 'var(--text-primary)' }}>
                                    @{msg.user}:
                                  </strong>{' '}
                                  <span style={{ color: 'var(--text-secondary)' }}>{msg.text}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {liveStreaming && (
                            <form 
                              onSubmit={e => {
                                e.preventDefault();
                                if (chatInput.trim()) {
                                  setLiveChat(prev => [...prev, { user: user?.username || 'me', text: chatInput }]);
                                  setChatInput('');
                                }
                              }}
                              style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.05)', padding: '6px' }}
                            >
                              <input 
                                type="text" 
                                placeholder="Type a message..." 
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                style={{ flex: 1, border: '1px solid rgba(0,0,0,0.1)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', outline: 'none' }}
                              />
                              <button type="submit" style={{ padding: '0 8px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                                <FaPaperPlane style={{ fontSize: '0.85rem' }} />
                              </button>
                            </form>
                          )}
                        </div>
                      </div>

                      <div style={{ marginTop: '20px' }}>
                        {liveStreaming ? (
                          <button 
                            onClick={() => {
                              setLiveStreaming(false);
                              setLiveEnded(true);
                            }}
                            style={{ padding: '10px 20px', background: '#ef476f', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            End Broadcast
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setLiveStreaming(true);
                              setLiveEnded(false);
                            }}
                            style={{ padding: '10px 20px', background: '#06d6a0', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            Start Live Broadcast
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Stories */}
              <Stories />

              {/* Create Post */}
              <CreatePost
                user={user}
                caption={createPostState.caption}
                imagePreview={createPostState.imagePreview}
                publishing={createPostState.publishing}
                onCaptionChange={(caption) => updateCreatePostState({ caption })}
                onImageSelect={handleImageSelectClick}
                onImageRemove={clearCreatePost}
                onPublish={handlePublishClick}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />

              {/* Posts Feed */}
              {error && (
                <div className={styles.errorState}>
                  <p>{error}</p>
                  <Button onClick={refreshPosts} variant="primary">
                    Try Again
                  </Button>
                </div>
              )}

              {posts.length === 0 && !loading ? (
                <div className={styles.emptyFeed}>
                  <FaImage />
                  <h3>No posts yet</h3>
                  <p>Be the first to share something!</p>
                </div>
              ) : (
                <div className={styles.postsContainer}>
                  {posts.map(post => (
                    <PostCard
                      key={post._id}
                      post={post}
                      currentUser={user}
                      isLiked={isPostLiked(post._id)}
                      isSaved={isPostSaved(post._id)}
                      commentInput={getCommentInput(post._id)}
                      isCommentsExpanded={isCommentsExpanded(post._id)}
                      isMenuOpen={postMenuOpen === post._id}
                      onLike={() => toggleLike(post._id)}
                      onSave={() => toggleSave(post._id)}
                      onComment={(text) => addComment(post._id, text)}
                      onCommentInputChange={(value) => updateCommentInput(post._id, value)}
                      onToggleComments={() => toggleExpandComments(post._id)}
                      onToggleMenu={() => togglePostMenu(post._id)}
                      onDelete={() => deletePost(post._id)}
                      onShare={() => sharePost(post._id)}
                    />
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className={styles.loadMoreContainer}>
                      <Button
                        onClick={loadMorePosts}
                        variant="ghost"
                        loading={loading}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load More Posts'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside className={styles.rightSidebar}>
          {/* Suggestions */}
          <div className={styles.suggestionsCard}>
            <div className={styles.suggestionsHeader}>
              <h3>Suggestions</h3>
              <Button variant="link" size="sm">See All</Button>
            </div>
            {suggestions.map(suggestion => (
              <div key={suggestion._id} className={styles.suggestionItem}>
                <Link to={`/profile/${suggestion._id}`} className={styles.suggestionAvatarLink}>
                  <Avatar
                    src={suggestion.avatar}
                    alt={suggestion.fullName}
                    size="md"
                  />
                </Link>
                <Link to={`/profile/${suggestion._id}`} className={`${styles.suggestionInfo} ${styles.suggestionInfoLink}`}>
                  <span className={styles.suggestionName}>{suggestion.fullName}</span>
                  <span className={styles.suggestionUsername}>
                    {suggestion.followers?.length || 0} followers
                  </span>
                </Link>
                <Button
                  variant={isUserFollowed(suggestion._id) ? "ghost" : "primary"}
                  size="sm"
                  onClick={() => toggleFollow(suggestion._id)}
                >
                  {isUserFollowed(suggestion._id) ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))}
          </div>

          {/* Trending */}
          <div className={styles.trendingCard}>
            <h3>Trending</h3>
            {[
              { tag: "#travel", count: "24.5K posts" },
              { tag: "#photography", count: "18.2K posts" },
              { tag: "#foodie", count: "15.8K posts" },
              { tag: "#fitness", count: "12.1K posts" },
              { tag: "#sunset", count: "9.7K posts" }
            ].map((topic, i) => (
              <div key={i} className={styles.trendingItem}>
                <span className={styles.trendingTag}>{topic.tag}</span>
                <span className={styles.trendingCount}>{topic.count}</span>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default HomePage;