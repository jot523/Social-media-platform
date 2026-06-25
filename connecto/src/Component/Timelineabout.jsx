import React, { useState, useEffect, useContext } from "react";
import styles from "../css/Timelineabout.module.css";
import { AuthContext } from "../Context/AuthContext";
import { FaThumbsUp, FaCommentDots } from "react-icons/fa";
import { getImageUrl } from "../services/utils/imageUtils";

function Timelineabout() {
  const { user, token } = useContext(AuthContext);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (user) {
      // Fetch posts specifically created by the user
      // For now, since we may not have a /api/users/:id/posts route,
      // we can fetch all posts and filter, or just fetch all posts if it's mock
      fetch("/api/posts")
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          // Filter out posts that belong to the logged-in user
          const postsArr = data.posts || data || [];
          const myPosts = postsArr.filter(p => p.user?._id === user._id || p.user?.username === user.username);
          setUserPosts(myPosts);
        })
        .catch(err => console.log(err));
    }
  }, [user]);

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>

        {/* Reusing cover styling for consistency */}
        <div className={styles.coverSection}>
          <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200" alt="cover" className={styles.coverImg} />
          <div className={styles.coverOverlay}>
            <div className={styles.profileImageWrap}>
              <img src={getImageUrl(user?.avatar) || "https://randomuser.me/api/portraits/lego/1.jpg"} alt="profile" className={styles.profileImg} />
            </div>
            <div className={styles.topNav}>
              <a href="/timelineabout">Timeline</a>
              <a href="/profile">About</a>
              <a href="/">Album</a>
              <a href="/">Friends</a>
            </div>
            <div className={styles.followersBox}>
              <span>Timeline view</span>
            </div>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.mainContent}>
            
            <div className={styles.userHeader}>
              <div>
                <h2>{user?.fullName || 'User Name'}</h2>
                <p>Timeline of your posts</p>
              </div>
            </div>

            {userPosts.length === 0 ? (
              <div className={styles.infoBlock}>
                <p>No posts found. Go to the Newsfeed to create your first post!</p>
              </div>
            ) : (
              userPosts.map(post => (
                <div className={styles.infoBlock} key={post._id}>
                   <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                     <img src={getImageUrl(post.user?.avatar) || "https://randomuser.me/api/portraits/lego/1.jpg"} alt="user" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}/>
                     <div>
                       <h4 style={{ margin: 0 }}>{post.user?.fullName || "User"}</h4>
                       <small>{new Date(post.createdAt).toLocaleString()}</small>
                     </div>
                   </div>
                   
                   {post.image && <img src={getImageUrl(post.image)} alt="post" style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }}/>}
                   <p>{post.caption}</p>
                   
                   <div style={{ display: 'flex', gap: '15px', color: '#65676b', marginTop: '15px', borderTop: '1px solid #e0e0e0', paddingTop: '10px' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                       <FaThumbsUp /> {post.likes?.length || 0}
                     </span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                       <FaCommentDots /> {post.comments?.length || 0}
                     </span>
                   </div>
                </div>
              ))
            )}

          </div>

          <div className={styles.activitySidebar}>
            <h4>Recent Activity</h4>
            <div className={styles.activityItem}>
              <div className={styles.activityLine}></div>
              <div className={styles.activityText}>
                <span>You viewed your timeline</span>
                <span>Just now</span>
              </div>
            </div>
            {userPosts.slice(0, 3).map((post, idx) => (
              <div className={styles.activityItem} key={idx}>
                <div className={styles.activityLine}></div>
                <div className={styles.activityText}>
                  <span>You created a post</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timelineabout;