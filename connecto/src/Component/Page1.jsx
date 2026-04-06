import React from "react";
import "../css/Page1.css";
import photo1 from '../img/photo1.png'
import googleplay from '../img/googleplay.jpg'
import appstore from '../img/app-store.jpg'
import socialmedia from '../img/socialmedia.jpg'
import tree from '../img/tree.jpg'
import phonewebp from '../img/phone.webp'
import friendpic from '../img/friendpic.jpg'




import {
  FaUserPlus,
  FaImage,
  FaComments,
  FaEdit,
  FaAngleDoubleDown,
  FaUser,FaCheck,

} from "react-icons/fa";

function Page1() {
  return (
    <div className="hero-wrapper">

      <div className="hero-section">
        <div className="overlay"></div>

        <div className="signup-card">
          <div className="brand">
            <span className="brand-icon"><img src={photo1} alt="" /></span>
            <span className="brand-text">CONNECTO</span>
          </div>

          <h2>Find My Friends</h2>
          <div className="line"></div>

          <p className="signup-text">
            Signup now and meet awesome
            <br />
            people around the world
          </p>

          <form className="signup-form">
            <input type="text" placeholder="Enter name" />
            <input type="email" placeholder="Enter email" />
            <input type="password" placeholder="Enter a password" />

            <p className="terms">
              By signing up you agree to the terms
            </p>

            <button type="submit">Signup</button>
          </form>

          <p className="login-link">Already have an account?</p>
        </div>
      </div>


      <div className="feature-section">
        <div className="down-arrow">
          <FaAngleDoubleDown />

        </div>

        <h1 className="big-title">social herd</h1>

        <div className="features">
          <div className="feature-item">
            <div className="icon-circle">
              <FaUserPlus />
            </div>
            <p>Make Friends</p>
          </div>

          <div className="feature-item">
            <div className="icon-circle">
              <FaImage />
            </div>
            <p>Publish Posts</p>
          </div>

          <div className="feature-item">
            <div className="icon-circle">
              <FaComments />
            </div>
            <p>Private Chats</p>
          </div>

          <div className="feature-item">
            <div className="icon-circle">
              <FaEdit />
            </div>
            <p>Create Polls</p>
          </div>
        </div>

        <h2 className="bottom-text">find awesome people like you</h2>
      </div>
      <div className="download-section">
        <div className="counter-box">
          <span>1</span>
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>4</span>
          <span>2</span>
        </div>

        <p className="counter-text">People Already Signed Up</p>

        <div className="map-card">
          <img src={socialmedia} alt="" />
        </div>

        <h1 className="download-title">download</h1>

        <div className="store-buttons">
          <button className="store-btn"><img src={appstore} alt="" /></button>
          <button className="store-btn"><img src={googleplay} alt="" /></button>
        </div>
        <p className="download-subtitle">stay connected anytime, anywhere</p>

        <div className="phone-mockup">
          <div className="phone-screen">
            <div className="phone-logo">Connecto</div>
          </div>
        </div>
      </div>

      <div className="stats-hero-section">
        <div className="stats-top-image">
          <img
            src={phonewebp}
            alt="people"
          />
        </div>

        <div className="stats-bottom-bg"></div>

        <div className="stats-circle">
          <div className="stats-line"></div>

          <div className="stats-item">
            <div className="stats-icon"><FaUser/></div>
            <h3>1,01,242</h3>
            <p>People registered</p>
          </div>

          <div className="stats-item">
            <div className="stats-icon"><FaImage/></div>
            <h3>21,01,242</h3>
            <p>Posts published</p>
          </div>

          <div className="stats-item">
            <div className="stats-icon"><FaCheck/></div>
            <h3>41,242</h3>
            <p>People online</p>
          </div>
        </div>
      </div>


      <div className="live-feed-section">
        <h1 className="live-feed-title">live feed</h1>

        <div className="live-users">
          <div className="live-user"><img src="https://randomuser.me/api/portraits/women/65.jpg" alt="" /><span></span></div>
          <div className="live-user"><img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" /><span></span></div>
          <div className="live-user"><img src="https://randomuser.me/api/portraits/men/45.jpg" alt="" /><span></span></div>
          <div className="live-user"><img src="https://randomuser.me/api/portraits/men/11.jpg" alt="" /><span></span></div>
          <div className="live-user"><img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" /><span></span></div>
          <div className="live-user"><img src="https://randomuser.me/api/portraits/women/21.jpg" alt="" /><span></span></div>
        </div>

        <h2 className="live-feed-subtitle">see what's happening now</h2>

        <div className="feed-grid">
          <div className="feed-column">
            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/women/12.jpg" alt="" />
              <div>
                <p><strong>Sarah</strong> just posted a photo from Moscow</p>
                <span>20 Secs ago</span>
              </div>
            </div>

            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/men/76.jpg" alt="" />
              <div>
                <p><strong>John</strong> Published a post from Sydney</p>
                <span>1 min ago</span>
              </div>
            </div>

            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/women/50.jpg" alt="" />
              <div>
                <p><strong>Julia</strong> Updated her status from London</p>
                <span>5 mins ago</span>
              </div>
            </div>

            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/women/33.jpg" alt="" />
              <div>
                <p><strong>Sophia</strong> Share a photo from Virginia</p>
                <span>10 mins ago</span>
              </div>
            </div>

            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/women/5.jpg" alt="" />
              <div>
                <p><strong>Linda</strong> just posted a photo from Toronto</p>
                <span>20 mins ago</span>
              </div>
            </div>
          </div>

          <div className="feed-column">
            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="" />
              <div>
                <p><strong>Nora</strong> Shared an article from Ohio</p>
                <span>22 mins ago</span>
              </div>
            </div>

            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/women/22.jpg" alt="" />
              <div>
                <p><strong>Addison</strong> Created a poll from Barcelona</p>
                <span>23 mins ago</span>
              </div>
            </div>

            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/women/21.jpg" alt="" />
              <div>
                <p><strong>Diana</strong> Posted a video from Captown</p>
                <span>27 mins ago</span>
              </div>
            </div>

            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/women/12.jpg" alt="" />
              <div>
                <p><strong>Sarah</strong> Shared friend's post from Moscow</p>
                <span>30 mins ago</span>
              </div>
            </div>

            <div className="feed-item">
              <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="" />
              <div>
                <p><strong>Emma</strong> Started a new job at Toronto</p>
                <span>33 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}


export default Page1;