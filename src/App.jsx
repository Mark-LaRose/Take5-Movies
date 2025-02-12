import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import MovieGrid from "./components/MovieGrid.jsx";
import { fetchContent } from "./api";
import "./styles/app.css";
import { Container, Row, Col } from "react-bootstrap";

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [content, setContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter State
  const [selectedType, setSelectedType] = useState("movie"); // "movie" or "tv"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [actorQuery, setActorQuery] = useState("");

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "true");
      document.body.style.backgroundColor = savedTheme === "true" ? "#1b1b1d" : "#fff";
    }
  }, []);

  // Fetch movies/TV shows when filters change
  useEffect(() => {
    const getContent = async () => {
      const contentData = await fetchContent(selectedType, currentPage, searchQuery, selectedGenre, selectedYear, actorQuery);
      setContent(contentData);
    };
    getContent();
  }, [selectedType, currentPage, searchQuery, selectedGenre, selectedYear, actorQuery]);

  // Function to toggle theme
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode);
      document.body.style.backgroundColor = newMode ? "#1b1b1d" : "#fff";
      return newMode;
    });
  };

  return (
    <div className={isDarkMode ? "dark-mode" : "light-mode"}>
      <Header
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        isLoggedIn={isAuthenticated}
        toggleLogin={isAuthenticated ? logout : loginWithRedirect}
        selectedType={selectedType}
        setSelectedType={setSelectedType} // NEW: Toggle between Movies/TV
        setSearchQuery={setSearchQuery}
        setSelectedGenre={setSelectedGenre}
        setSelectedYear={setSelectedYear}
        setActorQuery={setActorQuery}
      />

      <Container fluid>
        <Row>
          <Col md={2} className="sidebar-container">
            <Sidebar isLoggedIn={isAuthenticated} />
          </Col>

          <Col md={10} className="movie-grid-container">
            {isAuthenticated && <h1 className="welcome-message">Welcome <br />{user.name}!</h1>}

            <MovieGrid movies={content} setCurrentPage={setCurrentPage} currentPage={currentPage} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;