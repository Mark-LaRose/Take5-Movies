import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import MovieGrid from "./components/MovieGrid.jsx";
import { fetchContent } from "./api";
import "./styles/app.css";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, getIdTokenClaims } = useAuth0();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [content, setContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]); // Add favorites state

  // Search & Filter State
  const [selectedType, setSelectedType] = useState("movie");
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
      console.log("Fetching content with filters:", {
        selectedType,
        currentPage,
        searchQuery,
        selectedGenre,
        selectedYear,
        actorQuery,
      });
      const contentData = await fetchContent(selectedType, currentPage, searchQuery, selectedGenre, selectedYear, actorQuery);
      console.log("Fetched content data:", contentData);
      setContent(contentData);
    };
    getContent();
  }, [selectedType, currentPage, searchQuery, selectedGenre, selectedYear, actorQuery]);

  // Fetch the ID token and send it to the backend
  const fetchToken = async () => {
    if (isAuthenticated) {
      try {
        const token = await getIdTokenClaims();
        if (!token || !token.__raw) {
          console.error("❌ No token received from Auth0.");
          return;
        }

        console.log("ID Token:", token.__raw);

        // Store token in localStorage
        localStorage.setItem("token", token.__raw);

        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: token.__raw }),
        });

        const data = await response.json();
        console.log("Backend Response:", data);

        if (data.success && data.appToken) {
          localStorage.setItem("appToken", data.appToken); // Store app token if needed
        }
      } catch (error) {
        console.error("❌ Error fetching token:", error);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ User is authenticated, fetching token...");
      fetchToken(); // Fetch token after login
    }
  }, [isAuthenticated]); // ✅ Removed fetchToken from dependency array to fix warning

  // onAddToFavorites function
  const onAddToFavorites = async (movie, highlightedStars) => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        console.error("❌ No token found in localStorage");
        return;
      }
  
      console.log("🔹 Sending request to update favorites", {
        movieId: movie.id,
        favoriteListIndexes: highlightedStars,
      });
  
      const response = await axios.post(
        "http://localhost:5000/api/movies/updateFavorites",
        {
          userId: user.sub, // Include userId here!
          movieId: movie.id,
          favoriteListIndexes: highlightedStars,
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Keep this for authentication
        }
      );
  
      if (response.data.success) {
        console.log("✅ Favorites updated successfully", response.data);
      } else {
        console.error("❌ Failed to update favorites", response.data);
      }
    } catch (error) {
      console.error("❌ Error adding/removing from favorites:", error);
    }
  };

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
        setSelectedType={setSelectedType}
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
            {isAuthenticated && <h1 className="welcome-message">Welcome, {user.name}!</h1>}
            <MovieGrid 
              movies={content} 
              setCurrentPage={setCurrentPage} 
              currentPage={currentPage}
              onAddToFavorites={onAddToFavorites}
              favorites={favorites}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;