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

  const [selectedType, setSelectedType] = useState("movie");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [actorQuery, setActorQuery] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "true");
      document.body.style.backgroundColor = savedTheme === "true" ? "#1b1b1d" : "#fff";
    }
  }, []);

  useEffect(() => {
    if (selectedFavoritesList !== null) return;

    const getContent = async () => {
      const contentData = await fetchContent(selectedType, currentPage, searchQuery, selectedGenre, selectedYear, actorQuery);
      setContent(contentData);
    };
    getContent();
  }, [selectedType, currentPage, searchQuery, selectedGenre, selectedYear, actorQuery, selectedFavoritesList]);

  const fetchToken = async () => {
    if (isAuthenticated) {
      try {
        const token = await getIdTokenClaims();
        if (!token || !token.__raw) {
          return;
        }

        localStorage.setItem("token", token.__raw);

        const response = await fetch("https://take5-movies-backend.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.__raw }),
        });

        const data = await response.json();

        if (data.success && data.appToken) {
          localStorage.setItem("appToken", data.appToken);
        }
      } catch (error) {}
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("https://take5-movies-backend.onrender.com/api/movies/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setFavorites(response.data.favorites);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (isAuthenticated) fetchFavorites();
  }, [isAuthenticated]);

  const fetchFavoritesMovies = async (listIndex) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("https://take5-movies-backend.onrender.com/api/movies/favorites", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            const selectedList = response.data.favorites[listIndex];

            if (!selectedList) return;

            if (!selectedList.movies || selectedList.movies.length === 0) {
                setFavoriteMovies([]);
                return;
            }

            const movieRequests = selectedList.movies.map((id) =>
                axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_TMDB_API_KEY}`)
            );

            const responses = await Promise.all(movieRequests);
            setFavoriteMovies(responses.map((res) => res.data));
        }
    } catch (error) {}
  };

  const handleSelectFavoritesList = (listIndex) => {
    if (selectedFavoritesList === listIndex) {
      setSelectedFavoritesList(null);
      setFavoriteMovies([]);
    } else {
      setSelectedFavoritesList(listIndex);
      fetchFavoritesMovies(listIndex);
    }
  };

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