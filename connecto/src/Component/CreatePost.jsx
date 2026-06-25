import React, { useState } from "react";
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import styles from "../css/CreatePost.module.css";

function CreatePost({ onClose, onPost }) {
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handlePost = () => {
    if (!caption.trim() && !imageUrl.trim()) return;
    if (onPost) {
      onPost({ caption, image: imageUrl });
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Create Post</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.userRow}>
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="you" />
            <span>Sarah Cruz</span>
          </div>

          <textarea
            className={styles.captionInput}
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          {imageUrl ? (
            <img src={imageUrl} alt="preview" className={styles.previewImage} />
          ) : (
            <div className={styles.imageUpload} onClick={() => {
              const url = prompt("Enter image URL:");
              if (url) setImageUrl(url);
            }}>
              <FaCloudUploadAlt className={styles.uploadIcon} />
              <p>Click to add a photo</p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.postBtn}
            onClick={handlePost}
            disabled={!caption.trim() && !imageUrl.trim()}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
