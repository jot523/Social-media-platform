import React, { useState, useEffect, useContext } from "react";
import { FaPlus, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "../css/Stories.module.css";
import CameraModal from "./CameraModal";
import { AuthContext } from "../Context/AuthContext";
import { buildHeaders, jsonHeaders } from "./authFetch";
import { getImageUrl } from "../services/utils/imageUtils";

const demoStories = [
  { user: { _id: "s1", username: "sarah_cruz", fullName: "Sarah Cruz", avatar: "https://randomuser.me/api/portraits/women/44.jpg" }, stories: [{ mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", caption: "Bali vibes 🌅" }], viewed: false },
  { user: { _id: "s2", username: "john_doe", fullName: "John", avatar: "https://randomuser.me/api/portraits/men/32.jpg" }, stories: [{ mediaUrl: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400", caption: "Central Park morning 🌳" }], viewed: false },
  { user: { _id: "s3", username: "diana_amber", fullName: "Diana", avatar: "https://randomuser.me/api/portraits/women/65.jpg" }, stories: [{ mediaUrl: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=400", caption: "Cooking day 🍝" }], viewed: true },
  { user: { _id: "s4", username: "alex_smith", fullName: "Alex", avatar: "https://randomuser.me/api/portraits/men/45.jpg" }, stories: [{ mediaUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400", caption: "Gym time 💪" }], viewed: false },
  { user: { _id: "s5", username: "sophia_lee", fullName: "Sophia", avatar: "https://randomuser.me/api/portraits/women/21.jpg" }, stories: [{ mediaUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400", caption: "Santorini 🇬🇷" }], viewed: true },
  { user: { _id: "s6", username: "emma_wilson", fullName: "Emma", avatar: "https://randomuser.me/api/portraits/women/12.jpg" }, stories: [{ mediaUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400", caption: "Chocolate cake 🎂" }], viewed: false },
  { user: { _id: "s7", username: "chris_harris", fullName: "Chris", avatar: "https://randomuser.me/api/portraits/men/76.jpg" }, stories: [{ mediaUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400", caption: "Morning run 🏃" }], viewed: false },
];

function Stories() {
  const { user, token } = useContext(AuthContext);
  const [storyGroups, setStoryGroups] = useState(demoStories);
  const [showCamera, setShowCamera] = useState(false);
  const [viewingStory, setViewingStory] = useState(null); // { groupIndex, storyIndex }
  const [progress, setProgress] = useState(0);
  const [viewedGroups, setViewedGroups] = useState({});

  // Fetch stories from API
  useEffect(() => {
    if (!token) return;
    const fetchStories = async () => {
      try {
        const res = await fetch('/api/stories', {
          headers: buildHeaders(token)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setStoryGroups(data);
        }
      } catch (err) {}
    };
    fetchStories();
  }, [token]);

  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReaction = async (storyId, emoji) => {
    if (!token) return;
    try {
      await fetch(`/api/stories/${storyId}/react`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({ emoji })
      });
    } catch (err) {}
  };

  const handleSendReply = async (storyId) => {
    if (!replyText.trim() || !token) return;
    try {
      await fetch(`/api/stories/${storyId}/reply`, {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify({ text: replyText })
      });
      setReplyText("");
      setIsPaused(false);
    } catch (err) {}
  };

  // Story progress timer
  useEffect(() => {
    if (viewingStory === null || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Auto advance to next story
          handleNextStory();
          return 0;
        }
        return prev + 2; // 5 seconds per story (100 / 2 = 50 ticks * 100ms = 5000ms)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [viewingStory, isPaused]);

  const openStory = (groupIndex) => {
    setViewingStory({ groupIndex, storyIndex: 0 });
    setViewedGroups(prev => ({ ...prev, [groupIndex]: true }));
  };

  const closeStory = () => {
    setViewingStory(null);
    setProgress(0);
    setIsPaused(false);
    setReplyText("");
  };

  const handleNextStory = () => {
    if (!viewingStory) return;
    const { groupIndex, storyIndex } = viewingStory;
    const group = storyGroups[groupIndex];

    if (storyIndex < group.stories.length - 1) {
      setViewingStory({ groupIndex, storyIndex: storyIndex + 1 });
    } else if (groupIndex < storyGroups.length - 1) {
      setViewingStory({ groupIndex: groupIndex + 1, storyIndex: 0 });
      setViewedGroups(prev => ({ ...prev, [groupIndex + 1]: true }));
    } else {
      closeStory();
    }
  };

  const handlePrevStory = () => {
    if (!viewingStory) return;
    const { groupIndex, storyIndex } = viewingStory;

    if (storyIndex > 0) {
      setViewingStory({ groupIndex, storyIndex: storyIndex - 1 });
    } else if (groupIndex > 0) {
      const prevGroup = storyGroups[groupIndex - 1];
      setViewingStory({ groupIndex: groupIndex - 1, storyIndex: prevGroup.stories.length - 1 });
    }
  };

  const currentGroup = viewingStory !== null ? storyGroups[viewingStory.groupIndex] : null;
  const currentStory = currentGroup ? currentGroup.stories[viewingStory.storyIndex] : null;

  return (
    <>
      <div className={styles.storiesWrapper}>
        <div className={styles.storiesContainer}>
          {/* Add Story */}
          <div className={styles.addStory} onClick={() => setShowCamera(true)}>
            <div className={styles.addStoryCircle}>
              <img
                src={getImageUrl(user?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                alt="your story"
                className={styles.addStoryAvatar}
              />
            </div>
            <span className={styles.storyName}>Your Story</span>
          </div>

          {/* Story Items */}
          {storyGroups.map((group, idx) => (
            <div
              key={group.user._id || idx}
              className={styles.storyItem}
              onClick={() => openStory(idx)}
            >
              <div className={viewedGroups[idx] ? styles.storyRingViewed : styles.storyRing}>
                <img
                  src={getImageUrl(group.user.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                  alt={group.user.username}
                  className={styles.storyAvatar}
                />
              </div>
              <span className={styles.storyName}>{group.user.fullName || group.user.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && <CameraModal onClose={() => setShowCamera(false)} />}

      {/* Story Viewer */}
      {viewingStory !== null && currentGroup && currentStory && (
        <div className={styles.storyModal} onClick={closeStory}>
          <div className={styles.storyViewer} onClick={e => e.stopPropagation()}>
            {/* Progress bars */}
            <div className={styles.storyProgress}>
              {currentGroup.stories.map((_, i) => (
                <div key={i} className={styles.storyProgressBar}>
                  <div
                    className={styles.storyProgressFill}
                    style={{
                      width: i < viewingStory.storyIndex ? '100%' :
                             i === viewingStory.storyIndex ? `${progress}%` : '0%'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className={styles.storyViewerHeader}>
              <div className={styles.storyViewerUser}>
                <img src={getImageUrl(currentGroup.user.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt="" className={styles.storyViewerAvatar} />
                <div>
                  <div className={styles.storyViewerName}>{currentGroup.user.fullName || currentGroup.user.username}</div>
                  <div className={styles.storyViewerTime}>Just now</div>
                </div>
              </div>
              <button className={styles.storyCloseBtn} onClick={closeStory}>
                <FaTimes />
              </button>
            </div>

            {/* Story Media */}
            <img src={getImageUrl(currentStory.mediaUrl)} alt="story" className={styles.storyMedia} />

            {/* Caption */}
            {currentStory.caption && (
              <div className={styles.storyCaption}>{currentStory.caption}</div>
            )}

            {/* Navigation */}
            <button className={`${styles.storyNavBtn} ${styles.storyNavPrev}`} onClick={handlePrevStory}>
              <FaChevronLeft />
            </button>
            <button className={`${styles.storyNavBtn} ${styles.storyNavNext}`} onClick={handleNextStory}>
              <FaChevronRight />
            </button>

            {/* Quick Reactions & Reply Input */}
            <div className={styles.storyFeedbackArea}>
              <div className={styles.quickReactions}>
                {["❤️", "🙌", "🔥", "😂", "😮", "😢"].map(emoji => (
                  <button 
                    key={emoji} 
                    className={styles.reactionBtn}
                    onClick={() => handleReaction(currentStory._id, emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className={styles.replyInputBox}>
                <input
                  type="text"
                  placeholder="Send message..."
                  className={styles.replyInput}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  onKeyDown={e => e.key === 'Enter' && handleSendReply(currentStory._id)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Stories;
