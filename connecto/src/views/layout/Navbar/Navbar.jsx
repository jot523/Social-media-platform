/**
 * Navbar Component
 * Navigation bar with search, notifications, and user menu
 */

import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaUser, FaCommentDots, 
  FaPlayCircle, FaBell, FaCog, FaSignOutAlt, FaMoon, FaSun, FaPlusCircle,
  FaCheckCircle
} from 'react-icons/fa';
import { AuthContext } from '../../../Context/AuthContext';
import Avatar from '../../components/common/Avatar/Avatar';
import Button from '../../components/common/Button/Button';
import { getImageUrl } from '../../../services/utils/imageUtils';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const searchRef = useRef(null);

  // Fetch search results on input change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.warn("Dropdown search failed", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      if (/^[0-9a-fA-F]{24}$/.test(query)) {
        navigate(`/profile/${query}`);
      } else if (query.startsWith('@')) {
        navigate(`/profile/${query.substring(1)}`);
      } else {
        navigate(`/explore?q=${encodeURIComponent(query)}`);
      }
      setSearchQuery('');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const navItems = [
    { icon: <FaHome />, label: 'Home', path: '/' },
    { icon: <FaPlusCircle />, label: 'Create', path: '/?create=true' },
    { icon: <FaCommentDots />, label: 'Chat', path: '/chat' },
    { icon: <FaPlayCircle />, label: 'Reels', path: '/reels' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <span>C</span>
          </div>
          <span className={styles.logoText}>CONNECTO</span>
        </Link>

        {/* Search Bar */}
        <form className={styles.searchForm} onSubmit={handleSearch} ref={searchRef}>
          <div className={styles.searchInputWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search users, posts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className={styles.searchInput}
            />
          </div>

          {showSearchDropdown && searchResults.length > 0 && (
            <div className={styles.searchDropdown}>
              {searchResults.map((u) => (
                <div
                  key={u._id}
                  className={styles.searchItem}
                  onClick={() => {
                    navigate(`/profile/${u._id}`);
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                >
                  <img
                    src={getImageUrl(u.avatar) || "https://randomuser.me/api/portraits/lego/1.jpg"}
                    alt={u.username}
                    className={styles.searchItemAvatar}
                  />
                  <div className={styles.searchItemInfo}>
                    <div className={styles.searchItemName}>
                      {u.fullName}
                      {u.isVerified && <FaCheckCircle className={styles.verifiedBadge} style={{ color: '#0095f6', marginLeft: '4px', fontSize: '0.8rem' }} />}
                    </div>
                    <div className={styles.searchItemUsername}>@{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Navigation Items */}
        <div className={styles.navItems}>
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`${styles.navItem} ${window.location.pathname === item.path ? styles.active : ''}`}
              title={item.label}
            >
              {item.icon}
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className={styles.navActions}>
          
          {/* Notifications */}
          <div className={styles.notificationWrapper}>
            <button
              className={styles.notificationBtn}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <FaBell />
              <span className={styles.notificationBadge}>3</span>
            </button>
            
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.dropdownHeader}>
                  <h3>Notifications</h3>
                  <Button variant="link" size="sm">Mark all read</Button>
                </div>
                <div className={styles.notificationList}>
                  <div className={styles.notificationItem}>
                    <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" size="sm" />
                    <div className={styles.notificationContent}>
                      <p><strong>Sarah Cruz</strong> liked your post</p>
                      <span className={styles.notificationTime}>2 minutes ago</span>
                    </div>
                  </div>
                  <div className={styles.notificationItem}>
                    <Avatar src="https://randomuser.me/api/portraits/men/32.jpg" size="sm" />
                    <div className={styles.notificationContent}>
                      <p><strong>John Anderson</strong> started following you</p>
                      <span className={styles.notificationTime}>1 hour ago</span>
                    </div>
                  </div>
                </div>
                <div className={styles.dropdownFooter}>
                  <Button variant="link" fullWidth>View all notifications</Button>
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            className={styles.themeToggle}
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* User Menu */}
          <div className={styles.userMenuWrapper}>
            <button
              className={styles.userMenuBtn}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <Avatar
                src={user?.avatar}
                alt={user?.fullName}
                size="sm"
                isVerified={user?.isVerified}
              />
            </button>
            
            {showUserMenu && (
              <div className={styles.userDropdown}>
                <div className={styles.userInfo}>
                  <Avatar
                    src={user?.avatar}
                    alt={user?.fullName}
                    size="md"
                    isVerified={user?.isVerified}
                  />
                  <div>
                    <h4>{user?.fullName}</h4>
                    <p>@{user?.username}</p>
                  </div>
                </div>
                
                <div className={styles.dropdownDivider} />
                
                <Link to="/profile" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                  <FaUser />
                  <span>Profile</span>
                </Link>
                <Link to="/profile?settings=true" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                  <FaCog />
                  <span>Settings</span>
                </Link>
                
                <div className={styles.dropdownDivider} />
                
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;