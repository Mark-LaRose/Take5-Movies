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
  const [favorites, setFavorites] = useState([]); 
  const [selectedFavoritesList, setSelectedFavoritesList] = useState(null);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  // ✅ Restore Search & Filter State
  const [selectedType, setSelectedType] = useState("movie");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [actorQuery, setActorQuery] = useState("");

  // ✅ Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "true");
      document.body.style.backgroundColor = savedTheme === "true" ? "#1b1b1d" : "#fff";
    }
  }, []);

  // ✅ Fetch movies/TV shows when filters change
  useEffect(() => {
    if (selectedFavoritesList !== null) return;

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
  }, [selectedType, currentPage, searchQuery, selectedGenre, selectedYear, actorQuery, selectedFavoritesList]);

  // ✅ Fetch Token After Login
  const fetchToken = async () => {
    if (isAuthenticated) {
      try {
        const token = await getIdTokenClaims();
        if (!token || !token.__raw) {
          console.error("❌ No token received from Auth0.");
          return;
        }

        console.log("ID Token:", token.__raw);
        localStorage.setItem("token", token.__raw);

        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.__raw }),
        });

        const data = await response.json();
        console.log("Backend Response:", data);

        if (data.success && data.appToken) {
          localStorage.setItem("appToken", data.appToken);
        }
      } catch (error) {
        console.error("❌ Error fetching token:", error);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ User is authenticated, fetching token...");
      fetchToken();
    }
  }, [isAuthenticated]);

  // ✅ Fetch User's Favorites
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/movies/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setFavorites(response.data.favorites);
        console.log("✅ User favorites fetched:", response.data.favorites);
      }
    } catch (error) {
      console.error("❌ Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchFavorites();
  }, [isAuthenticated]);

  // ✅ Fetch Movies from Selected Favorite List
  const fetchFavoritesMovies = async (listIndex) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        console.log(`📌 Fetching movies for list index: ${listIndex}`);

        const response = await axios.get("http://localhost:5000/api/movies/favorites", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            console.log("✅ Full favorites response:", response.data.favorites);
            const selectedList = response.data.favorites[listIndex];

            if (!selectedList) {
                console.warn("⚠️ Selected list does not exist at this index.");
                return;
            }

            if (!selectedList.movies || selectedList.movies.length === 0) {
                console.warn("⚠️ No movies found in the selected favorites list.");
                setFavoriteMovies([]);
                return;
            }

            console.log("🎥 Movie IDs in selected list:", selectedList.movies);

            const movieRequests = selectedList.movies.map((id) =>
                axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_TMDB_API_KEY}`)
            );

            const responses = await Promise.all(movieRequests);
            setFavoriteMovies(responses.map((res) => res.data));
            console.log("🎬 Successfully fetched movies:", responses.map((res) => res.data));
        }
    } catch (error) {
        console.error("❌ Error fetching favorite movies:", error);
    }
  };

  // ✅ Handle Selecting Favorites List
  const handleSelectFavoritesList = (listIndex) => {
    if (selectedFavoritesList === listIndex) {
      setSelectedFavoritesList(null);
      setFavoriteMovies([]);
    } else {
      setSelectedFavoritesList(listIndex);
      fetchFavoritesMovies(listIndex);
    }
  };

  // ✅ Function to Toggle Theme
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
            <Sidebar isLoggedIn={isAuthenticated} onSelectFavoritesList={handleSelectFavoritesList} />
          </Col>
          <Col md={10} className="movie-grid-container">
            <MovieGrid
              movies={selectedFavoritesList !== null ? favoriteMovies : content}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;