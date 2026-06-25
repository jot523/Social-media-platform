/**
 * CreatePost Component (View Layer)
 * Post creation form with image upload support
 */

import React from 'react';
import { FaImage, FaVideo, FaSmile, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import Avatar from '../../../components/common/Avatar/Avatar';
import Button from '../../../components/common/Button/Button';
import styles from './CreatePost.module.css';

const CreatePost = ({
  user,
  caption,
  imagePreview,
  publishing,
  onCaptionChange,
  onImageSelect,
  onImageRemove,
  onPublish,
  fileInputRef,
  onFileChange,
}) => {
  const canPublish = (caption?.trim() || imagePreview) && !publishing;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && canPublish) {
      e.preventDefault();
      onPublish();
    }
  };

  return (
    <div className={styles.createPost}>
      {/* Top Row */}
      <div className={styles.createPostTop}>
        <Avatar src={user?.avatar} alt={user?.fullName} size="md" />
        <input
          type="text"
          className={styles.createPostInput}
          placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0] || 'there'}?`}
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className={styles.imagePreview}>
          <img src={imagePreview} alt="preview" className={styles.previewImg} />
          <button
            className={styles.removeImageBtn}
            onClick={onImageRemove}
            aria-label="Remove image"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Actions Row */}
      <div className={styles.createPostActions}>
        <div className={styles.mediaActions}>
          <button className={styles.mediaBtn} onClick={onImageSelect} type="button">
            <FaImage style={{ color: '#43e97b' }} />
            <span>Photo</span>
          </button>
          <button className={styles.mediaBtn} type="button">
            <FaVideo style={{ color: '#4facfe' }} />
            <span>Video</span>
          </button>
          <button className={styles.mediaBtn} type="button">
            <FaSmile style={{ color: '#ffd166' }} />
            <span>Feeling</span>
          </button>
          <button className={styles.mediaBtn} type="button">
            <FaMapMarkerAlt style={{ color: '#ef476f' }} />
            <span>Location</span>
          </button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onPublish}
          disabled={!canPublish}
          loading={publishing}
        >
          {publishing ? 'Posting...' : 'Post'}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={onFileChange}
      />
    </div>
  );
};

export default CreatePost;