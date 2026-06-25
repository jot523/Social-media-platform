/**
 * Footer Component
 */

import React from 'react';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footerContainer}>
      <div className={styles.footerBrand}>
        <div className={styles.logoIcon}>C</div>
        <span className={styles.logoText}>CONNECTO</span>
      </div>
      <p className={styles.footerCopy}>© 2026 Connecto. Made with 💜 by Amarjot Kaur</p>
      <div className={styles.footerLinks}>
        {['About', 'Privacy', 'Terms', 'Help'].map(link => (
          <a key={link} href="#/" className={styles.footerLink}>{link}</a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;