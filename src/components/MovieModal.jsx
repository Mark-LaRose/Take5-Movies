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

function MovieModal({ movie, isOpen, onClose, onAddToFavorites }) {
  const [trailer, setTrailer] = useState(null);
  const [selectedFavorite, setSelectedFavorite] = useState(null); 

  useEffect(() => {
    if (movie && isOpen) {
      fetchTrailer(movie.id);
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
      console.error("Error fetching trailer:", error);
      setTrailer(null);
    }
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
                      opacity: selectedFavorite === index ? 1 : 0.4, 
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      setSelectedFavorite(index);
                      onAddToFavorites(movie, index);
                    }}
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