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
  const [highlightedStars, setHighlightedStars] = useState([]);

  useEffect(() => {
    if (movie && isOpen) {
        setHighlightedStars([]); // ✅ Reset before fetching new data
        fetchTrailer(movie.id);
        fetchFavorites(movie.id); // ✅ Ensure correct list highlighting
    }
  }, [movie, isOpen]); // ✅ Runs when movie or modal state changes

  // Fetch Trailer
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

  // Fetch which favorite lists the movie is in
  const fetchFavorites = async (movieId) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        console.log(`📌 Fetching which lists contain movie: ${movieId}`);

        const response = await axios.get("http://localhost:5000/api/movies/favorites", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            console.log("✅ Full favorites response:", response.data.favorites);
            
            // Ensure correct mapping from favorites structure
            const movieInLists = response.data.favorites
                .map((list, index) => list.movies.includes(String(movieId)) ? index : -1)
                .filter(index => index !== -1); // ✅ Keep only valid indexes

            console.log(`🎬 Movie ${movieId} found in lists:`, movieInLists);
            setHighlightedStars(movieInLists);
        }
    } catch (error) {
        console.error("❌ Error fetching favorites:", error);
    }
  };

  // Handle Star Click
  const handleStarClick = async (index) => {
    const isHighlighted = highlightedStars.includes(index);
    let updatedStars;

    if (isHighlighted) {
        updatedStars = highlightedStars.filter(star => star !== index);
    } else {
        updatedStars = [...highlightedStars, index];
    }

    setHighlightedStars(updatedStars); // ✅ Immediate UI update

    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        console.log(`📌 Toggling movie ${movie.id} in list index: ${index}`);

        const response = await axios.post(
            "http://localhost:5000/api/movies/updateFavorites",
            {
                movieId: movie.id,
                favoriteListIndexes: [index],
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
            console.log("✅ Favorites updated successfully", response.data);
            await fetchFavorites(movie.id); // ✅ Ensure stars update correctly
        } else {
            console.error("❌ Failed to update favorites", response.data);
        }
    } catch (error) {
        console.error("❌ Error adding/removing from favorites:", error);
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