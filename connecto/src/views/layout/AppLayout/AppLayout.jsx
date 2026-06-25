/**
 * AppLayout Component
 * Main layout wrapper for the application
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import styles from './AppLayout.module.css';

const AppLayout = () => {
  return (
    <div className={styles.appLayout}>
      <Navbar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;