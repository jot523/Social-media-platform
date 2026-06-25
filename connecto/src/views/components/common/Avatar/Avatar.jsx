/**
 * Avatar Component
 * Reusable avatar component with neomorphism styling
 */

import React from 'react';
import { getImageUrl } from '../../../../services/utils/imageUtils';
import styles from './Avatar.module.css';

const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  isOnline = false,
  isVerified = false,
  onClick,
  className = '',
  ...props
}) => {
  const avatarClasses = [
    styles.avatar,
    styles[`avatar--${size}`],
    onClick ? styles['avatar--clickable'] : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  const handleError = (e) => {
    e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
  };

  return (
    <div className={avatarClasses} onClick={handleClick} {...props}>
      <img
        src={getImageUrl(src) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
        alt={alt}
        className={styles.avatar__image}
        onError={handleError}
        loading="lazy"
      />
      
      {isOnline && (
        <div className={styles.avatar__onlineIndicator} />
      )}
      
      {isVerified && (
        <div className={styles.avatar__verifiedBadge}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V4.5C15 3.4 14.6 2.4 13.9 1.7L12 0L10.1 1.7C9.4 2.4 9 3.4 9 4.5V6.5L3 7V9L9 9.5V11.5C9 12.6 9.4 13.6 10.1 14.3L12 16L13.9 14.3C14.6 13.6 15 12.6 15 11.5V9.5L21 9ZM12 13.5L10.2 11.7C10.1 11.6 10 11.4 10 11.2V9.8L12 9.5L14 9.8V11.2C14 11.4 13.9 11.6 13.8 11.7L12 13.5Z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default Avatar;