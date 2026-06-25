/**
 * AuthPage Component (View Layer)
 * Landing / Login / Register page
 */

import React from 'react';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaIdCard } from 'react-icons/fa';
import { useAuthViewModel } from '../../../viewmodels/auth/useAuthViewModel';
import Button from '../../components/common/Button/Button';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const {
    activeTab,
    loginForm,
    registerForm,
    submitting,
    error,
    success,
    showPassword,
    handleLoginChange,
    handleRegisterChange,
    handleLogin,
    handleRegister,
    switchTab,
    setShowPassword,
  } = useAuthViewModel();

  return (
    <div className={styles.authPage}>
      {/* Background Decoration */}
      <div className={styles.bgDecoration}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <div className={styles.bgCircle3} />
      </div>

      <div className={styles.authContainer}>
        {/* Left Panel - Branding */}
        <div className={styles.brandPanel}>
          <div className={styles.brandLogo}>
            <div className={styles.logoIcon}>C</div>
            <h1 className={styles.logoText}>CONNECTO</h1>
          </div>
          <p className={styles.brandTagline}>
            Connect with friends, share moments, and discover the world.
          </p>
          <div className={styles.featureList}>
            {[
              { emoji: '📸', text: 'Share photos & stories' },
              { emoji: '🎬', text: 'Watch & create reels' },
              { emoji: '💬', text: 'Real-time messaging' },
              { emoji: '🔔', text: 'Live notifications' },
            ].map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureEmoji}>{f.emoji}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className={styles.formPanel}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
              onClick={() => switchTab('login')}
            >
              Sign In
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'register' ? styles.activeTab : ''}`}
              onClick={() => switchTab('register')}
            >
              Sign Up
            </button>
          </div>

          {/* Error / Success Messages */}
          {error && <div className={styles.errorMsg}>{error}</div>}
          {success && <div className={styles.successMsg}>{success}</div>}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form className={styles.form} onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <FaEnvelope className={styles.inputIcon} />
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Email address"
                  value={loginForm.email}
                  onChange={(e) => handleLoginChange('email', e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className={styles.inputGroup}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => handleLoginChange('password', e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={submitting}
              >
                Sign In
              </Button>

              <p className={styles.switchText}>
                Don't have an account?{' '}
                <button type="button" className={styles.switchLink} onClick={() => switchTab('register')}>
                  Sign Up
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form className={styles.form} onSubmit={handleRegister}>
              <div className={styles.inputGroup}>
                <FaIdCard className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Full name"
                  value={registerForm.fullName}
                  onChange={(e) => handleRegisterChange('fullName', e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className={styles.inputGroup}>
                <FaUser className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Username"
                  value={registerForm.username}
                  onChange={(e) => handleRegisterChange('username', e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className={styles.inputGroup}>
                <FaEnvelope className={styles.inputIcon} />
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Email address"
                  value={registerForm.email}
                  onChange={(e) => handleRegisterChange('email', e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className={styles.inputGroup}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Password (min 6 characters)"
                  value={registerForm.password}
                  onChange={(e) => handleRegisterChange('password', e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className={styles.inputGroup}>
                <FaLock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Confirm password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
                disabled={submitting}
              >
                Create Account
              </Button>

              <p className={styles.switchText}>
                Already have an account?{' '}
                <button type="button" className={styles.switchLink} onClick={() => switchTab('login')}>
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;