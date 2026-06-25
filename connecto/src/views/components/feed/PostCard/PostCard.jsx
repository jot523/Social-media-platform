/**
 * PostCard Component (View Layer)
 * Pure presentation component for a single post
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane,
  FaRegBookmark, FaBookmark, FaEllipsisH, FaCheckCircle, FaPaperPlane
} from 'react-icons/fa';
import Avatar from '../../../components/common/Avatar/Avatar';
import { getImageUrl } from '../../../../services/utils/imageUtils';
import styles from './PostCard.module.css';

const PostCard = ({
  post,
  currentUser,
  isLiked = false,
  isSaved = false,
  commentInput = '',
  isCommentsExpanded = false,
  isMenuOpen = false,
  onLike,
  onSave,
  onComment,
  onCommentInputChange,
  onToggleComments,
  onToggleMenu,
  onDelete,
  onShare,
  onReport,
}) => {
  const isOwner =
    post.user?._id === currentUser?._id ||
    post.user?.username === currentUser?.username;

  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;
  const sharesCount = post.shares || 0;

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (commentInput.trim()) onComment(commentInput);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <article className={styles.postCard}>
      {/* Post Header */}
      <div className={styles.postHeader}>
        <Link to={`/profile/${post.user?._id || post.user?.username}`} className={styles.postUser}>
          <Avatar
            src={post.user?.avatar}
            alt={post.user?.username}
            size="md"
            isVerified={post.user?.isVerified}
          />
          <div className={styles.postUserInfo}>
            <h4 className={styles.postUserName}>
              {post.user?.fullName || post.user?.username}
              {post.user?.isVerified && (
                <FaCheckCircle className={styles.verifiedBadge} />
              )}
            </h4>
            <span className={styles.postTime}>{timeAgo(post.createdAt)}</span>
          </div>
        </Link>

        {/* Post Menu */}
        <div className={styles.postMenuWrapper}>
          <button
            className={styles.postMenuBtn}
            onClick={onToggleMenu}
            aria-label="Post options"
          >
            <FaEllipsisH />
          </button>
          {isMenuOpen && (
            <div className={styles.postMenu}>
              {isOwner && (
                <button className={`${styles.postMenuItem} ${styles.danger}`} onClick={onDelete}>
                  Delete Post
                </button>
              )}
              <button className={styles.postMenuItem} onClick={onReport}>
                Report
              </button>
              <button className={styles.postMenuItem} onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Caption */}
      {post.caption && (
        <div className={styles.postCaption}>
          <Link to={`/profile/${post.user?._id || post.user?.username}`} className={styles.captionUserLink}>
            <strong>{post.user?.username} </strong>
          </Link>
          {post.caption}
        </div>
      )}

      {/* Post Image */}
      {post.image && (
        <div className={styles.postImageWrapper}>
          <img
            src={getImageUrl(post.image)}
            alt="post"
            className={styles.postImage}
            loading="lazy"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className={styles.postActions}>
        <div className={styles.postActionsLeft}>
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={onLike}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{likeCount > 0 ? likeCount : ''}</span>
          </button>

          <button
            className={styles.actionBtn}
            onClick={onToggleComments}
            aria-label="Comments"
          >
            <FaRegComment />
            <span>{commentCount > 0 ? commentCount : ''}</span>
          </button>

          <button className={styles.actionBtn} onClick={onShare} aria-label="Share">
            <FaRegPaperPlane />
            {sharesCount > 0 && <span>{sharesCount}</span>}
          </button>
        </div>

        <button
          className={`${styles.actionBtn} ${isSaved ? styles.saved : ''}`}
          onClick={onSave}
          aria-label={isSaved ? 'Unsave' : 'Save'}
        >
          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
        </button>
      </div>

      {/* Like Count */}
      {likeCount > 0 && (
        <div className={styles.likeCount}>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </div>
      )}

      {/* Comments Section */}
      {commentCount > 0 && (
        <div className={styles.commentsSection}>
          {post.comments
            ?.slice(0, isCommentsExpanded ? undefined : 2)
            .map((comment, idx) => (
              <div key={comment._id || idx} className={styles.commentItem}>
                <Link to={`/profile/${comment.user?._id || comment.user?.username}`}>
                  <Avatar
                    src={comment.user?.avatar}
                    alt={comment.user?.username}
                    size="xs"
                  />
                </Link>
                <div className={styles.commentBubble}>
                  <Link to={`/profile/${comment.user?._id || comment.user?.username}`} className={styles.commentUserLink}>
                    <strong>{comment.user?.username} </strong>
                  </Link>
                  {comment.text}
                </div>
              </div>
            ))}

          {!isCommentsExpanded && commentCount > 2 && (
            <button className={styles.viewAllComments} onClick={onToggleComments}>
              View all {commentCount} comments
            </button>
          )}
        </div>
      )}

      {/* Add Comment */}
      <div className={styles.addCommentBox}>
        <Avatar
          src={currentUser?.avatar}
          alt={currentUser?.username}
          size="xs"
        />
        <input
          type="text"
          className={styles.addCommentInput}
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => onCommentInputChange(e.target.value)}
          onKeyDown={handleCommentKeyDown}
        />
        <button
          className={styles.sendCommentBtn}
          onClick={() => commentInput.trim() && onComment(commentInput)}
          disabled={!commentInput.trim()}
          aria-label="Send comment"
        >
          <FaPaperPlane />
        </button>
      </div>
    </article>
  );
};

export default PostCard;