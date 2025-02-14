import React, { useState, useEffect } from "react";
import "../styles/moviemodal.css"; // Import modal styles
import { FaStar, FaTimes } from "react-icons/fa"; // Star & Close icons
import YouTube from "react-youtube";
import axios from "axios";

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

// Define star colors (should match sidebar)
const starColors = [
  "deepskyblue", "teal", "lime", "purple", "indigo", "royalblue", 
  "navy", "grey", "gold", "darkorange", "red", "magenta"
];

function MovieModal({ movie, isOpen, onClose, onAddToFavorites, userFavorites }) {
  const [trailer, setTrailer] = useState(null);
  const [highlightedStars, setHighlightedStars] = useState([]);

  useEffect(() => {
    if (movie && isOpen) {
      fetchTrailer(movie.id);
      // Update the highlighted stars when the modal opens
      if (userFavorites) {
        const movieId = movie.id;
        const updatedHighlightedStars = userFavorites
          .map((list, index) => list.movies.some((m) => m.id === movieId) ? index : -1)
          .filter((index) => index !== -1); // Get indexes where the movie is in the list
        setHighlightedStars(updatedHighlightedStars);
      }
    }
  }, [movie, isOpen, userFavorites]);

  const fetchTrailer = async (movieId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
      );
      const trailers = response.data.results;
      const officialTrailer = trailers?.find((vid) => vid.type === "Trailer");

      setTrailer(officialTrailer ? officialTrailer.key : null);
    } catch (error) {
      console.error("Error fetching trailer:", error);
      setTrailer(null);
    }
  };

  const handleStarClick = (index) => {
    const updatedStars = [...highlightedStars];
    if (updatedStars.includes(index)) {
      // Remove from favorites if already selected
      updatedStars.splice(updatedStars.indexOf(index), 1);
    } else {
      // Add to favorites if not selected
      updatedStars.push(index);
    }
    setHighlightedStars(updatedStars);
    onAddToFavorites({ id: String(movie.id) }, updatedStars);
  };

  if (!isOpen || !movie) return null; // Don't render if modal is closed

  return (
    <div className="movie-modal-overlay" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <FaTimes className="close-button" onClick={onClose} />

        <div className="modal-content">
          {/* Movie Image */}
          <div className="modal-image">
            <img 
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/images/placeholder.png"} 
              alt={movie.title} 
            />
          </div>

          {/* Movie Details */}
          <div className="modal-details">
            <h2>{movie.title}</h2>
            <p className="description">{movie.overview || "No description available."}</p>

            {/* Trailer Section */}
            {trailer ? (
              <div className="trailer-container">
                <YouTube videoId={trailer} opts={{ width: "100%", height: "250px" }} />
              </div>
            ) : (
              <p className="no-trailer">No trailer available.</p>
            )}

            {/* Star-Based Favorites Selection */}
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
                    onClick={() => handleStarClick(index)} // Handle star click to toggle movie in list
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