import React, { useState } from "react";
import "../styles/moviegrid.css";
import MovieModal from "./MovieModal";
import axios from "axios";

const MovieGrid = ({ movies, setCurrentPage, currentPage }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <>
      <div className="movie-grid">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div
              className="movie-card"
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="movie-image"
              />
              <h3>{movie.title}</h3>
              <p>{movie.release_date ? movie.release_date.split("-")[0] : "N/A"}</p>
            </div>
          ))
        ) : (
          <p className="loading-text">No movies found...</p>
        )}
      </div>

      {/* Pagination Hidden when showing favorites */}
      {currentPage && (
        <div className="pagination-controls">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            ← Prev
          </button>
          <span> Page {currentPage} </span>
          <button onClick={() => setCurrentPage((prev) => prev + 1)}>
            Next →
          </button>
        </div>
      )}

      <MovieModal movie={selectedMovie} isOpen={!!selectedMovie} onClose={() => setSelectedMovie(null)} />
    </>
  );
};

export default MovieGrid;