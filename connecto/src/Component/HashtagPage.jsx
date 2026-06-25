import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaComment, FaArrowLeft, FaHashtag, FaClone } from "react-icons/fa";
import styles from "../css/Explore.module.css";
import { AuthContext } from "../Context/AuthContext";
import { buildHeaders } from "./authFetch";
import { getImageUrl } from "../services/utils/imageUtils";

function HashtagPage() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("top"); // "top" or "recent"

  useEffect(() => {
    const fetchHashtagPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/explore/hashtag/${tag}?sort=${activeTab}`, {
          headers: buildHeaders(token)
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setTotalCount(data.totalCount || 0);
        }
      } catch (err) {
        console.warn("Failed to fetch hashtag posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHashtagPosts();
  }, [tag, activeTab, token]);

  return (
    <div className={styles.hashtagPage}>
      <div className={styles.hashtagContainer}>
        {/* Back Button */}
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        {/* Header */}
        <div className={styles.hashtagHeader}>
          <div className={styles.hashtagHeaderIcon}>
            <FaHashtag />
          </div>
          <div className={styles.hashtagHeaderInfo}>
            <h1>#{tag}</h1>
            <p>
              {totalCount} {totalCount === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.hashtagTabs}>
          <button
            className={`${styles.hashtagTab} ${activeTab === "top" ? styles.active : ""}`}
            onClick={() => setActiveTab("top")}
          >
            Top Posts
          </button>
          <button
            className={`${styles.hashtagTab} ${activeTab === "recent" ? styles.active : ""}`}
            onClick={() => setActiveTab("recent")}
          >
            Most Recent
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No posts yet</h3>
            <p>Be the first to post with #{tag}</p>
          </div>
        ) : (
          <div className={styles.exploreGrid}>
            {posts.map((post, idx) => (
              <div
                key={post._id}
                className={`${styles.gridItem} ${idx % 10 === 0 ? styles.large : ""}`}
                onClick={() => navigate(`/profile/${post.user?._id}`)}
              >
                {post.image ? (
                  <img src={getImageUrl(post.image)} alt="post" />
                ) : (
                  <div className={styles.textPostGrid}>
                    <p>{post.caption}</p>
                  </div>
                )}
                {post.images?.length > 1 && (
                  <div className={styles.carouselBadge}>
                    <FaClone />
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
        )}
      </div>
    </div>
  );
}

export default HashtagPage;
