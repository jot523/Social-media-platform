import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import styles from "../css/Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerBrand}>
          <h3>CONNECTO</h3>
          <p>Connect $ Share  </p>
        </div>

        <div className={styles.footerLinks}>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#help">Help</a>
        </div>
        <div className={styles.footerSocials}>
          {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
            <button key={i} className={styles.socialBtn}>
              <Icon />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>Designed  by ❤️ AMARJOT KAUR</p>
      </div>
    </footer>
  );
}

export default Footer;
