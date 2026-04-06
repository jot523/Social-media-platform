import React from "react";
import "../css/Timelineabout.css";
import {
  FaInfoCircle,
  FaBriefcase,
  FaMapMarkerAlt,
  FaHeart,
  FaBicycle,
  FaCoffee,
  FaPlane,
  FaUtensils,
  FaGlobe,
} from "react-icons/fa";
import cox from "../img/cox.jpg";
   
import cook from "../img/cook.jpg"; 

function Timelineabout() {
  const experiences = [
    { company: "Envato", date: "Seller - 1 February 2012 to present" },
    { company: "Envato", date: "Seller - 1 February 2013 to present" },
    { company: "Envato", date: "Seller - 1 February 2013 to present" },
  ];

  const activities = [
    "Sarah Commented on a Photo",
    "Sarah has posted a photo",
    "Sarah liked her friend's post",
    "Sarah shared an album",
  ];

  const activityTime = ["5 mins ago", "an hour ago", "4 hours ago", "a day ago"];

  return (
    <div className="profile-page">
      <div className="profile-container">
    
        <div className="cover-section">
          <img src={cox} alt="cover" className="cover-img" />

          <div className="cover-overlay">
            <div className="profile-image-wrap">
              <img src={cook} alt="profile" className="profile-img" />
            </div>

            <div className="top-nav">
              <a href="/">Timeline</a>
              <a href="/">About</a>
              <a href="/">Album</a>
              <a href="/">Friends</a>
            </div>

            <div className="followers-box">
              <span>1,299 people following her</span>
              <button>Add Friend</button>
            </div>
          </div>
        </div>

        
        <div className="content-section">
       
          <div className="main-content">
            <div className="user-header">
              <div>
                <h2>Sarah Cruz</h2>
                <p>Creative Director</p>
              </div>
            </div>

            <div className="info-block">
              <h4>
                <FaInfoCircle className="section-icon blue" /> Personal Information
              </h4>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                velit esse cillum dolore eu fugiat nulla pariatur. Excepteur.
              </p>
            </div>

            <div className="info-block">
              <h4>
                <FaBriefcase className="section-icon blue" /> Work Experiences
              </h4>

              {experiences.map((item, index) => (
                <div className="experience-item" key={index}>
                  <div className="exp-icon"></div>
                  <div>
                    <h5>{item.company}</h5>
                    <p>{item.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="info-block">
              <h4>
                <FaMapMarkerAlt className="section-icon blue" /> Location
              </h4>
              <p>228 Park Eve, New York</p>

              <div className="map-box">
                <div className="map-error">
                  <span className="error-icon">!</span>
                  <h3>Sorry! Something went wrong.</h3>
                  <p>
                    This page didn&apos;t load Google Maps correctly. See the JavaScript
                    console for technical details.
                  </p>
                </div>
              </div>
            </div>

            <div className="info-block">
              <h4>
                <FaHeart className="section-icon blue" /> Interests
              </h4>
              <div className="interest-icons">
                <FaBicycle />
                <FaCoffee />
                <FaPlane />
                <FaUtensils />
              </div>
            </div>

            <div className="info-block">
              <h4>
                <FaGlobe className="section-icon blue" /> Language
              </h4>
              <ul className="language-list">
                <li>Russian</li>
                <li>English</li>
              </ul>
            </div>
          </div>

        
          <div className="activity-sidebar">
            <h4>Sarah&apos;s activity</h4>

            {activities.map((item, index) => (
              <div className="activity-item" key={index}>
                <div className="activity-line"></div>
                <div className="activity-text">
                  <a href="/">{item}</a>
                  <span>{activityTime[index]}</span>
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