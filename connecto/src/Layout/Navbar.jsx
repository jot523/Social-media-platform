import React, { useState, useContext, useEffect, useRef } from "react";
import styles from "../css/Navbar.module.css";
import { FaSearch, FaBell, FaHome, FaPlayCircle, FaCommentDots, FaNewspaper, FaUser, FaSun, FaMoon, FaPlus, FaCompass } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

function Navbar() {
  const { user, token } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();


  const [moodFeedActive, setMoodFeedActive] = useState(localStorage.getItem('moodFeedActive') === 'true');
  const [activeMood, setActiveMood] = useState(localStorage.getItem('selectedMood'));
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const moodDropdownRef = useRef(null);

  const MOOD_EMOJIS = {
    Happy: '😊',
    Sad: '😢',
    Stressed: '😰',
    Bored: '🥱',
    Excited: '🤩',
    Tired: '😴',
    Focused: '🧠'
  };

 
  useEffect(() => {
    const checkMood = () => {
      setMoodFeedActive(localStorage.getItem('moodFeedActive') === 'true');
      setActiveMood(localStorage.getItem('selectedMood'));
    };
    checkMood();
    window.addEventListener('connectoMoodUpdate', checkMood);
    return () => window.removeEventListener('connectoMoodUpdate', checkMood);
  }, []);

  const handleNavbarMoodSelect = async (moodName) => {
    setActiveMood(moodName);
    setMoodFeedActive(true);
    localStorage.setItem('selectedMood', moodName);
    localStorage.setItem('moodFeedActive', 'true');
    setShowMoodDropdown(false);
    window.dispatchEvent(new Event('connectoMoodUpdate'));

    if (token) {
      try {
        await fetch('/api/mood/signal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ mood: moodName, confidence: 1.0 })
        });
      } catch (err) {
        console.error('Failed to send mood signal:', err);
      }
    }
  };

  const handleNavbarDisableMoodFeed = async () => {
    setMoodFeedActive(false);
    setActiveMood(null);
    localStorage.setItem('moodFeedActive', 'false');
    localStorage.removeItem('selectedMood');
    setShowMoodDropdown(false);
    window.dispatchEvent(new Event('connectoMoodUpdate'));

    if (token) {
      try {
        await fetch('/api/mood/signal', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to clear mood signal:', err);
      }
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true';
    setDarkMode(saved);
    document.documentElement.setAttribute('data-theme', saved ? 'dark' : 'light');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

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
      
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, token]);


  const handleSearchSubmit = (e) => {
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
      setShowSearch(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (moodDropdownRef.current && !moodDropdownRef.current.contains(e.target)) {
        setShowMoodDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {}
  };

  return (
    <nav className={styles.navbar}>
      
      <div className={styles.logo}>
        <div className={styles.logoIcon}>C</div>
        <h2>CONNECTO</h2>
      </div>

     
      <form onSubmit={handleSearchSubmit} className={styles.searchBox} ref={searchRef}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search people, posts..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
        />
        {showSearch && searchResults.length > 0 && (
          <div className={styles.searchDropdown}>
            {searchResults.map(u => (
              <div
                key={u._id}
                className={styles.searchItem}
                onClick={() => {
                  navigate(`/profile/${u._id}`);
                  setSearchQuery('');
                  setShowSearch(false);
                }}
              >
                <img src={u.avatar} alt={u.username} />
                <div>
                  <span className={styles.searchName}>{u.fullName}</span>
                  <span className={styles.searchUsername}>@{u.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>

      <div className={styles.menu}>
        <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>
          <FaHome /> <span>Home</span>
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaCompass /> <span>Explore</span>
        </NavLink>
        <NavLink to="/reels" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaPlayCircle /> <span>Reels</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaCommentDots /> <span>Chat</span>
        </NavLink>
        <NavLink to="/activity" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaBell /> <span>Activity</span>
        </NavLink>
        <NavLink to="/newsfeed" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaNewspaper /> <span>Feed</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? styles.active : ''}>
          <FaUser /> <span>Profile</span>
        </NavLink>
      </div>

      
      <div className={styles.iconButtons}>
     
        <button className={styles.iconBtn} onClick={toggleDarkMode} title="Toggle theme">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

      
        {moodFeedActive && activeMood && (
          <div ref={moodDropdownRef} style={{ position: 'relative' }}>
            <button 
              className={`${styles.iconBtn} ${styles.moodIndicatorBtn}`}
              onClick={() => setShowMoodDropdown(!showMoodDropdown)}
              title={`Mood AI active: ${activeMood}`}
            >
              <span className={styles.navbarMoodEmoji}>{MOOD_EMOJIS[activeMood] || '😊'}</span>
              <span className={styles.pulseDot}></span>
            </button>
            
            {showMoodDropdown && (
              <div className={styles.moodDropdownMenu}>
                <div className={styles.moodDropdownHeader}>
                  <h4>Mood AI Feed</h4>
                  <span className={styles.moodDropdownStatus}>On</span>
                </div>
                <div className={styles.moodDropdownList}>
                  {Object.keys(MOOD_EMOJIS).map(moodName => (
                    <button 
                      key={moodName}
                      className={`${styles.moodDropdownItem} ${activeMood === moodName ? styles.activeMoodItem : ''}`}
                      onClick={() => handleNavbarMoodSelect(moodName)}
                    >
                      <span className={styles.moodDropdownEmoji}>{MOOD_EMOJIS[moodName]}</span>
                      <span>{moodName}</span>
                    </button>
                  ))}
                  <button 
                    className={styles.moodDropdownDisableBtn}
                    onClick={handleNavbarDisableMoodFeed}
                  >
                    Turn Off
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className={`${styles.iconBtn} ${unreadCount > 0 ? styles.hasNotification : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className={styles.markReadBtn}>Mark all read</button>
                )}
              </div>
              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.notifEmpty}>No notifications yet</div>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <div key={n._id} className={`${styles.notifItem} ${!n.read ? styles.unread : ''}`}>
                      <img src={n.sender?.avatar} alt={n.sender?.username} />
                      <div>
                        <span className={styles.notifText}>
                          <strong>{n.sender?.username}</strong> {n.message}
                        </span>
                        <span className={styles.notifTime}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div 
                style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid var(--border, #e2e8f0)' }}
                onClick={() => { setShowNotifications(false); navigate('/activity'); }}
              >
                <span style={{ color: 'var(--primary, #4facfe)', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                  See all notifications
                </span>
              </div>
            </div>
          )}
        </div>

        
        <NavLink to="/profile" className={styles.profileBtn}>
          <img src={user?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt="profile" />
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
