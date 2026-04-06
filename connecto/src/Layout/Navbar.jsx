import React, { useState } from "react";
import "../css/Navbar.css";
import { FaSearch } from "react-icons/fa";
import photo1 from '../img/photo1.png'
import { NavLink } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="navbar">
      <div className="logo">

        <h2>CONNECTO</h2>
      </div>

      <div className="search-box">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Search friends, photos, videos" />
      </div>
      <div className="menu">
        <NavLink to="/">Home</NavLink>
         <NavLink to="newsfeed">Newsfeed ▾</NavLink>
         <NavLink to="Timelineabout">Timeline ▾</NavLink>
         <NavLink to="">All Pages ▾</NavLink>
        <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
      </div>

    </div>
  );
}

export default Navbar;