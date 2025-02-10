import React from "react";
import "../styles/header.css";
import { BsSun, BsMoon } from "react-icons/bs"; // Icons for theme toggle

function Header({ toggleTheme, isDarkMode }) {
  return (
    <header className={`header-container ${isDarkMode ? "dark-header" : "light-header"}`}>
      {/* Title & Clapperboard */}
      <div className="title-container">
        <h1 className="title">Take 5</h1>
        <h2 className="subtitle">Movies</h2>
      </div>
      <img src="/images/ClapperBoard.png" alt="Clapperboard" className="clapperboard" />
      <div className="header-description">
        <p className="header-text">Your one-stop spot for everything movies!</p>
      </div>
      {/* Search Bar (Moved Down) */}
      <div className="search-bar">
        <input type="text" placeholder="Search Movies..." className="search-input" />
        <select className="genre-dropdown">
          <option>Genre</option>
          <option>Action</option>
          <option>Adventure</option>
          <option>Animation</option>
          <option>Biography</option>
          <option>Comedy</option>
          <option>Drama</option>
          <option>Fantasy</option>
          <option>History</option>
          <option>Horror</option>
          <option>Romance</option>
          <option>Sci-Fi</option>
          <option>Thriller</option>
          <option>Western</option>
        </select>
        <select className="year-dropdown limited-size">
          <option>Year</option>
          {Array.from({ length: 80 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return <option key={year}>{year}</option>;
          })}
        </select>
        <input type="text" placeholder="Search by Actor/Actress..." className="actor-input" />
      </div>

      {/* Top Right Controls */}
      <div className="top-right-controls">
        {/* Animated Login Button */}
        <div class="animated-border-wrapper">
          <div class="animated-border-effect">
            <div></div>
          </div>
          <button class="animated-border">Login</button>
        </div>

        {/* Theme Toggle */}
        <div className="theme-toggle">
          <BsSun className="sun-icon" />
          <label className="toggle-wrapper">
            <input
              type="checkbox"
              id="themeToggle"
              onChange={toggleTheme}
              checked={isDarkMode}
            />
            <span className="toggle-slider"></span>
          </label>
          <BsMoon className="moon-icon" />
        </div>
      </div>
    </header>
  );
}

export default Header;