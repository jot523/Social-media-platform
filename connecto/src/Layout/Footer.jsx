import React from 'react'
import { FaFacebookF, FaTwitter, FaGooglePlusG, FaPinterestP, FaLinkedinIn } from "react-icons/fa";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "../css/Page1.css";
import photo1 from "../img/photo1.png" 
function Footer() {
  return (
    <div>
      
            <div className="friend-footer">
              <div className="footer-top">
                <div className="footer-brand">
                  <h2>
                    <span className="footer-logo-icon"><img src={photo1} alt="" /></span> CONNECTO
                  </h2>
      
                  <div className="social-icons">
                    <FaFacebookF />
                    <FaTwitter />
                    <FaGooglePlusG />
                    <FaPinterestP />
                    <FaLinkedinIn />
                  </div>
                </div>
      
                <div className="footer-links">
                  <h4>For individuals</h4>
                  <ul>
                    <li>Signup</li>
                    <li>login</li>
                    <li>Explore</li>
                    <li>Finder app</li>
                    <li>Features</li>
                    <li>Language settings</li>
                  </ul>
                </div>
      
                <div className="footer-links">
                  <h4>For businesses</h4>
                  <ul>
                    <li>Business signup</li>
                    <li>Business login</li>
                    <li>Benefits</li>
                    <li>Resources</li>
                    <li>Advertise</li>
                    <li>Setup</li>
                  </ul>
                </div>
      
                <div className="footer-links">
                  <h4>About</h4>
                  <ul>
                    <li>About us</li>
                    <li>Contact us</li>
                    <li>Privacy Policy</li>
                    <li>Terms</li>
                    <li>Help</li>
                  </ul>
                </div>
      
                <div className="footer-contact">
                  <h4>Contact Us</h4>
      
                  <div className="contact-item">
                    <span><FaPhoneAlt /></span>
                    <p>+1 (234) 222 0754</p>
                  </div>
      
                  <div className="contact-item">
                    <span> <FaEnvelope /></span>
                    <p>info@thunder-team.com</p>
                  </div>
      
                  <div className="contact-item">
                    <span><FaMapMarkerAlt /></span>
                    <p>228 Park Ave S NY, USA</p>
                  </div>
                </div>
              </div>
      
              <div className="footer-bottom">
                Desinged by AMARJOT KAUR
              </div>
            </div>
    </div>
  )
}

export default Footer
