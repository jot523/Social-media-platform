import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaGooglePlusG,
  FaPinterestP,
  FaLinkedinIn,
} from "react-icons/fa";
import "../css/Contact.css";

function Contact() {
  return (
    <section className="contact-section">
      <div className="contact-container">
       
        <div className="contact-form-box">
          <h2>Leave a Message</h2>

          <form className="contact-form">
            <div className="input-group">
              <span className="input-icon">
                <FaUser />
              </span>
              <input type="text" placeholder="Enter your name *" />
            </div>

            <div className="input-group">
              <span className="input-icon">
                <FaEnvelope />
              </span>
              <input type="email" placeholder="Enter your email *" />
            </div>

            <div className="input-group">
              <span className="input-icon">
                <FaPhoneAlt />
              </span>
              <input type="text" placeholder="Enter your phone *" />
            </div>

            <div className="textarea-group">
              <textarea placeholder="Leave a message for us *"></textarea>
            </div>

            <button type="submit" className="send-btn">
              Send a Message
            </button>
          </form>
        </div>

        
        <div className="contact-info-box">
          <h2>Reach Us</h2>

          <div className="info-item">
            <div className="info-icon">
              <FaPhoneAlt />
            </div>
            <p>+1 (234) 222 0754</p>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <FaEnvelope />
            </div>
            <p>info@thunder-team.com</p>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <FaMapMarkerAlt />
            </div>
            <p>228 Park Ave S NY, USA</p>
          </div>

          <div className="social-icons">
            <a href="/"><FaFacebookF /></a>
            <a href="/"><FaTwitter /></a>
            <a href="/"><FaGooglePlusG /></a>
            <a href="/"><FaPinterestP /></a>
            <a href="/"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;