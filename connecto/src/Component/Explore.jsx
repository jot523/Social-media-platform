import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaSearch, FaHeart, FaComment, FaCompass,
  FaCheckCircle, FaClone
} from "react-icons/fa";
import styles from "../css/Explore.module.css";
import { AuthContext } from "../Context/AuthContext";
import PostDetailModal from "./PostDetailModal";
import { buildHeaders } from "./authFetch";
import { getImageUrl } from "../services/utils/imageUtils";

const CATEGORIES = [
  { name: "All", emoji: "🔥" },
  { name: "travel", emoji: "✈️" },
  { name: "food", emoji: "🍕" },
  { name: "art", emoji: "🎨" },
  { name: "fitness", emoji: "💪" },
  { name: "tech", emoji: "💻" },
  { name: "music", emoji: "🎵" },
  { name: "photography", emoji: "📸" },
  { name: "fashion", emoji: "👗" },
  { name: "nature", emoji: "🌿" },
];

function Explore() {
  const { user, token, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [searchTab, setSearchTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);
  const [posts, setPosts] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setPostModalOpen(true);
  };

  // Fetch trending posts
  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        const categoryParam = activeCategory !== "All" ? `&category=${activeCategory}` : "";
        const res = await fetch(`/api/explore?limit=30${categoryParam}`, {
          headers: buildHeaders(token)
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.warn("Explore fetch failed");
      } finally {
        setLoading(false);
      }
    };
    if (!searchQuery.trim()) {
      fetchExplore();
      setSearchResults(null);
    }
  }, [activeCategory, searchQuery, refreshTrigger, token]);

  // Search with debounce and sync with URL query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      if (searchParams.get("q")) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("q");
        setSearchParams(newParams, { replace: true });
      }
      return;
    }
    const timer = setTimeout(async () => {
      if (searchParams.get("q") !== searchQuery) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("q", searchQuery);
        setSearchParams(newParams, { replace: true });
      }
      try {
        const res = await fetch(
          `/api/explore/search?q=${encodeURIComponent(searchQuery)}&type=${searchTab}`,
          {
            headers: buildHeaders(token)
          }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.warn("Search failed");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchTab, refreshTrigger, searchParams, setSearchParams, token]);

  const handleFollow = async (userId) => {
    const applyMockUpdate = () => {
      setUser(prev => {
        const following = [...(prev?.following || [])];
        const exists = following.some(id => (id._id || id) === userId);
        if (exists) return { ...prev, following: following.filter(id => (id._id || id) !== userId) };
        return { ...prev, following: [...following, userId] };
      });
    };

    if (!token) { applyMockUpdate(); return; }
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "PUT",
        headers: buildHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, following: data.following }));
      } else {
        applyMockUpdate();
      }
    } catch {
      applyMockUpdate();
    }
  };

  const isFollowing = (userId) =>
    user?.following?.some(id => (id._id || id) === userId);

  // Render search results
  if (searchResults) {
    return (
      <div className={styles.explorePage}>
        <div className={styles.exploreContainer}>
          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search people, hashtags, posts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.searchTabs}>
              {["all", "users", "hashtags", "posts"].map(tab => (
                <button
                  key={tab}
                  className={`${styles.searchTab} ${searchTab === tab ? styles.active : ""}`}
                  onClick={() => setSearchTab(tab)}
                >
                  {tab === "all" ? "Top" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className={styles.searchResults}>
            {/* Users */}
            {(searchTab === "all" || searchTab === "users") &&
              searchResults.users?.length > 0 && (
                <div className={styles.searchResultSection}>
                  <div className={styles.sectionTitle}>People</div>
                  {searchResults.users.map(u => (
                    <div key={u._id} className={styles.userResult}>
                      <img
                        src={getImageUrl(u.avatar) || "https://randomuser.me/api/portraits/lego/1.jpg"}
                        alt={u.username}
                        className={styles.userResultAvatar}
                        onClick={() => navigate(`/profile/${u._id}`)}
                        style={{ cursor: "pointer" }}
                      />
                      <div
                        className={styles.userResultInfo}
                        onClick={() => navigate(`/profile/${u._id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className={styles.userResultName}>
                          {u.fullName}
                          {u.isVerified && <FaCheckCircle className={styles.verifiedBadge} />}
                        </div>
                        <div className={styles.userResultUsername}>
                          @{u.username} · {u.followers?.length || 0} followers
                        </div>
                      </div>
                      {u._id !== user?._id && (
                        <button
                          className={`${styles.userResultFollowBtn} ${isFollowing(u._id) ? styles.following : ""}`}
                          onClick={() => handleFollow(u._id)}
                        >
                          {isFollowing(u._id) ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

            {/* Hashtags */}
            {(searchTab === "all" || searchTab === "hashtags") &&
              searchResults.hashtags?.length > 0 && (
                <div className={styles.searchResultSection}>
                  <div className={styles.sectionTitle}>Hashtags</div>
                  {searchResults.hashtags.map(h => (
                    <div
                      key={h.tag}
                      className={styles.hashtagResult}
                      onClick={() => navigate(`/explore/tag/${h.tag}`)}
                    >
                      <div className={styles.hashtagIcon}>#</div>
                      <div className={styles.hashtagInfo}>
                        <div className={styles.hashtagName}>#{h.tag}</div>
                        <div className={styles.hashtagCount}>
                          {h.count} {h.count === 1 ? "post" : "posts"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Posts */}
            {(searchTab === "all" || searchTab === "posts") &&
              searchResults.posts?.length > 0 && (
                <div className={styles.searchResultSection}>
                  <div className={styles.sectionTitle}>Posts</div>
                  <div className={styles.exploreGrid}>
                    {searchResults.posts.map((post, idx) => (
                      <div
                        key={post._id}
                        className={styles.gridItem}
                        onClick={() => handlePostClick(post._id)}
                      >
                        {post.image ? (
                          <img src={getImageUrl(post.image)} alt="post" />
                        ) : (
                          <div className={styles.textPostGrid}>
                            <p>{post.caption}</p>
                          </div>
                        )}
                        <div className={styles.gridOverlay}>
                          <span className={styles.gridStat}>
                            <FaHeart /> {post.likes?.length || 0}
                          </span>
                          <span className={styles.gridStat}>
                            <FaComment /> {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* No results */}
            {!searchResults.users?.length &&
              !searchResults.hashtags?.length &&
              !searchResults.posts?.length && (
                <div className={styles.emptyState}>
                  <FaSearch />
                  <h3>No results found</h3>
                  <p>Try searching for something else</p>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  // Default explore grid
  return (
    <div className={styles.explorePage}>
      <div className={styles.exploreContainer}>
        {/* Search Bar */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search people, hashtags, posts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Chips */}
        <div className={styles.categoryChips}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              className={`${styles.categoryChip} ${activeCategory === cat.name ? styles.active : ""}`}
              onClick={() => setActiveCategory(cat.name)}
            >
              <span className={styles.chipEmoji}>{cat.emoji}</span>
              {cat.name === "All" ? "For You" : `#${cat.name}`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <FaCompass />
            <h3>Explore CONNECTO</h3>
            <p>Posts from across the community will appear here</p>
          </div>
        ) : (
          <div className={styles.exploreGrid}>
            {posts.map((post, idx) => (
              <div
                key={post._id}
                className={`${styles.gridItem} ${idx % 10 === 0 ? styles.large : ""}`}
                onClick={() => handlePostClick(post._id)}
              >
                {post.image ? (
                  <img src={getImageUrl(post.image)} alt="post" />
                ) : (
                  <div className={styles.textPostGrid}>
                    <p>{post.caption}</p>
                  </div>
                )}
                {(post.images?.length > 1) && (
                  <div className={styles.carouselBadge}><FaClone /></div>
                )}
                <div className={styles.gridOverlay}>
                  <span className={styles.gridStat}>
                    <FaHeart /> {post.likes?.length || 0}
                  </span>
                  <span className={styles.gridStat}>
                    <FaComment /> {post.comments?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <PostDetailModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        postId={selectedPostId}
        onUpdate={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}

export default Explore;
