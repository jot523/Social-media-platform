/**
 * Button Component
 * Reusable button component with neomorphism styling and multiple variants
 */

import React from 'react';
import styles from './Button.module.css';

const Button = ({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    fullWidth ? styles['button--fullWidth'] : '',
    loading ? styles['button--loading'] : '',
    disabled ? styles['button--disabled'] : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <div className={styles.button__spinner}>
          <svg viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="32"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 32;16 16;0 32;0 32"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-16;-32;-32"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      );
    }

    if (icon) {
      return <span className={styles.button__icon}>{icon}</span>;
    }

    return null;
  };

  const renderContent = () => {
    if (loading && !children) {
      return 'Loading...';
    }

    if (iconPosition === 'left') {
      return (
        <>
          {renderIcon()}
          {children && <span className={styles.button__text}>{children}</span>}
        </>
      );
    }

    return (
      <>
        {children && <span className={styles.button__text}>{children}</span>}
        {renderIcon()}
      </>
    );
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

// Icon-only button variant
export const IconButton = ({
  icon,
  'aria-label': ariaLabel,
  size = 'md',
  ...props
}) => {
  return (
    <Button
      {...props}
      icon={icon}
      size={size}
      className={`${styles.button__iconOnly} ${props.className || ''}`}
      aria-label={ariaLabel}
    />
  );
};

// Button group component
export const ButtonGroup = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.buttonGroup} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Button;