import React from "react";
import "../styles/header.css";
import { BsSun, BsMoon } from "react-icons/bs";
import { useAuth0 } from "@auth0/auth0-react";

function Header({ 
  toggleTheme, isDarkMode, isLoggedIn, toggleLogin, 
  selectedType, setSelectedType, setSearchQuery, 
  setSelectedGenre, setSelectedYear, setActorQuery 
}) {
  const { loginWithPopup, logout, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const handleLogin = () => {
    loginWithPopup()
      .then(async () => {
        const userToken = await getAccessTokenSilently({
          audience: "https://dev-pp4hwzpv0zmbbko2.us.auth0.com/api/v2/",
          scope: "read:current_user",
        });

        localStorage.setItem("token", userToken);
        toggleLogin();
      })
      .catch(() => {});
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    toggleLogin();
  };

  const genreOptions = selectedType === "movie" ? [
    { value: "28", label: "Action" },
    { value: "12", label: "Adventure" },
    { value: "16", label: "Animation" },
    { value: "35", label: "Comedy" },
    { value: "80", label: "Crime" },
    { value: "99", label: "Documentary" },
    { value: "18", label: "Drama" },
    { value: "10751", label: "Family" },
    { value: "14", label: "Fantasy" },
    { value: "36", label: "History" },
    { value: "27", label: "Horror" },
    { value: "10402", label: "Music" },
    { value: "9648", label: "Mystery" },
    { value: "10749", label: "Romance" },
    { value: "878", label: "Sci-Fi" },
    { value: "53", label: "Thriller" },
    { value: "10752", label: "War" },
    { value: "37", label: "Western" }
  ] : [
    { value: "10759", label: "Action & Adventure" },
    { value: "16", label: "Animation" },
    { value: "35", label: "Comedy" },
    { value: "80", label: "Crime" },
    { value: "99", label: "Documentary" },
    { value: "18", label: "Drama" },
    { value: "10751", label: "Family" },
    { value: "10762", label: "Kids" },
    { value: "9648", label: "Mystery" },
    { value: "10763", label: "News" },
    { value: "10764", label: "Reality" },
    { value: "10765", label: "Sci-Fi & Fantasy" },
    { value: "10766", label: "Soap" },
    { value: "10767", label: "Talk" },
    { value: "10768", label: "War & Politics" },
    { value: "37", label: "Western" }
  ];

  const blockedWordsRegex = /(porn|porno|xxx|xx|adult|erotic|sex|hentai|lesb|homo)/i;

  return (
    <header className={`header-container ${isDarkMode ? "dark-header" : "light-header"}`}>
      <div className="title-container">
        <h1 className="title">Take 5</h1>
        <h2 className="subtitle">Movies</h2>
      </div>
      <img src="/images/ClapperBoard.png" alt="Clapperboard" className="clapperboard" />
      <div className="header-description">
        <p className="header-text">Your one-stop spot for everything Movies!</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder={selectedType === "movie" ? "Search Movies..." : "Search TV Shows..."}
          className="search-input"
          onChange={(e) => {
            const inputValue = e.target.value.toLowerCase();
            const containsBlockedWord = blockedWordsRegex.test(inputValue);

            if (!containsBlockedWord) {
              setSearchQuery(e.target.value);
            } else {
              setSearchQuery("");
            }
          }}
        />

        <select className="genre-dropdown" onChange={(e) => {
          setSelectedGenre(e.target.value);
        }}>
          <option value="">Genre</option>
          {genreOptions.map((genre) => (
            <option key={genre.value} value={genre.value}>{genre.label}</option>
          ))}
        </select>

        <select className="year-dropdown limited-size" onChange={(e) => {
          setSelectedYear(e.target.value);
        }}>
          <option value="">Year</option>
          {Array.from({ length: 80 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>

        <input
          type="text"
          placeholder="Search by Actor/Actress..."
          className="actor-input"
          onChange={(e) => {
            setActorQuery(e.target.value);
          }}
        />
      </div>

      <div className="top-right-controls">
        <div className="animated-border-wrapper">
          <div className="animated-border-effect">
            <div></div>
          </div>
          <button className="animated-border" onClick={isAuthenticated ? handleLogout : handleLogin}>
            {isAuthenticated ? "Logout" : "Login"}
          </button>
        </div>

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