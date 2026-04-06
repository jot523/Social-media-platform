import React from "react";
import {
  FaUserFriends,FaMapMarkerAlt,FaUsers,FaCommentDots,FaImage,FaVideo,FaPencilAlt,FaCamera,FaVideo as FaVideoIcon,FaMapMarkedAlt,
  FaThumbsUp,FaThumbsDown,FaVolumeUp, FaExpand, FaEllipsisV, FaPlay
} from "react-icons/fa";
import "../css/Newsfeed.css";
import sarab from "../img/sarab.jpg";
import cook from "../img/cook.jpg";
import cox from "../img/cox.jpg";
import carter from "../img/carter.jpg";



import girl from "../img/girl.jpg";


function Newsfeed() {
  const onlineUsers = [sarab, carter, cox, girl, girl, girl, cook, girl, carter];
  const followUsers = [
    { name: "Diana Amber", img: girl },
    { name: "Cris Haris", img: cox },
    { name: "Brian Walton", img: girl },
    { name: "Olivia Steward", img: girl },
    { name: "Sophia Page", img: sarab },
  ];

  return (
    <div className="social-page">
      <div className="social-container">
       
        <div className="left-sidebar">
          <div className="profile-mini-card">
            <img src={girl} alt="profile" className="mini-profile-img" />
            <div className="mini-profile-info">
              <h4>Sarah Cruz</h4>
              <p>1,299 followers</p>
            </div>
          </div>

          <div className="left-menu">
            <div className="menu-item">
              <span className="menu-icon green"><FaUserFriends /></span>
              <span>My Newsfeed</span>
            </div>
            <div className="menu-item">
              <span className="menu-icon purple"><FaMapMarkerAlt /></span>
              <span>People Nearby</span>
            </div>
            <div className="menu-item">
              <span className="menu-icon pink"><FaUsers /></span>
              <span>Friends</span>
            </div>
            <div className="menu-item">
              <span className="menu-icon orange"><FaCommentDots /></span>
              <span>Messages</span>
            </div>
            <div className="menu-item">
              <span className="menu-icon blue"><FaImage /></span>
              <span>Images</span>
            </div>
            <div className="menu-item">
              <span className="menu-icon maroon"><FaVideo /></span>
              <span>Videos</span>
            </div>
          </div>

          <div className="chat-online-box">
            <div className="chat-online-title">Chat online</div>
            <div className="online-users-grid">
              {onlineUsers.map((img, index) => (
                <div className="online-user" key={index}>
                  <img src={img} alt="online user" />
                  <span className="online-dot"></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div className="center-feed">
          <div className="post-create-box">
            <img src={girl} alt="profile" className="create-avatar" />
            <textarea placeholder="Write what you wish"></textarea>
            <div className="create-actions">
              <div className="create-icons">
                <FaPencilAlt />
                <FaCamera />
                <FaVideoIcon />
                <FaMapMarkedAlt />
              </div>
              <button>Publish</button>
            </div>
          </div>

          <div className="main-post-card">
            <img src={sarab} alt="post" className="main-post-image" />

            <div className="post-content">
              <div className="post-header">
                <div className="post-user">
                  <img src={girl} alt="user" />
                  <div>
                    <h4>
                      Alexis Clark <span>following</span>
                    </h4>
                    <p>Published a photo about 3 mins ago</p>
                  </div>
                </div>

                <div className="post-stats">
                  <span className="like">
                    <FaThumbsUp /> 13
                  </span>
                  <span className="dislike">
                    <FaThumbsDown /> 0
                  </span>
                </div>
              </div>

              <div className="post-text">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                  enim ad minim veniam, quis nostrud exercitation ullamco laboris
                  nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                  reprehenderit in voluptate velit esse cillum dolore eu fugiat
                  nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                  sunt in culpa qui officia deserunt mollit anim id est laborum.
                  😉 😉 😉
                </p>
              </div>

              <div className="comment-list">
                <div className="comment-item">
                  <img src={girl} alt="comment user" />
                  <p>
                    <span>Diana 😀</span> Lorem ipsum dolor sit amet, consectetur
                    adipisicing elit, sed do eiusmod tempor incididunt ut labore et
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  </p>
                </div>

                <div className="comment-item">
                  <img src={girl} alt="comment user" />
                  <p>
                    <span>John</span> Lorem ipsum dolor sit amet, consectetur
                    adipisicing elit, sed do eiusmod tempor incididunt ut labore et
                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  </p>
                </div>
              </div>

              <div className="comment-input-box">
                <img src={cox} alt="me" />
                <input type="text" placeholder="Post a comment" />
              </div>
            </div>
          </div>
        </div>

        
        <div className="right-sidebar">
          <h3>Who to Follow</h3>

          {followUsers.map((user, index) => (
            <div className="follow-item" key={index}>
              <img src={girl} alt={user.name} />
              <div>
                <h4>{user.name}</h4>
                <p>Add friend</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="video-post-card">
      <div className="video-top-image">
        <img src={girl} alt="post" />
        <div className="video-overlay-bar">
          <div className="video-left-controls">
            <FaPlay />
            <span>0:00 / 0:34</span>
          </div>

          <div className="video-right-controls">
            <FaVolumeUp />
            <FaExpand />
            <FaEllipsisV />
          </div>
        </div>
      </div>

      <div className="video-post-body">
        <div className="video-post-header">
          <div className="video-post-user">
            <img src={girl} alt="user" />
            <div>
              <h4>
                Sophia Lee <span>following</span>
              </h4>
              <p>Updated her status about 33 mins ago</p>
            </div>
          </div>

          <div className="video-post-likes">
            <span className="like-count">
              <FaThumbsUp /> 75
            </span>
            <span className="dislike-count">
              <FaThumbsDown /> 8
            </span>
          </div>
        </div>

        <div className="video-post-text">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>

        <div className="video-post-comments">
          <div className="video-comment-item">
            <img src={cox} alt="comment user" />
            <p>
              <span>Olivia</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. 😉 Ut enim ad minim veniam,
              quis nostrud
            </p>
          </div>

          <div className="video-comment-item">
            <img src={girl} alt="comment user" />
            <p>
              <span>Sarah</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
          </div>

          <div className="video-comment-item">
            <img src={girl} alt="comment user" />
            <p>
              <span>Linda</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>

        <div className="video-comment-input">
          <img src={girl} alt="me" />
          <input type="text" placeholder="Post a comment" />
        </div>
      </div>
    </div>

    <div className="text-post-card">
      <div className="text-post-body">
        
        <div className="text-post-header">
          <div className="text-user">
            <img src={cook} alt="user" />
            <div>
              <h4>
                Linda Lohan <span>following</span>
              </h4>
              <p>Published a photo about 1 hour ago</p>
            </div>
          </div>

          <div className="text-post-likes">
            <span className="like">
              <FaThumbsUp /> 23
            </span>
            <span className="dislike">
              <FaThumbsDown /> 4
            </span>
          </div>
        </div>

   
        <div className="text-post-content">
          <p>
            👍🏻👍🏻👍🏻 Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
            inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo
            enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
            consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
        </div>

   
        <div className="text-comments">
          <div className="text-comment-item">
            <img src={girl} alt="user" />
            <p>
              <span>Cris</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam 💪🏻
            </p>
          </div>
        </div>

       
        <div className="text-comment-input">
          <img src={girl} alt="me" />
          <input type="text" placeholder="Post a comment" />
        </div>
      </div>
    </div>
    <div className="video-post-card">
      <div className="video-top-image">
        <img src={girl} alt="post" />
        <div className="video-overlay-bar">
          <div className="video-left-controls">
            <FaPlay />
            <span>0:00 / 0:34</span>
          </div>

          <div className="video-right-controls">
            <FaVolumeUp />
            <FaExpand />
            <FaEllipsisV />
          </div>
        </div>
      </div>

      <div className="video-post-body">
        <div className="video-post-header">
          <div className="video-post-user">
            <img src={girl} alt="user" />
            <div>
              <h4>
                Sophia Lee <span>following</span>
              </h4>
              <p>Updated her status about 33 mins ago</p>
            </div>
          </div>

          <div className="video-post-likes">
            <span className="like-count">
              <FaThumbsUp /> 75
            </span>
            <span className="dislike-count">
              <FaThumbsDown /> 8
            </span>
          </div>
        </div>

        <div className="video-post-text">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>

        <div className="video-post-comments">
          <div className="video-comment-item">
            <img src={girl} alt="comment user" />
            <p>
              <span>Olivia</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. 😉 Ut enim ad minim veniam,
              quis nostrud
            </p>
          </div>

          <div className="video-comment-item">
            <img src={girl} alt="comment user" />
            <p>
              <span>Sarah</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
          </div>

          <div className="video-comment-item">
            <img src={girl} alt="comment user" />
            <p>
              <span>Linda</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>

        <div className="video-comment-input">
          <img src={girl} alt="me" />
          <input type="text" placeholder="Post a comment" />
        </div>
      </div>
    </div>
    <div className="video-post-card">
      <div className="video-top-image">
        <img src={girl} alt="post" />
        <div className="video-overlay-bar">
          <div className="video-left-controls">
            <FaPlay />
            <span>0:00 / 0:34</span>
          </div>

          <div className="video-right-controls">
            <FaVolumeUp />
            <FaExpand />
            <FaEllipsisV />
          </div>
        </div>
      </div>

      <div className="video-post-body">
        <div className="video-post-header">
          <div className="video-post-user">
            <img src={girl} alt="user" />
            <div>
              <h4>
                Sophia Lee <span>following</span>
              </h4>
              <p>Updated her status about 33 mins ago</p>
            </div>
          </div>

          <div className="video-post-likes">
            <span className="like-count">
              <FaThumbsUp /> 75
            </span>
            <span className="dislike-count">
              <FaThumbsDown /> 8
            </span>
          </div>
        </div>

        <div className="video-post-text">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>

        <div className="video-post-comments">
          <div className="video-comment-item">
            <img src={girl} alt="comment user" />
            <p>
              <span>Olivia</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. 😉 Ut enim ad minim veniam,
              quis nostrud
            </p>
          </div>

          <div className="video-comment-item">
            <img src={girl} alt="comment user" />
            <p>
              <span>Sarah</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
          </div>

          <div className="video-comment-item">
            <img src={girl} alt="comment user" />
            <p>
              <span>Linda</span> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>

        <div className="video-comment-input">
          <img src={girl} alt="me" />
          <input type="text" placeholder="Post a comment" />
        </div>
      </div>
    </div>
    
    </div>
  );
}

export default Newsfeed;