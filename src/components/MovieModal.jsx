import React, { useState, useEffect } from "react";
import "../styles/moviemodal.css";
import { FaStar, FaTimes } from "react-icons/fa";
import YouTube from "react-youtube";
import axios from "axios";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

const starColors = [
  "deepskyblue", "teal", "lime", "purple", "indigo", "royalblue", 
  "navy", "grey", "gold", "darkorange", "red", "magenta"
];

function MovieModal({ movie, isOpen, onClose, onAddToFavorites }) {
  const [trailer, setTrailer] = useState(null);
  const [highlightedStars, setHighlightedStars] = useState([]);

  useEffect(() => {
    if (movie && isOpen) {
        setHighlightedStars([]);
        fetchTrailer(movie.id);
        fetchFavorites(movie.id);
    }
  }, [movie, isOpen]);

  const fetchTrailer = async (movieId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const trailers = response.data.results;
      const officialTrailer = trailers?.find((vid) => vid.type === "Trailer");

      setTrailer(officialTrailer ? officialTrailer.key : null);
    } catch (error) {
      setTrailer(null);
    }
  };

  const fetchFavorites = async (movieId) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://localhost:5000/api/movies/favorites", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            const movieInLists = response.data.favorites
                .map((list, index) => list.movies.includes(String(movieId)) ? index : -1)
                .filter(index => index !== -1);

            setHighlightedStars(movieInLists);
        }
    } catch (error) {}
  };

  const handleStarClick = async (index) => {
    const isHighlighted = highlightedStars.includes(index);
    let updatedStars;

    if (isHighlighted) {
        updatedStars = highlightedStars.filter(star => star !== index);
    } else {
        updatedStars = [...highlightedStars, index];
    }

    setHighlightedStars(updatedStars);

    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        await axios.post(
            "http://localhost:5000/api/movies/updateFavorites",
            {
                movieId: movie.id,
                favoriteListIndexes: [index],
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        await fetchFavorites(movie.id);
    } catch (error) {}
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="movie-modal-overlay" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        <FaTimes className="close-button" onClick={onClose} />

        <div className="modal-content">
          <div className="modal-image">
            <img 
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/images/placeholder.png"} 
              alt={movie.title} 
            />
          </div>

          <div className="modal-details">
            <h2>{movie.title}</h2>
            <p className="description">{movie.overview || "No description available."}</p>

            {trailer ? (
              <div className="trailer-container">
                <YouTube videoId={trailer} opts={{ width: "100%", height: "250px" }} />
              </div>
            ) : (
              <p className="no-trailer">No trailer available.</p>
            )}

            <div className="favorites-section">
              <label>Add to Favorites:</label>
              <div className="favorites-stars">
                {starColors.map((color, index) => (
                  <FaStar
                    key={index}
                    className="favorite-star"
                    style={{
                      color: color,
                      opacity: highlightedStars.includes(index) ? 1 : 0.4,
                      cursor: "pointer"
                    }}
                    onClick={() => handleStarClick(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieModal;