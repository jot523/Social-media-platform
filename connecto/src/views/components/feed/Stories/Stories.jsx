/**
 * Stories Component (View Layer)
 * Horizontal story carousel with viewer modal
 */

import React, { useState } from 'react';
import { FaPlus, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useStoriesViewModel } from '../../../../viewmodels/feed/useStoriesViewModel';
import Avatar from '../../common/Avatar/Avatar';
import CameraModal from '../../../../Component/CameraModal';
import { getImageUrl } from '../../../../services/utils/imageUtils';
import styles from './Stories.module.css';

const Stories = () => {
  const [showCamera, setShowCamera] = useState(false);
  const {
    stories,
    currentUser,
    viewingStory,
    viewingIndex,
    progress,
    openStory,
    closeStory,
    nextStory,
    prevStory,
    fetchStories,
  } = useStoriesViewModel();

  return (
    <>
      {/* Stories Carousel */}
      <div className={styles.storiesContainer}>
        <div className={styles.storiesScroll}>

          {/* Add Story Button */}
          <div className={styles.storyItem} onClick={() => setShowCamera(true)}>
            <div className={styles.addStoryBtn}>
              <Avatar src={currentUser?.avatar} alt="You" size="md" />
              <div className={styles.addStoryIcon}>
                <FaPlus />
              </div>
            </div>
            <span className={styles.storyUsername}>Your Story</span>
          </div>

          {/* Story Items */}
          {stories.map((story, index) => (
            <div
              key={story._id || index}
              className={styles.storyItem}
              onClick={() => openStory(index)}
            >
              <div className={`${styles.storyRing} ${story.viewed ? styles.viewed : ''}`}>
                <Avatar
                  src={story.user?.avatar}
                  alt={story.user?.username}
                  size="md"
                />
              </div>
              <span className={styles.storyUsername}>
                {story.user?.username?.split('_')[0] || 'User'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && (
        <div className={styles.storyModal} onClick={closeStory}>
          <div className={styles.storyViewer} onClick={(e) => e.stopPropagation()}>

            {/* Progress Bars */}
            <div className={styles.progressBars}>
              {stories.map((_, i) => (
                <div key={i} className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: i < viewingIndex ? '100%' : i === viewingIndex ? `${progress}%` : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className={styles.storyHeader}>
              <div className={styles.storyUserInfo}>
                <Avatar
                  src={viewingStory.user?.avatar}
                  alt={viewingStory.user?.username}
                  size="sm"
                />
                <span className={styles.storyUserName}>{viewingStory.user?.username}</span>
                <span className={styles.storyTime}>2h ago</span>
              </div>
              <button className={styles.closeBtn} onClick={closeStory}>
                <FaTimes />
              </button>
            </div>

            {/* Story Media */}
            <div className={styles.storyMedia}>
              {viewingStory.mediaType === 'video' ? (
                <video
                  src={getImageUrl(viewingStory.mediaUrl)}
                  className={styles.storyVideo}
                  autoPlay
                  muted
                  loop
                />
              ) : viewingStory.mediaType === 'text' ? (
                <div style={{
                  background: viewingStory.bgColor || 'linear-gradient(135deg, #f9629f 0%, #ffc0e5 100%)',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  color: '#fff',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  boxSizing: 'border-box'
                }}>
                  {viewingStory.textOverlay || viewingStory.caption}
                </div>
              ) : (
                <img
                  src={getImageUrl(viewingStory.mediaUrl) || `https://picsum.photos/seed/${viewingStory._id}/400/700`}
                  alt="story"
                  className={styles.storyImage}
                />
              )}
              {viewingStory.mediaType !== 'text' && viewingStory.caption && (
                <div className={styles.storyCaption}>{viewingStory.caption}</div>
              )}
            </div>

            {/* Navigation */}
            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevStory}>
              <FaChevronLeft />
            </button>
            <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextStory}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
      {/* Camera Modal */}
      {showCamera && (
        <CameraModal
          onClose={() => {
            setShowCamera(false);
            fetchStories();
          }}
        />
      )}
    </>
  );
};

export default Stories;